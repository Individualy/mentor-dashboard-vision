import React, { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Video, UserCog } from "lucide-react";

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

const Navigation = ({ isTeacher, setIsTeacher }) => {
  const location = useLocation();
  
  if (location.pathname !== '/dashboard') {
    return null;
  }

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
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsTeacher(!isTeacher)}
              className="flex items-center space-x-2 px-4 py-2 rounded-md bg-indigo-50 hover:bg-indigo-100 transition-colors"
            >
              <UserCog className="h-5 w-5 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-700">
                Switch to {isTeacher ? "Student" : "Teacher"} Mode
              </span>
            </button>
            <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
              {isTeacher ? "Teacher Mode" : "Student Mode"}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};

const App = () => {
  const [isTeacher, setIsTeacher] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Router>
          <Navigation isTeacher={isTeacher} setIsTeacher={setIsTeacher} />
          <Routes>
            {/* Auth routes - redirect to dashboard if already logged in */}
            <Route path="/" element={
              <AuthRoute authenticationRequired={false}>
                <LoginPage />
              </AuthRoute>
            } />
            <Route path="/login" element={
              <AuthRoute authenticationRequired={false}>
                <LoginPage />
              </AuthRoute>
            } />
            <Route path="/signup" element={
              <AuthRoute authenticationRequired={false}>
                <SignupPage />
              </AuthRoute>
            } />
            <Route path="/forgot-password" element={
              <AuthRoute authenticationRequired={false}>
                <ForgotPasswordPage />
              </AuthRoute>
            } />
            <Route path="/reset-password" element={
              <AuthRoute authenticationRequired={false}>
                <ResetPasswordPage />
              </AuthRoute>
            } />
            <Route path="/reset-password/:token" element={
              <AuthRoute authenticationRequired={false}>
                <ResetPasswordPage />
              </AuthRoute>
            } />
            <Route path="/verify-email" element={
              <AuthRoute authenticationRequired={false}>
                <VerifyEmail />
              </AuthRoute>
            } />
            
            {/* Protected routes - require authentication */}
            <Route path="/dashboard" element={
              <AuthRoute authenticationRequired={true}>
                {isTeacher ? <TeacherDashboard /> : <StudentDashboard />}
              </AuthRoute>
            } />
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
