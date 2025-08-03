import { useState } from "react";
import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import logo from "./assets/logo medicare.png";

export default function Auth({ onUserChange }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");

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
    setDob(formattedDob);
    setShowDobPicker(false);
  };

  const handleAuth = async () => {
    setIsLoading(true);
    try {
      if (isLogin) {
        // LOGIN
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // REGISTER in Firebase
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        // ✅ Save user to MongoDB via backend API
        await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid: user.uid,
            email,
            name,
            age,
            dob,
            phone,
            medicalHistory,
          }),
        });
      }
      onUserChange(auth.currentUser);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    onUserChange(null);
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setAge("");
    setDob("");
    setPhone("");
    setMedicalHistory("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 to-pink-200 flex items-center justify-center p-4 lg:p-8">
      <div className="flex flex-col lg:flex-row w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Left Section: Logo, Name, Quote */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 items-center justify-center p-8">
          <div className="text-center text-white">
            <img
              src={logo}
              alt="Medicare Logo"
              className="w-32 h-32 mx-auto mb-6"
            />
            <h1 className="text-5xl font-extrabold mb-4">MedTrack</h1>
            <p className="text-xl font-light leading-relaxed">
              "Your Health, Our Priority. Seamlessly manage your medications and well-being."
            </p>
          </div>
        </div>

        {/* Right Section: Auth Form */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex items-center justify-center">
          <div className="w-full max-w-md">
            {/* Header for small screens */}
            <div className="text-center mb-8 lg:hidden">
              <img
                src={logo}
                alt="Medicare Logo"
                className="w-24 h-24 mx-auto mb-4"
              />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">MedTrack</h1>
              <p className="text-gray-600 mb-2">Your Health, Our Priority</p>
            </div>

            <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-gray-500 text-sm mb-8 text-center">
              {isLogin
                ? "Sign in to your account"
                : "Join our healthcare platform"}
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAuth();
              }}
            >
              {!isLogin && (
                <div className="space-y-4 mb-6">
                  {/* Full Name */}
                  <div className="relative">
                    <input
                      className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Age */}
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Age"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      required
                    />
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
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowDobPicker(!showDobPicker)}
                      className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-left"
                    >
                      <span
                        className={dob ? "text-gray-900" : "text-gray-500"}
                      >
                        {dob ? dob : "Date of Birth"}
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
                                  length: getDaysInMonth(
                                    selectedYear,
                                    selectedMonth
                                  ),
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

                  {/* Phone Number */}
                  <div className="relative">
                    <input
                      className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
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
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Medical History */}
                  <div className="relative">
                    <textarea
                      className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      placeholder="Past Medical Issues (optional)"
                      value={medicalHistory}
                      onChange={(e) => setMedicalHistory(e.target.value)}
                      rows={3}
                    />
                    <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400 mt-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="relative mb-4">
                <input
                  className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
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
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                </div>
              </div>

              {/* Password */}
              <div className="relative mb-6">
                <input
                  className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
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
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {isLogin ? "Signing In..." : "Creating Account..."}
                  </div>
                ) : isLogin ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Toggle Login/Register */}
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  resetForm();
                }}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </div>

          {/* Logout Button (if user is logged in) */}
          {auth.currentUser && (
            <div className="mt-6 text-center">
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
