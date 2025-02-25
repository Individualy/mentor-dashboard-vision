
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const navigate = useNavigate();
  // TODO: Implement role-based dashboard
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 animate-fadeIn">
          <h1 className="text-2xl font-bold mb-4">Welcome to your Dashboard</h1>
          <p className="text-gray-600">Your role-specific dashboard content will appear here.</p>
        </div>
        <Button
          onClick={() => navigate("/login")}
          variant="outline"
          className="mt-4"
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
