import { FaPills, FaUpload, FaClock, FaCalendar, FaStickyNote, FaCamera, FaMagic, FaCheck, FaArrowRight, FaPlus, FaEdit, FaUtensils } from "react-icons/fa";
import Tesseract from "tesseract.js";
import { useState } from "react";
import DateTimePicker from "./DateTimePicker";
import ModernDropdown from "./ModernDropdown";
import ModernInput from "./ModernInput";
import ModernTextarea from "./ModernTextarea";
import ModernButton from "./ModernButton";

export default function AddMedicineForm({ 
  form, 
  setForm, 
  handleAddMedicine, 
  ocrLoading, 
  ocrText,
  addTimeField,
  handleTimeChange
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [entryMethod, setEntryMethod] = useState(null); // 'ocr' or 'manual'

  // Reset form to initial state
  const resetForm = () => {
    setForm({
      name: "",
      dosage: "",
      beforeAfterFood: "Before food",
      timesPerDay: 1,
      durationDays: 7,
      startDate: "",
      notes: "",
      reminderTimes: [""]
    });
    setCurrentStep(1);
    setEntryMethod(null);
    setIsProcessing(false);
  };

  // Handle number of times selection
  const handleNumberOfTimesChange = (number) => {
    const defaultTimes = [
      "08:00", // Morning
      "12:00", // Noon
      "18:00", // Evening
      "22:00", // Night
      "14:00"  // Afternoon
    ];
    
    const newReminderTimes = Array(number).fill("").map((_, index) => {
      // Keep existing times if available, otherwise use default times
      return form.reminderTimes[index] || defaultTimes[index] || "";
    });
    
    setForm({
      ...form,
      timesPerDay: number,
      reminderTimes: newReminderTimes
    });
  };

  // Auto-fill medicine form from OCR text
  const autoFillMedicineForm = (text) => {
    const lower = text.toLowerCase();

    let nameMatch = lower.match(/medicine name\s*[:\-]?\s*([a-z0-9 ]+)/i);
    let name = nameMatch ? nameMatch[1].trim() : '';

    let dosageMatch = lower.match(/dosage\s*[:\-]?\s*(\d+)/i);
    let dosage = dosageMatch ? dosageMatch[1].trim() : '';

    let beforeAfterFood = lower.includes('after food') ? 'After food' : (lower.includes('before food') ? 'Before food' : 'Any time');

    let timesMatch = lower.match(/times per day\s*[:\-]?\s*(\d+)/i);
    if (!timesMatch) timesMatch = lower.match(/(\d+)x/i);
    let timesPerDay = timesMatch ? Math.min(parseInt(timesMatch[1]), 5) : 1; // Cap at 5 for the selector

    let durationMatch = lower.match(/duration.*?(\d+)\s*day/i);
    let durationDays = durationMatch ? parseInt(durationMatch[1]) : 7;

    let dateMatch = lower.match(/date\s*[:\-]?\s*(\d{2}\/\d{2}\/\d{4})/);
    let startDate = dateMatch ? dateMatch[1] : '';

    setForm((prev) => ({
      ...prev,
      name: name || prev.name,
      dosage: dosage || prev.dosage,
      beforeAfterFood,
      timesPerDay,
      durationDays,
      startDate: startDate || prev.startDate,
      reminderTimes: Array(timesPerDay).fill("") // Generate empty time slots based on timesPerDay
    }));
  };

  // Handle Image Upload + OCR
  const handleImageUploadLocal = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const { data: { text } } = await Tesseract.recognize(file, "eng", {
        logger: (m) => console.log(m)
      });
      autoFillMedicineForm(text);
      setCurrentStep(2); // Move to next step after OCR
    } catch (err) {
      console.error("OCR Error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const steps = [
    { id: 1, title: "Choose Method", icon: FaMagic },
    { id: 2, title: "Medicine Details", icon: FaPills },
    { id: 3, title: "Schedule & Duration", icon: FaClock }
  ];

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // Handle method selection
  const handleMethodSelect = (method) => {
    setEntryMethod(method);
    if (method === 'manual') {
      setCurrentStep(2); // Skip to medicine details for manual entry
    }
  };

  // Handle save medicine with reset
  const handleSaveMedicine = async (e) => {
    e.preventDefault();
    try {
      await handleAddMedicine(e);
      // Reset form after successful save
      resetForm();
    } catch (error) {
      console.error("Error saving medicine:", error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      {/* Step Indicator */}
      <div className="mb-16">
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col sm:flex-row items-center">
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 transition-all duration-200 ${
                  currentStep >= step.id 
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : 'bg-gray-100 border-gray-300 text-gray-500'
                }`}>
                  <step.icon size={16} className="sm:w-4 sm:h-4" />
                </div>
                <span className={`ml-2 text-xs sm:text-sm font-medium ${
                  currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`hidden sm:block w-12 sm:w-16 h-0.5 mx-3 sm:mx-4 ${
                  currentStep > step.id ? 'bg-blue-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Choose Entry Method */}
      {currentStep === 1 && (
        <div className="space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaMagic className="text-blue-600" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Add Medicine</h3>
            <p className="text-gray-600 mb-8">Choose how you'd like to add your medicine</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* OCR Option */}
            <div 
              className="bg-blue-50 rounded-lg p-6 border-2 border-dashed border-blue-200 hover:border-blue-400 transition-colors cursor-pointer"
              onClick={() => handleMethodSelect('ocr')}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCamera className="text-blue-600" size={20} />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Upload Prescription</h4>
                <p className="text-gray-600 text-sm mb-4">Take a photo of your prescription to auto-fill details</p>
                
                <div className="bg-blue-50 rounded-lg p-4 border-2 border-dashed border-blue-200">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUploadLocal}
                    className="hidden"
                    id="prescription-upload"
                    disabled={isProcessing}
                  />
                  <label
                    htmlFor="prescription-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaUpload className="mr-2" size={14} />
                        Choose Image
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Manual Entry Option */}
            <div 
              className="bg-green-50 rounded-lg p-6 border-2 border-dashed border-green-200 hover:border-green-400 transition-colors cursor-pointer"
              onClick={() => handleMethodSelect('manual')}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaEdit className="text-green-600" size={20} />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Manual Entry</h4>
                <p className="text-gray-600 text-sm mb-4">Enter medicine details manually</p>
                
                <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                  <FaPills className="mr-2" size={14} />
                  Start Manual Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Medicine Details */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FaPills className="text-purple-600" size={20} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Medicine Details</h3>
              <p className="text-gray-600">
                {entryMethod === 'ocr' ? 'Review and edit the auto-filled details' : 'Enter the medicine information'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <ModernInput
                label="Medicine Name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Paracetamol"
                icon="💊"
                required
              />
            </div>
            
            <div>
              <ModernInput
                label="Dosage"
                type="text"
                value={form.dosage}
                onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                placeholder="e.g., 500mg"
                icon="📏"
                required
              />
            </div>
            
            <div>
              <ModernDropdown
                value={form.beforeAfterFood}
                onChange={(value) => setForm({ ...form, beforeAfterFood: value })}
                options={[
                  { value: "Before food", label: "🍽️ Before food" },
                  { value: "After food", label: "🍽️ After food" },
                  { value: "Any time", label: "⏰ Any time" }
                ]}
                placeholder="Select when to take"
                icon={<FaUtensils size={16} />}
                label="When to Take"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Times Per Day</label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((number) => (
                  <button
                    key={number}
                    type="button"
                    onClick={() => handleNumberOfTimesChange(number)}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all duration-200 font-medium ${
                      form.timesPerDay === number
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    {number}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Select a number to automatically generate reminder time slots. You can also add more times manually below.
              </p>
            </div>
          </div>

          <div>
            <ModernTextarea
              label="Notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              placeholder="Any additional notes about the medicine..."
              icon="📝"
            />
          </div>
        </div>
      )}

      {/* Step 3: Schedule & Duration */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FaClock className="text-green-600" size={20} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Schedule & Duration</h3>
              <p className="text-gray-600">Set reminder times and duration</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <DateTimePicker
                value={form.startDate}
                onChange={(value) => setForm({ ...form, startDate: value })}
                type="date"
                placeholder="Select start date"
                label="Start Date"
              />
            </div>
            
            <div>
              <ModernInput
                label="Duration (Days)"
                type="number"
                min="1"
                value={form.durationDays}
                onChange={(e) => setForm({ ...form, durationDays: parseInt(e.target.value) })}
                placeholder="Enter duration in days"
                icon="📅"
                required
              />
            </div>
          </div>

          {/* Reminder Times */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reminder Times</label>
            <div className="space-y-2">
              {(form.reminderTimes || [""]).map((time, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => handleTimeChange(idx, e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {idx === (form.reminderTimes || [""]).length - 1 && (
                    <button
                      type="button"
                      onClick={addTimeField}
                      className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <FaPlus size={14} />
                    </button>
                  )}
                  {(form.reminderTimes || [""]).length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newTimes = form.reminderTimes.filter((_, index) => index !== idx);
                        setForm({ ...form, reminderTimes: newTimes, timesPerDay: newTimes.length });
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

          {/* Review Section */}
          <div className="mt-8">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Review Your Medicine</h4>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Medicine Name</span>
                  <p className="text-gray-800 font-medium">{form.name || "Not specified"}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Dosage</span>
                  <p className="text-gray-800 font-medium">{form.dosage || "Not specified"}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">When to Take</span>
                  <p className="text-gray-800 font-medium">{form.beforeAfterFood}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Times Per Day</span>
                  <p className="text-gray-800 font-medium">{form.timesPerDay}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Start Date</span>
                  <p className="text-gray-800 font-medium">
                    {form.startDate ? (() => {
                      const [year, month, day] = form.startDate.split('-');
                      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                      return date.toLocaleDateString("en-US", { 
                        year: "numeric", 
                        month: "short", 
                        day: "numeric" 
                      });
                    })() : "Not specified"}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Duration</span>
                  <p className="text-gray-800 font-medium">{form.durationDays} days</p>
                </div>
              </div>
              
              {form.notes && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Notes</span>
                  <p className="text-gray-800">{form.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-10">
        <ModernButton
          onClick={prevStep}
          disabled={currentStep === 1}
          variant="outline"
          size="lg"
        >
          Back
        </ModernButton>
        
        {currentStep < 3 ? (
          <ModernButton
            onClick={nextStep}
            variant="primary"
            size="lg"
            icon={<FaArrowRight size={16} />}
            iconPosition="right"
          >
            Next Step
          </ModernButton>
        ) : (
          <ModernButton
            onClick={handleSaveMedicine}
            variant="success"
            size="lg"
            icon={<FaCheck size={16} />}
            iconPosition="left"
          >
            Save Medicine
          </ModernButton>
        )}
      </div>
    </div>
  );
}
 