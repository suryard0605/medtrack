import { forwardRef } from "react";

const ModernTextarea = forwardRef(({
  label,
  value,
  onChange,
  placeholder,
  className = "",
  disabled = false,
  required = false,
  rows = 3,
  icon,
  error,
  ...props
}, ref) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute top-3 left-3 flex items-start pointer-events-none">
            <span className="text-gray-400">{icon}</span>
          </div>
        )}
        
        <textarea
          ref={ref}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed resize-none ${
            icon ? "pl-10" : ""
          } ${error ? "border-red-500 focus:ring-red-500" : ""}`}
          {...props}
        />
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

ModernTextarea.displayName = "ModernTextarea";

export default ModernTextarea; 