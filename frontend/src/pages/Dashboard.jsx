import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";

import Header from "./components/Header";
import NotificationsModal from "./components/NotificationsModal";
import MemberSelector from "./components/MemberSelector";
import AddMemberForm from "./components/AddMemberForm";
import AddMedicineForm from "./components/AddMedicineForm";
import MedicineList from "./components/MedicineList";

export default function Dashboard({ user }) {
  // State management
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [ocrText, setOcrText] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [medicineForm, setMedicineForm] = useState({});
  const [mainUser, setMainUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Medicine form state
  const [form, setForm] = useState({
    name: "",
    dosage: "",
    beforeAfterFood: "Before food",
    timesPerDay: 1,
    durationDays: 1,
    startDate: "",
    notes: "",
    reminderTimes: [""]
  });

  // Member form state
  const [memberForm, setMemberForm] = useState({
    memberName: "",
    age: "",
    dob: "",
    phone: "",
    email: "",
    medicalHistory: ""
  });

  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [showNotificationBox, setShowNotificationBox] = useState(false);
  const [showPopupFunction, setShowPopupFunction] = useState(null);
  const [dismissedNotifications, setDismissedNotifications] = useState(new Set());
  // Refill modal state
  const [showRefillModal, setShowRefillModal] = useState(false);
  const [refillMedicine, setRefillMedicine] = useState(null);
  const [refillDays, setRefillDays] = useState("");
  // Load dismissed notifications and active notifications from localStorage on component mount
  useEffect(() => {
    const savedDismissed = localStorage.getItem('dismissedNotifications');
    if (savedDismissed) {
      setDismissedNotifications(new Set(JSON.parse(savedDismissed)));
    }
    
    const savedNotifications = localStorage.getItem('activeNotifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
  }, []);

  // Save dismissed notifications to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('dismissedNotifications', JSON.stringify([...dismissedNotifications]));
  }, [dismissedNotifications]);

  // Save active notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('activeNotifications', JSON.stringify(notifications));
  }, [notifications]);

  // Update a specific reminder time in the medicine form
  const handleTimeChange = (idx, value) => {
    setForm((prev) => {
      const reminderTimes = [...prev.reminderTimes];
      reminderTimes[idx] = value;
      return { ...prev, reminderTimes };
    });
  };

  // Fetch user's name
  useEffect(() => {
    if (!user) return;
    fetch(`http://localhost:5000/api/users/${user.uid}`)
      .then((res) => res.json())
      .then((data) => {
        setMainUser(data);
        setDisplayName(data?.name || user.email);
        setSelectedMember('main');
      })
      .catch(() => setDisplayName(user.email));
    fetchMembers();
  }, [user]);

  // Fetch members
  const fetchMembers = async () => {
    if (!user) return;
    try {
      const res = await fetch(`http://localhost:5000/api/members/${user.uid}`);
      const data = await res.json();
      setMembers(data);
      // Default to 'main' (Users tab) instead of first member
      if (!selectedMember) {
        setSelectedMember('main');
      }
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching members:", err);
      setIsLoading(false);
    }
  };

  // Fetch medicines for selected member or main user
  useEffect(() => {
    if (!user || !selectedMember) return;
    if (selectedMember === 'main') {
      fetch(`http://localhost:5000/api/medicines?userId=${user.uid}`)
        .then((res) => res.json())
        .then((data) => {
          setMedicines(data.filter((m) => !m.memberId));
        })
        .catch((err) => console.error('Error fetching medicines:', err));
    } else {
      fetchMedicines();
    }
  }, [selectedMember, user]);

  // Fetch medicines for selected member
  const fetchMedicines = async () => {
    if (!user || !selectedMember) return;
    try {
      if (selectedMember === 'main') {
        // Fetch medicines for main user (no memberId)
        const res = await fetch(`http://localhost:5000/api/medicines?userId=${user.uid}`);
        const data = await res.json();
        setMedicines(data.filter((m) => !m.memberId));
      } else {
        // Fetch medicines for specific member
        const res = await fetch(
          `http://localhost:5000/api/medicines?userId=${user.uid}&memberId=${selectedMember}`
        );
        const data = await res.json();
        setMedicines(data);
      }
    } catch (err) {
      console.error('Error fetching medicines:', err);
    }
  };

  // Add medicine
  const handleAddMedicine = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      let start;
      if (form.startDate.includes('/')) {
        const [dd, mm, yyyy] = form.startDate.split('/');
        start = new Date(`${yyyy}-${mm}-${dd}`);
      } else {
        // Fix timezone issue by creating date in local timezone
        const [year, month, day] = form.startDate.split('-');
        start = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
      const end = new Date(start);
      end.setDate(start.getDate() + form.durationDays);
      const endDate = end.toISOString().slice(0, 10);
      
      await fetch("http://localhost:5000/api/medicines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          userId: user.uid,
          memberId: selectedMember === 'main' ? undefined : selectedMember,
          endDate
        })
      });

      setForm({
        name: "",
        dosage: "",
        beforeAfterFood: "Before food",
        timesPerDay: 1,
        durationDays: 1,
        startDate: "",
        notes: "",
        reminderTimes: [""]
      });

      // Refresh medicines list
      fetchMedicines();
    } catch (err) {
      console.error("Error adding medicine:", err);
    }
  };

  // Add member handler
  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await fetch("http://localhost:5000/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          memberName: memberForm.memberName,
          email: memberForm.email,
          age: memberForm.age,
          dob: memberForm.dob,
          phone: memberForm.phone,
          medicalHistory: memberForm.medicalHistory
        })
      });
      setIsAddingMember(false);
      fetchMembers();
    } catch (err) {
      console.error("Error adding member:", err);
    }
  };

  // Helper to add a new reminder time field
  const addTimeField = () => {
    setForm((prev) => ({
      ...prev,
      reminderTimes: [...prev.reminderTimes, ""]
    }));
  };

  // Add refill notifications for all medicines
  useEffect(() => {
    if (!medicines || medicines.length === 0) return;
    const now = new Date();
    let refillNotifications = [];
    medicines.forEach((med) => {
      if (!med.startDate || !med.durationDays) return;
      let start;
      if (med.startDate.includes('/')) {
        const [dd, mm, yyyy] = med.startDate.split('/');
        start = new Date(`${yyyy}-${mm}-${dd}`);
      } else {
        // Fix timezone issue by creating date in local timezone
        const [year, month, day] = med.startDate.split('-');
        start = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
      const end = new Date(start);
      end.setDate(start.getDate() + med.durationDays);
      const refillDay = new Date(end);
      refillDay.setDate(end.getDate() - 1);
      if (now.toDateString() === refillDay.toDateString()) {
        const notification = {
          id: `refill-${med._id}-${now.toDateString()}`,
          type: 'refill',
          medicineId: med._id,
          name: med.name,
          msg: `🔄 Refill Alert: ${med.name}${med.dosage ? ` (${med.dosage})` : ''} course ends tomorrow. Consider refilling to continue your treatment.`,
        };
        refillNotifications.push(notification);
      }
    });
    setNotifications((prev) => {
      const nonRefill = prev.filter(n => !(n.type === 'refill' && refillNotifications.some(rn => rn.medicineId === n.medicineId)));
      const newRefills = refillNotifications.filter(rn => {
        const savedNotifications = JSON.parse(localStorage.getItem('activeNotifications') || '[]');
        const alreadySaved = savedNotifications.some(n => n.id === rn.id);
        return !prev.some(n => n.medicineId === rn.medicineId) && 
               !dismissedNotifications.has(rn.id) &&
               !alreadySaved;
      });
      return [...nonRefill, ...newRefills];
    });
  }, [medicines, dismissedNotifications]);

  // Add medicine reminders for all medicines at scheduled times
  useEffect(() => {
    if (!medicines || medicines.length === 0) return;
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    
    medicines.forEach((med) => {
      if (!med.reminderTimes || med.reminderTimes.length === 0) return;
      med.reminderTimes.forEach((time) => {
        if (time === currentTime) {
          const notificationId = `reminder-${med._id}-${time}-${now.toDateString()}`;
          
          // Check if notification already exists for today
          const notificationExists = notifications.some(n => n.id === notificationId);
          
          // Check if this notification was dismissed
          const isDismissed = dismissedNotifications.has(notificationId);
          
          // Check if this notification already exists in localStorage
          const savedNotifications = JSON.parse(localStorage.getItem('activeNotifications') || '[]');
          const alreadySaved = savedNotifications.some(n => n.id === notificationId);
          
          // Check if this medicine already has a notification for this time today
          const medicineHasNotification = notifications.some(n => 
            n.medicineId === med._id && 
            n.time === time && 
            n.type === 'reminder'
          );
          
          // Check if this medicine has already been logged for today (taken or skipped)
          const checkMedicineLogs = async () => {
            try {
              const today = new Date();
              const response = await fetch(`http://localhost:5000/api/medicineLogs?userId=${user.uid}&medicineId=${med._id}&date=${today.toDateString()}`);
              const logs = await response.json();
              
              // Check if this medicine is marked as completed for today in localStorage
              const completedMedicines = JSON.parse(localStorage.getItem('completedMedicines') || '[]');
              const medicineKey = `${med._id}-${today.toDateString()}`;
              const isCompleted = completedMedicines.includes(medicineKey);
              
              // If there's already a log for this medicine today or it's marked as completed, don't create notification
              if (logs.length > 0 || isCompleted) {
                return;
              }
              
              if (!notificationExists && !isDismissed && !alreadySaved && !medicineHasNotification) {
                const notification = {
                  id: notificationId,
                  type: 'reminder',
                  medicineId: med._id,
                  name: med.name,
                  time,
                  msg: `⏰ Time to take ${med.name}${med.dosage ? ` (${med.dosage})` : ''} at ${time}${med.beforeAfterFood ? ` - ${med.beforeAfterFood}` : ''}`,
                  isMissed: false
                };
                
                setNotifications(prev => [...prev, notification]);
              }
            } catch (error) {
              console.error('Error checking medicine logs:', error);
            }
          };
          
          checkMedicineLogs();
        }
      });
    });
  }, [medicines, dismissedNotifications, user]);

   // Handle notification actions
  const handleRefillSubmit = async () => {
    if (!refillDays || refillDays === "" || !refillMedicine) {
      alert("Please enter a number of days to add");
      return;
    }
    
    try {
      const totalDays = Number(refillMedicine.durationDays) + Number(refillDays);
      let start;
      if (refillMedicine.startDate.includes('/')) {
        const [dd, mm, yyyy] = refillMedicine.startDate.split('/');
        start = new Date(`${yyyy}-${mm}-${dd}`);
      } else {
        // Fix timezone issue by creating date in local timezone
        const [year, month, day] = refillMedicine.startDate.split('-');
        start = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
      const end = new Date(start);
      end.setDate(start.getDate() + totalDays);
      const endDate = end.toISOString().slice(0, 10);
      
      const response = await fetch(`http://localhost:5000/api/medicines/${refillMedicine._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durationDays: totalDays, endDate })
      });
      
      if (response.ok) {
        await fetchMedicines();
        setShowRefillModal(false);
        setRefillMedicine(null);
        setRefillDays("");
        
        // Now remove the notification
        const medicineNotifications = notifications.filter(n => n.medicineId === refillMedicine._id);
        medicineNotifications.forEach(notification => {
          dismissedNotifications.add(notification.id);
        });
        setDismissedNotifications(new Set(dismissedNotifications));
        setNotifications((prev) => prev.filter((n) => n.medicineId !== refillMedicine._id));
        
        // Update localStorage
        const savedNotifications = JSON.parse(localStorage.getItem('activeNotifications') || '[]');
        const updatedNotifications = savedNotifications.filter(n => n.medicineId !== refillMedicine._id);
        localStorage.setItem('activeNotifications', JSON.stringify(updatedNotifications));
      } else {
        alert("Failed to refill medicine. Please try again.");
      }
    } catch (error) {
      console.error("Error refilling medicine:", error);
      alert("Error refilling medicine. Please try again.");
    }
  };

  // Handle notification actions
  const handleNotificationAction = async (id, action, medicineId) => {
    try {
      // Find the medicine to get memberId
      const medicine = medicines.find(m => m._id === medicineId);
      
      // Create medicine log entry for Taken/Skipped actions
      if (action === 'Taken' || action === 'Skipped') {
        const logEntry = {
          userId: user.uid,
          memberId: medicine?.memberId || undefined, // Use medicine's memberId or undefined for main user
          medicineId: medicineId,
          status: action === 'Taken' ? 'taken' : 'missed', // Convert action to status
          time: new Date()
        };

        // Save to medicine logs
        await fetch("http://localhost:5000/api/medicineLogs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(logEntry)
        });
      }

      if (action === 'Refill') {
        const med = medicines.find(m => m._id === medicineId);
        if (med) {
          setRefillMedicine(med);
          setRefillDays("");
          setShowRefillModal(true);
          return; // Don't proceed with notification removal yet
        }
      } else if (action === 'Cured') {
        try {
          await fetch(`http://localhost:5000/api/medicines/${medicineId}`, {
            method: 'DELETE'
          });
          fetchMedicines();
        } catch (err) {
          console.error('Error deleting medicine:', err);
        }
      }
      
      // Mark all notifications for this medicine as dismissed
      const medicineNotifications = notifications.filter(n => n.medicineId === medicineId);
      medicineNotifications.forEach(notification => {
        dismissedNotifications.add(notification.id);
      });
      setDismissedNotifications(new Set(dismissedNotifications));
      
      // Remove ALL notifications for this medicine (both reminder and refill)
      setNotifications((prev) => prev.filter((n) => n.medicineId !== medicineId));
      
      // Update localStorage to remove the acted-upon notifications
      const savedNotifications = JSON.parse(localStorage.getItem('activeNotifications') || '[]');
      const updatedNotifications = savedNotifications.filter(n => n.medicineId !== medicineId);
      localStorage.setItem('activeNotifications', JSON.stringify(updatedNotifications));
      
      // Mark this medicine as completed for today in localStorage
      const completedMedicines = JSON.parse(localStorage.getItem('completedMedicines') || '[]');
      const today = new Date().toDateString();
      const medicineKey = `${medicineId}-${today}`;
      if (!completedMedicines.includes(medicineKey)) {
        completedMedicines.push(medicineKey);
        localStorage.setItem('completedMedicines', JSON.stringify(completedMedicines));
      }
    } catch (error) {
      console.error('Error handling notification action:', error);
    }
  };

  // Check for missed notifications when user logs in
  useEffect(() => {
    if (!user || !medicines.length) return;

    const checkMissedNotifications = async () => {
      try {
        // Get medicine logs for the last 24 hours
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        const response = await fetch(`http://localhost:5000/api/medicineLogs?userId=${user.uid}&from=${yesterday.toISOString()}`);
        const logs = await response.json();
        
        // Find medicines with reminders that haven't been logged
        const missedNotifications = [];
        medicines.forEach(med => {
          if (!med.reminderTimes || med.reminderTimes.length === 0) return;
          
          med.reminderTimes.forEach(time => {
            const today = new Date();
            const reminderTime = new Date();
            const [hours, minutes] = time.split(':');
            reminderTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            
            // Check if this reminder time has passed today and no log exists
            if (reminderTime < today) {
              const logExists = logs.some(log => 
                log.medicineId === med._id && 
                new Date(log.time).toDateString() === today.toDateString() &&
                log.status === 'taken'
              );
              
              if (!logExists) {
                missedNotifications.push({
                  id: `missed-${med._id}-${time}-${today.toDateString()}`,
                  type: 'reminder',
                  medicineId: med._id,
                  name: med.name,
                  time,
                  msg: `⏰ Missed: Take ${med.name}${med.dosage ? ` (${med.dosage})` : ''} at ${time}${med.beforeAfterFood ? ` - ${med.beforeAfterFood}` : ''}`,
                  isMissed: true
                });
              }
            }
          });
        });
        
        // Add missed notifications to the list
        if (missedNotifications.length > 0) {
          setNotifications(prev => {
            const existingMedicineIds = prev.map(n => n.medicineId);
            const savedNotifications = JSON.parse(localStorage.getItem('activeNotifications') || '[]');
            const newMissed = missedNotifications.filter(n => 
              !existingMedicineIds.includes(n.medicineId) && 
              !dismissedNotifications.has(n.id) &&
              !savedNotifications.some(saved => saved.id === n.id)
            );
            return [...prev, ...newMissed];
          });
        }
      } catch (error) {
        console.error('Error checking missed notifications:', error);
      }
    };

    checkMissedNotifications();
  }, [user, medicines]);

  // Real-time notification checker that runs every minute
  useEffect(() => {
    if (!medicines || medicines.length === 0) return;

    const checkForRealTimeNotifications = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      
      medicines.forEach((med) => {
        if (!med.reminderTimes || med.reminderTimes.length === 0) return;
        med.reminderTimes.forEach((time) => {
          if (time === currentTime) {
            const notificationId = `reminder-${med._id}-${time}-${now.toDateString()}`;
            
            // Check if notification already exists
            const notificationExists = notifications.some(n => n.id === notificationId);
            
            // Check if this notification was dismissed
            const isDismissed = dismissedNotifications.has(notificationId);
            
            // Check if this notification already exists in localStorage
            const savedNotifications = JSON.parse(localStorage.getItem('activeNotifications') || '[]');
            const alreadySaved = savedNotifications.some(n => n.id === notificationId);
            
            // Check if this medicine already has a notification for this time today
            const medicineHasNotification = notifications.some(n => 
              n.medicineId === med._id && 
              n.time === time && 
              n.type === 'reminder'
            );
            
            // Check if this medicine has already been logged for today
            const checkMedicineLogs = async () => {
              try {
                const today = new Date();
                const response = await fetch(`http://localhost:5000/api/medicineLogs?userId=${user.uid}&medicineId=${med._id}&date=${today.toDateString()}`);
                const logs = await response.json();
                
                // Check if this medicine is marked as completed for today in localStorage
                const completedMedicines = JSON.parse(localStorage.getItem('completedMedicines') || '[]');
                const medicineKey = `${med._id}-${today.toDateString()}`;
                const isCompleted = completedMedicines.includes(medicineKey);
                
                // If there's already a log for this medicine today or it's marked as completed, don't create notification
                if (logs.length > 0 || isCompleted) {
                  return;
                }
                
                if (!notificationExists && !isDismissed && !alreadySaved && !medicineHasNotification) {
                  const notification = {
                    id: notificationId,
                    type: 'reminder',
                    medicineId: med._id,
                    name: med.name,
                    time,
                    msg: `⏰ Time to take ${med.name}${med.dosage ? ` (${med.dosage})` : ''} at ${time}${med.beforeAfterFood ? ` - ${med.beforeAfterFood}` : ''}`,
                    isMissed: false
                  };
                  
                  setNotifications(prev => [...prev, notification]);
                }
              } catch (error) {
                console.error('Error checking medicine logs:', error);
              }
            };
            
            checkMedicineLogs();
          }
        });
      });
    };

    // Check immediately
    checkForRealTimeNotifications();

    // Set up interval to check every minute
    const interval = setInterval(checkForRealTimeNotifications, 60000); // 60000ms = 1 minute

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [medicines, dismissedNotifications, user, notifications]);

  // Show loading screen while fetching data
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading Dashboard...</h2>
          <p className="text-gray-500 mt-2">Please wait while we load your data</p>
        </div>
      </div>
    );
  }


  // If adding member → Show Add Member form
  if (isAddingMember) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header 
          user={user}
          displayName={displayName}
          notifications={notifications}
          showNotificationBox={showNotificationBox}
          setShowNotificationBox={setShowNotificationBox}
        />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <AddMemberForm 
            memberForm={memberForm}
            setMemberForm={setMemberForm}
            handleAddMember={handleAddMember}
            setIsAddingMember={setIsAddingMember}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
              <Header 
          user={user}
          displayName={displayName}
          notifications={notifications}
          showNotificationBox={showNotificationBox}
          setShowNotificationBox={(show) => {
            setShowNotificationBox(show);
            // If closing the notification box, mark all current notifications as dismissed
            if (!show) {
              const currentNotificationIds = notifications.map(n => n.id);
              currentNotificationIds.forEach(id => {
                dismissedNotifications.add(id);
              });
              setDismissedNotifications(new Set(dismissedNotifications));
              setNotifications([]); // Clear current notifications
              
              // Clear active notifications from localStorage when dismissing
              localStorage.removeItem('activeNotifications');
            }
          }}
          handleNotificationAction={handleNotificationAction}
          medicines={medicines}
          onNewNotification={setShowPopupFunction}
        />

      {/* Notifications Modal */}
      <NotificationsModal 
        showNotificationBox={showNotificationBox}
        setShowNotificationBox={setShowNotificationBox}
        notifications={notifications}
        handleNotificationAction={handleNotificationAction}
        medicines={medicines}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Your path to <span className="text-blue-600">health</span>
          </h1>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto">
            Manage your family's medications with ease and never miss a dose
          </p>
        </div>

        {/* Member Selector */}
        <div className="mb-12">
                  <MemberSelector 
          members={members}
          selectedMember={selectedMember}
          setSelectedMember={setSelectedMember}
          displayName={displayName}
          mainUser={mainUser}
          user={user}
          setIsAddingMember={setIsAddingMember}
        />
        </div>

        {/* Medicine Reminder Component */}
        <div className="mb-12">
  
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          {/* Left Column - Add Medicine Form */}
          <div>
            <AddMedicineForm 
              form={form}
              setForm={setForm}
              handleAddMedicine={handleAddMedicine}
              ocrLoading={ocrLoading}
              ocrText={ocrText}
              addTimeField={addTimeField}
              handleTimeChange={handleTimeChange}
            />
          </div>

          {/* Right Column - Medicine List */}
          <div>
            <MedicineList 
              medicines={medicines}
              editingMedicine={editingMedicine}
              setEditingMedicine={setEditingMedicine}
              medicineForm={medicineForm}
              setMedicineForm={setMedicineForm}
              fetchMedicines={fetchMedicines}
            />
          </div>
        </div>

        {/* Quick Tips Section */}
        <div className="mt-16 bg-white rounded-xl shadow-sm border border-gray-100 p-10">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">💡 Quick Tips</h3>
            <p className="text-gray-600 text-lg">Make the most of your MedTrack experience</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📷</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-3 text-lg">Upload Prescriptions</h4>
              <p className="text-gray-600">Take a photo of your prescription to auto-fill details</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">⏰</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-3 text-lg">Set Reminders</h4>
              <p className="text-gray-600">Never miss a dose with smart notifications</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">👨‍👩‍👧‍👦</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-3 text-lg">Family Management</h4>
              <p className="text-gray-600">Track medicines for your entire family</p>
            </div>
          </div>
        </div>
      </div>
{/* Refill Modal */}
      {showRefillModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Refill Medicine</h3>
              <button
                onClick={() => setShowRefillModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              How many additional days would you like to add to <strong>{refillMedicine?.name}</strong>?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Days to Add
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={refillDays}
                onChange={(e) => setRefillDays(e.target.value)}
                placeholder="Enter number of days (e.g., 7, 14, 30)"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                This will extend your medicine duration by the specified number of days
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowRefillModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRefillSubmit}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Refill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}