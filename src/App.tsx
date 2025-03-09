
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LogOut, User } from "lucide-react";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import VerifyEmail from "./pages/VerifyEmail";
import TeacherDashboard from "./components/auth/TeacherDashboard";
import StudentDashboard from "./components/auth/StudentDashboard";
import AdminDashboard from "./components/auth/AdminDashboard";
import AuthRoute from "./components/auth/AuthRoute";
import { UserProvider, useUser } from "./contexts/UserContext";
import { Button } from "./components/ui/button";
import { Avatar, AvatarFallback } from "./components/ui/avatar";

const queryClient = new QueryClient();

const AppNavbar = () => {
  const { user, logout } = useUser();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <User className="h-8 w-8 text-indigo-600" />
            <span className="ml-2 text-xl font-semibold text-gray-900">
              EduMeet Dashboard
            </span>
          </div>
          {user && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-indigo-100 text-indigo-600">
                    {user.fullName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user.fullName}</span>
                  <span className="text-xs text-indigo-600 font-medium">{user.role}</span>
                </div>
              </div>
              <Button 
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-red-600"
                onClick={logout}
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const DashboardContent = () => {
  const { user } = useUser();

  if (!user) return null;

  switch (user.role) {
    case 'Teacher':
      return <TeacherDashboard />;
    case 'Student':
      return <StudentDashboard />;
    case 'Admin':
      return <AdminDashboard />;
    default:
      return <Dashboard />;
  }
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <UserProvider>
          <Router>
            <AppNavbar />
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
                  <DashboardContent />
                </AuthRoute>
              } />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
