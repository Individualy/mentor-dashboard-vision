
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Implement actual forgot password logic
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Normally the backend would generate a token and send an email with a link
      // Example: https://yourapp.com/reset-password/TOKEN_HERE
      
      setIsSuccess(true);
      toast.success(
        "Reset link sent to your email! Check your inbox and click the link to reset your password.",
        { duration: 5000 }
      );
      
      // In a real app, we would not navigate away automatically
      // but for demo purposes, we're simulating clicking the link
      const demoToken = "demo-reset-token-" + Math.random().toString(36).substring(2, 10);
      
      // Uncomment the following line to simulate clicking the reset link immediately
      // setTimeout(() => navigate(`/reset-password/${demoToken}`), 3000);
      
    } catch (error) {
      console.error("Password reset request failed:", error);
      toast.error("Failed to send reset link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show a success screen after the email is sent
  if (isSuccess) {
    return (
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg animate-fadeIn">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Check Your Email</h2>
          <p className="mb-6 text-gray-600">
            We've sent a password reset link to <span className="font-medium">{email}</span>.
            The link will expire in 1 hour.
          </p>
          <p className="mb-6 text-gray-600 text-sm">
            If you don't see the email, check your spam folder or try again with a different email address.
          </p>
          <Button 
            onClick={() => navigate("/login")}
            className="w-full bg-primary hover:bg-primary/90"
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

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
          {isLoading ? "Sending..." : "Send Reset Link"}
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
