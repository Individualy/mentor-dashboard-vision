
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { UserProvider, useUser } from "./contexts/UserContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Video, UserCog, LogOut } from "lucide-react";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NotFound from "./pages/NotFound";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPasswordWithCodePage from "./pages/ResetPasswordWithCodePage";
import VerificationEmailByCode from "./pages/VerificationEmailByCode";
import TeacherDashboard from "./components/auth/TeacherDashboard";
import StudentDashboard from "./components/auth/StudentDashboard";
import AdminDashboard from "./components/auth/AdminDashboard";
import CreateMeeting from "./components/meeting/CreateMeeting";
import MeetingRoom from "./components/meeting/MeetingRoom";
import AuthRoute from "./components/auth/AuthRoute";

const queryClient = new QueryClient();

// Navigation component wrapped with UserProvider
const NavigationWithUser = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout, loading, error, fetchUserInfo } = useUser();

  // Force refresh user data if not available
  useEffect(() => {
    if (!user && !loading) {
      console.log('No user data available, fetching...');
      fetchUserInfo();
    }
  }, [user, loading, fetchUserInfo]);

  const handleSignOut = () => {
    logout();
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
                {loading ? "Loading..." :
                 error ? "Error loading user" :
                 user ? `${user.full_name} (${user.role})` : "Not logged in"}
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

// Dashboard component that uses the user context
const DashboardContent = () => {
  const { user } = useUser();

  // Default to teacher if no user or role
  const role = user?.role?.toLowerCase() || 'teacher';

  switch(role) {
    case 'admin':
      return <AdminDashboard />;
    case 'student':
      return <StudentDashboard />;
    case 'teacher':
    default:
      return <TeacherDashboard />;
  }
};

// Main App component
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Router>
          <UserProvider>
            <Routes>
              <Route path="/dashboard" element={
                <>
                  <NavigationWithUser />
                  <AuthRoute authenticationRequired={true}><DashboardContent /></AuthRoute>
                </>
              } />
              <Route path="/" element={<AuthRoute authenticationRequired={false}><LoginPage /></AuthRoute>} />
              <Route path="/login" element={<AuthRoute authenticationRequired={false}><LoginPage /></AuthRoute>} />
              <Route path="/signup" element={<AuthRoute authenticationRequired={false}><SignupPage /></AuthRoute>} />
              <Route path="/forgot-password" element={<AuthRoute authenticationRequired={false}><ForgotPasswordPage /></AuthRoute>} />
              <Route path="/reset-password" element={<AuthRoute authenticationRequired={false}><ResetPasswordPage /></AuthRoute>} />
              <Route path="/reset-password/:token" element={<AuthRoute authenticationRequired={false}><ResetPasswordPage /></AuthRoute>} />
              <Route path="/verify-email" element={<AuthRoute authenticationRequired={false}><VerifyEmail /></AuthRoute>} />
              <Route path="/verify-code" element={<AuthRoute authenticationRequired={false}><VerificationEmailByCode /></AuthRoute>} />
              <Route path="/reset-password-with-code" element={<AuthRoute authenticationRequired={false}><ResetPasswordWithCodePage /></AuthRoute>} />
              <Route path="/create-meeting" element={<AuthRoute authenticationRequired={true}><CreateMeeting /></AuthRoute>} />
              <Route path="/meeting-room" element={<AuthRoute authenticationRequired={true}><MeetingRoom /></AuthRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </UserProvider>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
