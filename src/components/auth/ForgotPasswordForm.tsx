import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { forgotPassword } from '@/lib/api';

const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleForgotPassword = async () => {
    try {
      const data = await forgotPassword(email);
      setMessage(data.message);
      toast.success("Reset link sent to your email!");
      navigate("/login");
    } catch (error) {
      setMessage('Error sending reset link');
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg animate-fadeIn">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Reset Password</h2>
      <form onSubmit={(e) => { e.preventDefault(); handleForgotPassword(); }} className="space-y-4">
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
        <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
          Send Reset Link
        </Button>
      </form>
      <p className="mt-4 text-center">{message}</p>
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
