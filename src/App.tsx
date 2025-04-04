import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Video, UserCog, LogOut } from "lucide-react";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import VerifyEmail from "./pages/VerifyEmail";
import TeacherDashboard from "./components/auth/TeacherDashboard";
import StudentDashboard from "./components/auth/StudentDashboard";
import AuthRoute from "./components/auth/AuthRoute";

const queryClient = new QueryClient();

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Lỗi khi parse user từ localStorage:", error);
        setUser(null);
      }
    }
  }, []);

  if (location.pathname !== "/dashboard") {
    return null;
  }

  const fetchUserInfo = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
  
    try {
      const response = await fetch("https://api.example.com/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
  
      const userData = await response.json();
      localStorage.setItem("user", JSON.stringify(userData)); // Lưu user vào localStorage
      return userData;
    } catch (error) {
      console.error("Error fetching user info:", error);
      return null;
    }
  };
  
  const handleSignOut = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Video className="h-8 w-8 text-indigo-600" />
            <span className="ml-2 text-xl font-semibold text-gray-900">
              EduMeet
            </span>
          </div>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <UserCog className="h-5 w-5 text-gray-700" />
              <span className="text-sm font-medium text-gray-700">
                {user ? `${user.name} (${user.role})` : "Loading..."}
              </span>
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-2">
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <LogOut className="h-5 w-5 mr-2" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const App = () => {
  const [isTeacher, setIsTeacher] = useState(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        return parsedUser.role === "teacher";
      } catch (error) {
        console.error("Lỗi khi parse user:", error);
      }
    }
    return true;
  });

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Router>
          <Navigation />
          <Routes>
            <Route path="/" element={<AuthRoute authenticationRequired={false}><LoginPage /></AuthRoute>} />
            <Route path="/login" element={<AuthRoute authenticationRequired={false}><LoginPage /></AuthRoute>} />
            <Route path="/signup" element={<AuthRoute authenticationRequired={false}><SignupPage /></AuthRoute>} />
            <Route path="/forgot-password" element={<AuthRoute authenticationRequired={false}><ForgotPasswordPage /></AuthRoute>} />
            <Route path="/reset-password" element={<AuthRoute authenticationRequired={false}><ResetPasswordPage /></AuthRoute>} />
            <Route path="/reset-password/:token" element={<AuthRoute authenticationRequired={false}><ResetPasswordPage /></AuthRoute>} />
            <Route path="/verify-email" element={<AuthRoute authenticationRequired={false}><VerifyEmail /></AuthRoute>} />
            <Route path="/dashboard" element={<AuthRoute authenticationRequired={true}>{isTeacher ? <TeacherDashboard /> : <StudentDashboard />}</AuthRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
