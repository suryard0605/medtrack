import { useState, useRef, useEffect } from "react";
import { FaCalendar, FaClock, FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function DateTimePicker({ 
  value, 
  onChange, 
  type = "datetime", // "date", "time", "datetime"
  placeholder = "Select date and time",
  className = "",
  disabled = false,
  minDate,
  maxDate,
  label
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDisplayValue = () => {
    if (!value) return placeholder;
    
    if (type === "date") {
      // Handle date string directly to avoid timezone issues
      if (value.includes('-')) {
        const [year, month, day] = value.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        return date.toLocaleDateString("en-US", { 
          year: "numeric", 
          month: "short", 
          day: "numeric" 
        });
      } else {
        const date = new Date(value);
        return date.toLocaleDateString("en-US", { 
          year: "numeric", 
          month: "short", 
          day: "numeric" 
        });
      }
    } else if (type === "time") {
      return value; // Just show the time value as is
    } else {
      const date = new Date(value);
      return date.toLocaleString("en-US", { 
        year: "numeric", 
        month: "short", 
        day: "numeric",
        hour: "2-digit", 
        minute: "2-digit",
        hour12: true 
      });
    }
  };

  const handleDateSelect = (date) => {
    if (type === "date") {
      // Fix timezone issue by creating date in local timezone
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();
      // Create date string directly in YYYY-MM-DD format to avoid timezone issues
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      onChange(dateString);
      setIsOpen(false);
    } else {
      // For datetime, we'll handle time separately
      const currentTime = value ? new Date(value) : new Date();
      const newDateTime = new Date(date);
      newDateTime.setHours(currentTime.getHours(), currentTime.getMinutes());
      onChange(newDateTime.toISOString());
      setIsOpen(false);
    }
  };

  const handleTimeSelect = (timeValue) => {
    if (type === "time") {
      onChange(timeValue);
      setIsOpen(false);
    } else {
      // For datetime, combine with current date
      const currentDate = value ? new Date(value) : new Date();
      const [hours, minutes] = timeValue.split(":");
      currentDate.setHours(parseInt(hours), parseInt(minutes));
      onChange(currentDate.toISOString());
      setIsOpen(false);
    }
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const isToday = (date) => {
    const today = new Date();
    // Compare dates in local timezone to avoid timezone issues
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDay = today.getDate();
    const dateYear = date.getFullYear();
    const dateMonth = date.getMonth();
    const dateDay = date.getDate();
    return todayYear === dateYear && todayMonth === dateMonth && todayDay === dateDay;
  };

  const isSelected = (date) => {
    if (!value) return false;
    const selected = new Date(value);
    // Compare dates in local timezone to avoid timezone issues
    const selectedYear = selected.getFullYear();
    const selectedMonth = selected.getMonth();
    const selectedDay = selected.getDate();
    const dateYear = date.getFullYear();
    const dateMonth = date.getMonth();
    const dateDay = date.getDate();
    return selectedYear === dateYear && selectedMonth === dateMonth && selectedDay === dateDay;
  };

  const isDisabled = (date) => {
    if (minDate && date < new Date(minDate)) return true;
    if (maxDate && date > new Date(maxDate)) return true;
    return false;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
        {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed ${
          isOpen ? "ring-2 ring-blue-500 border-blue-500" : ""
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {type === "date" ? (
              <FaCalendar className="text-gray-400" size={16} />
            ) : type === "time" ? (
              <FaClock className="text-gray-400" size={16} />
            ) : (
              <div className="flex space-x-1">
                <FaCalendar className="text-gray-400" size={14} />
                <FaClock className="text-gray-400" size={14} />
              </div>
            )}
            <span className={value ? "text-gray-900" : "text-gray-500"}>
              {formatDisplayValue()}
            </span>
          </div>
          {isOpen ? (
            <FaChevronUp className="text-gray-400" size={14} />
          ) : (
            <FaChevronDown className="text-gray-400" size={14} />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          {type === "date" ? (
            // Date Picker with Navigation
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Select Date
              </h3>
              
              {/* Month/Year Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={goToPreviousMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaChevronDown className="text-gray-600" size={12} />
                </button>
                <h4 className="text-lg font-semibold text-gray-800">
                  {currentDate.toLocaleDateString("en-US", { 
                    year: "numeric", 
                    month: "long" 
                  })}
                </h4>
                <button
                  onClick={goToNextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaChevronUp className="text-gray-600" size={12} />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
                {generateCalendarDays().map((date, index) => (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(date)}
                    disabled={isDisabled(date)}
                    className={`p-2 text-sm rounded-lg transition-all duration-200 ${
                      isSelected(date)
                        ? "bg-blue-500 text-white font-semibold"
                        : isToday(date)
                        ? "bg-blue-100 text-blue-700 font-semibold"
                        : date.getMonth() === currentDate.getMonth()
                        ? "text-gray-900 hover:bg-gray-100"
                        : "text-gray-400"
                    } ${isDisabled(date) ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    {date.getDate()}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Simple Time Input
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Enter Time
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time (HH:MM format)
                  </label>
                  <input
                    type="time"
                    value={value || ""}
                    onChange={(e) => handleTimeSelect(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter time"
                  />
                </div>
                
                <div className="text-sm text-gray-500">
                  <p>💡 Enter time in 24-hour format (e.g., 14:30 for 2:30 PM)</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 