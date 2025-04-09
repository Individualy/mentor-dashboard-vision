
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import TeacherDashboard from "@/components/auth/TeacherDashboard";
import StudentDashboard from "@/components/auth/StudentDashboard";
import AdminDashboard from "@/components/auth/AdminDashboard";
import { useState, useEffect } from "react";

const Dashboard = () => {
  const [userRole, setUserRole] = useState<string>('teacher'); // Default to teacher

  useEffect(() => {
    // Get user role from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserRole(user.role || 'teacher');
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const renderDashboard = () => {
    switch (userRole) {
      case 'admin':
        return <AdminDashboard />;
      case 'student':
        return <StudentDashboard />;
      case 'teacher':
      default:
        return <TeacherDashboard />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1">
          {renderDashboard()}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
