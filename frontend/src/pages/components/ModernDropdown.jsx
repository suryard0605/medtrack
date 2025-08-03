import { useState, useRef, useEffect } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function ModernDropdown({
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  className = "",
  disabled = false,
  icon,
  label
}) {
  const [isOpen, setIsOpen] = useState(false);
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

  const selectedOption = options.find(option => 
    typeof option === 'string' ? option === value : option.value === value
  );

  const displayValue = selectedOption 
    ? (typeof selectedOption === 'string' ? selectedOption : selectedOption.label)
    : placeholder;

  const handleSelect = (option) => {
    const optionValue = typeof option === 'string' ? option : option.value;
    onChange(optionValue);
    setIsOpen(false);
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
            {icon && <span className="text-gray-400">{icon}</span>}
            <span className={value ? "text-gray-900" : "text-gray-500"}>
              {displayValue}
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
        <div className="absolute z-50 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 py-2 max-h-60 overflow-y-auto">
          {options.map((option, index) => {
            const optionValue = typeof option === 'string' ? option : option.value;
            const optionLabel = typeof option === 'string' ? option : option.label;
            const isSelected = value === optionValue;
            
            return (
              <button
                key={index}
                onClick={() => handleSelect(option)}
                className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors ${
                  isSelected 
                    ? "bg-blue-100 text-blue-700 font-medium" 
                    : "text-gray-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{optionLabel}</span>
                  {isSelected && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}