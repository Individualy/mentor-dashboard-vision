import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axios from 'axios';
import { getFrontendUrl } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post<{ message: string, session_token: string }>(`${API_URL}/forgot-password`, { email });
      toast.success("Reset code sent to your email");
      // Store session data for verification
      const sessionData = {
        email: email,
        token: response.data.session_token,
        timestamp: Date.now()
      };
      sessionStorage.setItem('registration_session', JSON.stringify(sessionData));

      // Use full URL with current origin to ensure correct port
      window.location.href = `${getFrontendUrl()}/verify-code?email=${email}&reset=true&session=${response.data.session_token}`;
    } catch (error) {
      console.error("Password reset request failed:", error);
      toast.error(error.response.data.message || "Failed to send reset link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg animate-fadeIn">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Reset Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="email"
            placeholder="Email"
            className="w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90"
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Send Reset Code"}
        </Button>
      </form>
      <div className="mt-4 text-center">
        <button
          onClick={() => navigate("/login")}
          className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          Back to login
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
