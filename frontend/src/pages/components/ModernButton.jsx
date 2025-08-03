import { forwardRef } from "react";

const ModernButton = forwardRef(({
  children,
  variant = "primary", // "primary", "secondary", "success", "danger", "outline"
  size = "md", // "sm", "md", "lg"
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left", // "left", "right"
  className = "",
  ...props
}, ref) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };
  
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    outline: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-blue-500"
  };
  
  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;
  
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={classes}
      {...props}
    >
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
      )}
      
      {!loading && icon && iconPosition === "left" && (
        <span className="mr-2">{icon}</span>
      )}
      
      <span>{children}</span>
      
      {!loading && icon && iconPosition === "right" && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  );
});

ModernButton.displayName = "ModernButton";

export default ModernButton;