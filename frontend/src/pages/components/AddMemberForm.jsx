import { FaUserPlus, FaArrowLeft } from "react-icons/fa";
import { useState } from "react";

export default function AddMemberForm({ 
  memberForm, 
  setMemberForm, 
  handleAddMember, 
  setIsAddingMember 
}) {
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
    setMemberForm({ ...memberForm, dob: formattedDob });
    setShowDobPicker(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setIsAddingMember(false)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FaArrowLeft size={16} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaUserPlus className="text-blue-500" />
            Add Family Member
          </h1>
        </div>
        
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter full name"
              value={memberForm.memberName}
              onChange={(e) =>
                setMemberForm({ ...memberForm, memberName: e.target.value })
              }
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age *
              </label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Age"
                value={memberForm.age}
                onChange={(e) =>
                  setMemberForm({ ...memberForm, age: e.target.value })
                }
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowDobPicker(!showDobPicker)}
                  className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-left"
                >
                  <span
                    className={memberForm.dob ? "text-gray-900" : "text-gray-500"}
                  >
                    {memberForm.dob ? memberForm.dob : "Date of Birth"}
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
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="member@example.com"
              value={memberForm.email}
              onChange={(e) =>
                setMemberForm({ ...memberForm, email: e.target.value })
              }
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+91 12345 67890"
              value={memberForm.phone}
              onChange={(e) =>
                setMemberForm({ ...memberForm, phone: e.target.value })
              }
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medical History (Optional)
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Any relevant medical history, allergies, or conditions..."
              rows="3"
              value={memberForm.medicalHistory}
              onChange={(e) =>
                setMemberForm({ ...memberForm, medicalHistory: e.target.value })
              }
            />
          </div>
          
          <button 
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <FaUserPlus size={16} />
            Add Family Member
          </button>
        </form>
      </div>
    </div>
  );
}