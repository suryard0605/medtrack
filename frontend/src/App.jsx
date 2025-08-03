import { Routes, Route, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Auth from "./Auth";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import MemberProfile from "./pages/MemberProfile";
import OCRTool from "./pages/OCRTool";
import AboutUs from "./pages/AboutUs";

export default function App() {
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsLoading(false);
      
      // Only redirect to dashboard on initial login, not on every auth state change
      if (u && !isInitialized) {
        setIsInitialized(true);
        // Use replace to prevent back navigation to Auth
        navigate("/", { replace: true });
      } else if (u) {
        setIsInitialized(true);
      }
    });
    return () => unsub();
  }, [navigate, isInitialized]);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setIsInitialized(false);
    navigate("/");
  };

  // Show loading screen while Firebase is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading MedTrack...</h2>
          <p className="text-gray-500 mt-2">Please wait while we restore your session</p>
        </div>
      </div>
    );
  }

  if (!user) return <Auth onUserChange={setUser} />;

  return (
    <div className="min-h-screen bg-white">
      <Routes>
        <Route path="/" element={<Dashboard user={user} />} />
        <Route path="/analytics" element={<Analytics user={user} />} />
        <Route path="/profile" element={<Profile user={user} />} />
        <Route path="/member/:id" element={<MemberProfile user={user} />} />
        <Route path="/ocr" element={<OCRTool />} />
        <Route path="/about" element={<AboutUs />} />
      </Routes>
    </div>
  );
}
