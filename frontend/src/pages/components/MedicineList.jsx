import { FaPills, FaEdit, FaTrash, FaPlus, FaClock, FaCalendar, FaStickyNote, FaEye, FaCheckCircle, FaExclamationTriangle, FaChevronDown, FaChevronUp, FaTimes } from "react-icons/fa";
import { useState } from "react";
import ModernInput from "./ModernInput";
import ModernDropdown from "./ModernDropdown";
import ModernTextarea from "./ModernTextarea";
import ModernButton from "./ModernButton";
import DateTimePicker from "./DateTimePicker";

export default function MedicineList({ 
  medicines, 
  editingMedicine, 
  setEditingMedicine, 
  medicineForm, 
  setMedicineForm,
  fetchMedicines 
}) {
  const [expandedMedicine, setExpandedMedicine] = useState(null);
  const [showRefillModal, setShowRefillModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [refillDays, setRefillDays] = useState("");

  const getStatusColor = (medicine) => {
    if (!medicine.startDate) return 'gray';
    let start;
    if (medicine.startDate.includes('/')) {
      const [dd, mm, yyyy] = medicine.startDate.split('/');
      start = new Date(`${yyyy}-${mm}-${dd}`);
    } else {
      // Fix timezone issue by creating date in local timezone
      const [year, month, day] = medicine.startDate.split('-');
      start = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    const end = new Date(start);
    end.setDate(start.getDate() + medicine.durationDays);
    const now = new Date();
    
    if (now > end) return 'red'; // Expired
    if (now > end.getTime() - 2 * 24 * 60 * 60 * 1000) return 'yellow'; // Ending soon
    return 'green'; // Active
  };

  const getStatusText = (medicine) => {
    const status = getStatusColor(medicine);
    switch (status) {
      case 'red': return 'Expired';
      case 'yellow': return 'Ending Soon';
      case 'green': return 'Active';
      default: return 'Not Started';
    }
  };

  const toggleExpanded = (medicineId) => {
    if (expandedMedicine === medicineId) {
      setExpandedMedicine(null);
    } else {
      setExpandedMedicine(medicineId);
    }
  };

  const handleRefillClick = (medicine) => {
    setSelectedMedicine(medicine);
    setRefillDays("");
    setShowRefillModal(true);
  };

  const handleDeleteClick = (medicine) => {
    setSelectedMedicine(medicine);
    setShowDeleteModal(true);
  };

  const handleRefillSubmit = async () => {
    if (!refillDays || refillDays === "" || !selectedMedicine) {
      alert("Please select a number of days to add");
      return;
    }
    
    try {
      const totalDays = Number(selectedMedicine.durationDays) + Number(refillDays);
      let start;
      if (selectedMedicine.startDate.includes('/')) {
        const [dd, mm, yyyy] = selectedMedicine.startDate.split('/');
        start = new Date(`${yyyy}-${mm}-${dd}`);
      } else {
        // Fix timezone issue by creating date in local timezone
        const [year, month, day] = selectedMedicine.startDate.split('-');
        start = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
      const end = new Date(start);
      end.setDate(start.getDate() + totalDays);
      const endDate = end.toISOString().slice(0, 10);
      
      const response = await fetch(`http://localhost:5000/api/medicines/${selectedMedicine._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durationDays: totalDays, endDate })
      });
      
      if (response.ok) {
        await fetchMedicines();
        setShowRefillModal(false);
        setSelectedMedicine(null);
        setRefillDays("");
      } else {
        alert("Failed to refill medicine. Please try again.");
      }
    } catch (error) {
      console.error("Error refilling medicine:", error);
      alert("Error refilling medicine. Please try again.");
    }
  };

  const handleDeleteSubmit = async () => {
    if (selectedMedicine) {
      await fetch(`http://localhost:5000/api/medicines/${selectedMedicine._id}`, {
        method: 'DELETE'
      });
      fetchMedicines();
      setShowDeleteModal(false);
      setSelectedMedicine(null);
    }
  };

  // Helper to add a new reminder time field
  const addTimeField = () => {
    setMedicineForm((prev) => ({
      ...prev,
      reminderTimes: [...(prev.reminderTimes || []), ""]
    }));
  };

  // Update a specific reminder time in the medicine form
  const handleTimeChange = (idx, value) => {
    setMedicineForm((prev) => {
      const reminderTimes = [...(prev.reminderTimes || [])];
      reminderTimes[idx] = value;
      return { ...prev, reminderTimes };
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <FaPills className="text-purple-600" size={18} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Medicine List</h2>
            <p className="text-gray-500 text-sm">{medicines.length} medicines tracked</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-500">Active</span>
          </div>
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-xs text-gray-500">Ending</span>
          </div>
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-xs text-gray-500">Expired</span>
          </div>
        </div>
      </div>
      
      {medicines.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaPills className="text-gray-400" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No medicines added yet</h3>
          <p className="text-gray-500 mb-6">Start by adding your first medicine using the form on the left</p>
          <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">💡</span>
              </div>
              <div>
                <h4 className="font-semibold text-blue-800 text-sm">Quick Tip</h4>
                <p className="text-blue-700 text-sm mt-1">
                  You can upload a prescription image to automatically fill in medicine details!
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {medicines.map((medicine) => {
            const statusColor = getStatusColor(medicine);
            const statusText = getStatusText(medicine);
            const isExpanded = expandedMedicine === medicine._id;
            
            return (
              <div key={medicine._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200">
                {editingMedicine === medicine._id ? (
                  <div className="p-4 bg-blue-50">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Edit Medicine</h3>
                        <div className="flex space-x-2">
                          <button
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                            onClick={async () => {
                              await fetch(`http://localhost:5000/api/medicines/${medicine._id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(medicineForm)
                              });
                              setEditingMedicine(null);
                              fetchMedicines();
                            }}
                          >
                            <FaCheckCircle size={14} />
                            Save
                          </button>
                          <button
                            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors"
                            onClick={() => setEditingMedicine(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ModernInput
                          value={medicineForm.name !== undefined ? medicineForm.name : ''}
                          onChange={e => setMedicineForm({ ...medicineForm, name: e.target.value })}
                          placeholder="Medicine Name"
                          icon={<FaPills />}
                        />
                        <ModernInput
                          value={medicineForm.dosage !== undefined ? medicineForm.dosage : ''}
                          onChange={e => setMedicineForm({ ...medicineForm, dosage: e.target.value })}
                          placeholder="Dosage"
                          icon={<FaPills />}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ModernInput
                          value={medicineForm.timesPerDay !== undefined && medicineForm.timesPerDay !== null ? medicineForm.timesPerDay : ''}
                          type="number"
                          min={1}
                          onChange={e => {
                            const value = e.target.value;
                            setMedicineForm({ 
                              ...medicineForm, 
                              timesPerDay: value === '' ? '' : Number(value) 
                            });
                          }}
                          placeholder="Times per Day"
                          icon={<FaClock />}
                        />
                        <ModernDropdown
                          value={medicineForm.beforeAfterFood || ''}
                          onChange={(value) => setMedicineForm({ ...medicineForm, beforeAfterFood: value })}
                          options={[
                            { value: 'Before food', label: 'Before food' },
                            { value: 'After food', label: 'After food' },
                            { value: 'Any time', label: 'Any time' }
                          ]}
                          placeholder="When to Take"
                          icon={<FaClock />}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ModernInput
                          value={medicineForm.durationDays !== undefined && medicineForm.durationDays !== null ? medicineForm.durationDays : ''}
                          type="number"
                          min={1}
                          onChange={e => {
                            const value = e.target.value;
                            setMedicineForm({ 
                              ...medicineForm, 
                              durationDays: value === '' ? '' : Number(value) 
                            });
                          }}
                          placeholder="Duration (days)"
                          icon={<FaCalendar />}
                        />
                        <DateTimePicker
                          value={medicineForm.startDate !== undefined ? medicineForm.startDate : ''}
                          onChange={value => setMedicineForm({ ...medicineForm, startDate: value })}
                          type="date"
                          placeholder="Start Date"
                          className="w-full"
                        />
                      </div>

                      {/* Reminder Times */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Reminder Times</label>
                        <div className="space-y-2">
                          {(medicineForm.reminderTimes || [""]).map((time, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                              <input
                                type="time"
                                value={time}
                                onChange={(e) => handleTimeChange(idx, e.target.value)}
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              {idx === (medicineForm.reminderTimes || [""]).length - 1 && (
                                <button
                                  type="button"
                                  onClick={addTimeField}
                                  className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                  <FaPlus size={14} />
                                </button>
                              )}
                              {(medicineForm.reminderTimes || [""]).length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newTimes = medicineForm.reminderTimes.filter((_, index) => index !== idx);
                                    setMedicineForm({ ...medicineForm, reminderTimes: newTimes, timesPerDay: newTimes.length });
                                  }}
                                  className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                  title="Remove this time"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="text-sm text-gray-500 mt-2">
                          <p>💡 Enter time in 24-hour format (e.g., 14:30 for 2:30 PM)</p>
                        </div>
                      </div>
                      
                      <ModernTextarea
                        value={medicineForm.notes !== undefined ? medicineForm.notes : ''}
                        onChange={e => setMedicineForm({ ...medicineForm, notes: e.target.value })}
                        placeholder="Notes"
                        rows="3"
                        icon={<FaStickyNote />}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Compact Card Header */}
                    <div 
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleExpanded(medicine._id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <FaPills className="text-purple-600" size={14} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800">{medicine.name}</h3>
                            <p className="text-sm text-gray-600">{medicine.dosage}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {/* Status badge */}
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            statusColor === 'green' ? 'bg-green-100 text-green-800' :
                            statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {statusColor === 'green' && <FaCheckCircle className="mr-1" size={8} />}
                            {statusColor === 'yellow' && <FaExclamationTriangle className="mr-1" size={8} />}
                            {statusColor === 'red' && <FaExclamationTriangle className="mr-1" size={8} />}
                            {statusText}
                          </div>
                          
                          {/* Expand/Collapse icon */}
                          <div className="text-gray-400">
                            {isExpanded ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
                          </div>
                        </div>
                      </div>
                      
                      {/* Quick info row */}
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <FaClock size={12} />
                          <span>{medicine.timesPerDay}x/day</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <FaCalendar size={12} />
                          <span>{medicine.durationDays} days</span>
                        </span>
                        {medicine.startDate && (
                          <span>Started: {medicine.startDate}</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-4">
                        {/* Medicine details grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <FaClock className="text-blue-500" size={12} />
                              <span>{medicine.timesPerDay}x per day</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <FaCalendar className="text-blue-500" size={12} />
                              <span>{medicine.beforeAfterFood}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Duration:</span> {medicine.durationDays} days
                            </div>
                            {medicine.startDate && (
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Started:</span> {medicine.startDate}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Reminders */}
                        {medicine.reminderTimes?.length > 0 && (
                          <div className="bg-blue-50 rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-2">
                              <FaClock className="text-blue-500" size={14} />
                              <span className="text-sm font-medium text-blue-800">Reminders</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {medicine.reminderTimes.map((time, idx) => (
                                <span key={idx} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                                  {time}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Notes */}
                        {medicine.notes && (
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="flex items-start space-x-2">
                              <FaStickyNote className="text-gray-500 mt-0.5" size={14} />
                              <div>
                                <span className="text-sm font-medium text-gray-700">Notes:</span>
                                <p className="text-sm text-gray-600 mt-1">{medicine.notes}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Action buttons */}
                        <div className="flex space-x-3 pt-2">
                          <button
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
                            onClick={() => handleRefillClick(medicine)}
                          >
                            <FaPlus size={12} />
                            Refill
                          </button>
                          
                          <button
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
                            onClick={() => {
                              setEditingMedicine(medicine._id);
                              // Ensure all fields are properly initialized with actual values
                              setMedicineForm({
                                name: medicine.name || '',
                                dosage: medicine.dosage || '',
                                timesPerDay: medicine.timesPerDay || '',
                                beforeAfterFood: medicine.beforeAfterFood || '',
                                durationDays: medicine.durationDays || '',
                                startDate: medicine.startDate || '',
                                notes: medicine.notes || '',
                                reminderTimes: medicine.reminderTimes || ['']
                              });
                            }}
                          >
                            <FaEdit size={12} />
                            Edit
                          </button>
                          
                          <button
                            className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
                            onClick={() => handleDeleteClick(medicine)}
                          >
                            <FaTrash size={12} />
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

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
              How many additional days would you like to add to <strong>{selectedMedicine?.name}</strong>?
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
              <ModernButton
                onClick={() => setShowRefillModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </ModernButton>
              <ModernButton
                onClick={handleRefillSubmit}
                variant="primary"
                className="flex-1"
              >
                Refill
              </ModernButton>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Delete Medicine</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete <strong>{selectedMedicine?.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <ModernButton
                onClick={() => setShowDeleteModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </ModernButton>
              <ModernButton
                onClick={handleDeleteSubmit}
                variant="danger"
                className="flex-1"
              >
                Delete
              </ModernButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 