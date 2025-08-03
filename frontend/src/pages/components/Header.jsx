import { FaBell, FaUser, FaHome, FaCog, FaPhone, FaTimes, FaSignOutAlt } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import logo from "../../assets/logo medicare.png";

export default function Header({ user, displayName, notifications, showNotificationBox, setShowNotificationBox, handleNotificationAction, medicines = [] }) {
  const location = useLocation();
  const navigate = useNavigate();

  
  return (
    <div className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-16 h-16 rounded-lg flex items-center justify-center">
                <img src={logo} alt="MedTrack Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800">MedTrack</h1>
            </Link>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                to="/" 
                className={`transition-colors text-base font-medium ${
                  location.pathname === "/" 
                    ? "text-blue-600 border-b-2 border-blue-600 pb-1" 
                    : "text-gray-500 hover:text-blue-600"
                }`}
              >
                Home
              </Link>
              <Link 
                to="/analytics" 
                className={`transition-colors text-base font-medium ${
                  location.pathname === "/analytics" 
                    ? "text-blue-600 border-b-2 border-blue-600 pb-1" 
                    : "text-gray-500 hover:text-blue-600"
                }`}
              >
                Analytics
              </Link>
              <Link 
                to="/about" 
                className={`transition-colors text-base font-medium ${
                  location.pathname === "/about" 
                    ? "text-blue-600 border-b-2 border-blue-600 pb-1" 
                    : "text-gray-500 hover:text-blue-600"
                }`}
              >
                About Us
              </Link>
            </nav>
          </div>
          
          {/* Right side - Actions and User */}
          <div className="flex items-center space-x-6">
            {/* Quick Actions */}
            <div className="flex items-center space-x-4">
              <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                <FaPhone size={20} />
              </button>
              
                              {/* Notification Bell */}
              <div className="relative">
                <button
                  className="relative w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  onClick={() => setShowNotificationBox((prev) => !prev)}
                >
                  <FaBell size={20} />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                      {notifications.length > 9 ? '9+' : notifications.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
            
            {/* User Profile */}
            <div className="flex items-center space-x-4">
              <Link to="/profile" className="flex items-center space-x-4 hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer">
                <div className="text-right">
                  <p className="text-base font-medium text-gray-800">{displayName}</p>
                  <p className="text-sm text-gray-500">Active</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <FaUser className="text-white" size={18} />
                </div>
              </Link>
              
              {/* Logout Button */}
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 