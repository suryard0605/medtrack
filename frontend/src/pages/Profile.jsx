import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaSignOutAlt } from "react-icons/fa";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function Profile({ user }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [members, setMembers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [medicines, setMedicines] = useState([]);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [medicineForm, setMedicineForm] = useState({});

  // DOB selector states
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  const handleDobSelect = () => {
    const formattedDob = `${selectedDay.toString().padStart(2, "0")}-${selectedMonth
      .toString()
      .padStart(2, "0")}-${selectedYear}`;
    setFormData({ ...formData, dob: formattedDob });
    setShowDobPicker(false);
  };

  // ✅ Fetch main user + members
  useEffect(() => {
    if (!user) return;

    // Fetch main user profile (to get name)
    fetch(`http://localhost:5000/api/users/${user.uid}`)
      .then((res) => res.json())
      .then((data) => {
        // ✅ Make sure we have a proper name for display
        if (!data.name && user.displayName) {
          data.name = user.displayName;
        }
        setProfile(data);

        if (!selected) {
          setSelected({ ...data, isMainUser: true });
          setFormData(data);
        }
      });

    // Fetch members
    fetch(`http://localhost:5000/api/members/${user.uid}`)
      .then((res) => res.json())
      .then((data) => setMembers(data));
  }, [user]);

  // ✅ Fetch medicines for selected profile
  useEffect(() => {
    if (!selected) return;

    let url = `http://localhost:5000/api/medicines?userId=${user.uid}`;
    if (!selected.isMainUser) {
      url += `&memberId=${selected._id}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const filtered = selected.isMainUser
          ? data.filter((m) => !m.memberId)
          : data.filter((m) => m.memberId === selected._id);
        setMedicines(filtered);
      })
      .catch((err) => console.error("Medicine fetch error:", err));
  }, [selected, user]);

  // ✅ Select profile
  const handleSelect = (person, isMainUser = false) => {
    setSelected({ ...person, isMainUser });
    setFormData(person);
    setEditMode(false);
    setEditingMedicine(null);
  };

  // ✅ Edit profile input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Save profile
  const handleSave = async () => {
    const url = selected.isMainUser
      ? `http://localhost:5000/api/users/${selected.uid}`
      : `http://localhost:5000/api/members/${selected._id}`;

    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      const updated = await res.json();
      if (selected.isMainUser) {
        setProfile(updated);
        setSelected({ ...updated, isMainUser: true });
      } else {
        setMembers((prev) =>
          prev.map((m) => (m._id === updated._id ? updated : m))
        );
        setSelected({ ...updated, isMainUser: false });
      }
      setFormData(updated);
      setEditMode(false);
    }
  };

  // ✅ Delete medicine
  const handleDeleteMedicine = async (id) => {
    if (!window.confirm("Delete this medicine?")) return;

    const res = await fetch(`http://localhost:5000/api/medicines/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setMedicines((prev) => prev.filter((m) => m._id !== id));
    }
  };

  // ✅ Edit medicine
  const handleEditMedicine = (med) => {
    setEditingMedicine(med._id);
    setMedicineForm(med);
  };

  // ✅ Handle medicine input change
  const handleMedicineChange = (e) => {
    setMedicineForm({ ...medicineForm, [e.target.name]: e.target.value });
  };

  // ✅ Save edited medicine
  const handleSaveMedicine = async () => {
    const res = await fetch(
      `http://localhost:5000/api/medicines/${editingMedicine}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(medicineForm),
      }
    );

    if (res.ok) {
      const updatedMed = await res.json();
      setMedicines((prev) =>
        prev.map((m) => (m._id === updatedMed._id ? updatedMed : m))
      );
      setEditingMedicine(null);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header with Back and Logout */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <FaArrowLeft size={16} />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            <FaSignOutAlt size={14} />
            <span>Logout</span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Profile <span className="text-blue-600">Management</span>
          </h1>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto">
            Manage your profile and family member information
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar: Profiles */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Profiles</h2>
            
            {/* Main User */}
            <button
              onClick={() => handleSelect(profile, true)}
              className={`w-full text-left px-4 py-3 rounded-lg mb-3 transition-all duration-200 ${
                selected?.isMainUser 
                  ? "bg-blue-500 text-white shadow-md" 
                  : "bg-gray-50 hover:bg-gray-100 text-gray-700"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">👤</span>
                </div>
                <div>
                  <p className="font-medium">
                    {profile.name || user.displayName || "Main User"}
                  </p>
                  <p className="text-sm opacity-75">Primary Account</p>
                </div>
              </div>
            </button>

            {/* Members */}
            {members.map((m) => (
              <button
                key={m._id}
                onClick={() => handleSelect(m, false)}
                className={`w-full text-left px-4 py-3 rounded-lg mb-3 transition-all duration-200 ${
                  !selected?.isMainUser && selected?._id === m._id
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold">👥</span>
                  </div>
                  <div>
                    <p className="font-medium">{m.memberName}</p>
                    <p className="text-sm opacity-75">Family Member</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Profile Details + Medicines */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Profile Information</h3>
              
              {editMode ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      name={selected.isMainUser ? "name" : "memberName"}
                      value={formData.name || formData.memberName || ""}
                      onChange={handleChange}
                      placeholder="Enter full name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      name="phone"
                      value={formData.phone || ""}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowDobPicker(!showDobPicker)}
                        className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-left"
                      >
                        <span
                          className={formData.dob ? "text-gray-900" : "text-gray-500"}
                        >
                          {formData.dob ? formData.dob : "Date of Birth"}
                        </span>
                      </button>
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>

                      {/* DOB Picker Modal */}
                      {showDobPicker && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
                          <div className="grid grid-cols-3 gap-4">
                            {/* Day */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Day
                              </label>
                              <select
                                value={selectedDay}
                                onChange={(e) =>
                                  setSelectedDay(parseInt(e.target.value))
                                }
                                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                {Array.from(
                                  {
                                    length: getDaysInMonth(selectedYear, selectedMonth),
                                  },
                                  (_, i) => i + 1
                                ).map((day) => (
                                  <option key={day} value={day}>
                                    {day}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Month */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Month
                              </label>
                              <select
                                value={selectedMonth}
                                onChange={(e) =>
                                  setSelectedMonth(parseInt(e.target.value))
                                }
                                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                {months.map((month, index) => (
                                  <option key={index + 1} value={index + 1}>
                                    {month}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Year */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Year
                              </label>
                              <select
                                value={selectedYear}
                                onChange={(e) =>
                                  setSelectedYear(parseInt(e.target.value))
                                }
                                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                {Array.from(
                                  { length: 100 },
                                  (_, i) => new Date().getFullYear() - i
                                ).map((year) => (
                                  <option key={year} value={year}>
                                    {year}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="flex gap-2 mt-4">
                            <button
                              type="button"
                              onClick={handleDobSelect}
                              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowDobPicker(false)}
                              className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age
                    </label>
                    <input
                      name="age"
                      type="number"
                      min="0"
                      max="120"
                      value={formData.age || ""}
                      onChange={handleChange}
                      placeholder="Enter age"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={formData.email || ""}
                      onChange={handleChange}
                      placeholder="Enter email address"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medical History
                    </label>
                    <textarea
                      name="medicalHistory"
                      value={formData.medicalHistory || ""}
                      onChange={handleChange}
                      placeholder="Enter medical history"
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSave}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Name</p>
                      <p className="text-lg text-gray-800">
                        {selected.isMainUser
                          ? selected.name || user.displayName || "Not set"
                          : selected.memberName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="text-lg text-gray-800">{selected.phone || "Not set"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                      <p className="text-lg text-gray-800">{selected.dob || "Not set"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Age</p>
                      <p className="text-lg text-gray-800">{selected.age || "Not set"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-lg text-gray-800">{selected.email || "Not set"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Account Type</p>
                      <p className="text-lg text-gray-800">
                        {selected.isMainUser ? "Primary User" : "Family Member"}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Medical History</p>
                    <p className="text-lg text-gray-800 bg-gray-50 p-4 rounded-lg">
                      {selected.medicalHistory || "No medical history recorded"}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Edit Profile
                  </button>
                </div>
              )}
            </div>

            {/* Medicines */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Medications</h3>
              
              {medicines.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">💊</span>
                  </div>
                  <p className="text-gray-500">No medications assigned to this profile</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {medicines.map((med) => (
                    <div
                      key={med._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      {editingMedicine === med._id ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Medicine Name
                              </label>
                              <input
                                name="name"
                                value={medicineForm.name || ""}
                                onChange={handleMedicineChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Medicine Name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Dosage
                              </label>
                              <input
                                name="dosage"
                                value={medicineForm.dosage || ""}
                                onChange={handleMedicineChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Dosage"
                              />
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={handleSaveMedicine}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingMedicine(null)}
                              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 text-lg">{med.name}</h4>
                            <p className="text-gray-600 mb-2">{med.dosage}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>📅 {med.timesPerDay}x/day</span>
                              <span>⏱️ {med.durationDays} days</span>
                              {med.beforeAfterFood && (
                                <span>🍽️ {med.beforeAfterFood}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditMedicine(med)}
                              className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteMedicine(med._id)}
                              className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}