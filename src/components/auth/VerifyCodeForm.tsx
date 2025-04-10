import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { getFrontendUrl } from '@/lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

interface VerifyCodeFormProps {
  email: string;
  sessionToken: string;
  isPasswordReset?: boolean;
}

const VerifyCodeForm: React.FC<VerifyCodeFormProps> = ({ email, sessionToken, isPasswordReset = false }) => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (code.length !== 8) {
      toast.error("Please enter the complete 8-digit code");
      return;
    }

    setIsLoading(true);

    try {
      if (isPasswordReset) {
        // Verify password reset code
        const response = await axios.post(`${API_URL}/verify-reset-token`, {
          email,
          code,
          session_token: sessionToken
        });

        if ((response.data as { valid: boolean }).valid) {
          toast.success("Code verified successfully");
          // Navigate to reset password page with email and code
          window.location.href = `${getFrontendUrl()}/reset-password-with-code?email=${email}&code=${code}&session=${sessionToken}`;
        }
      } else {
        // Verify email code
        const response = await axios.post(`${API_URL}/verify-email`, {
          email,
          code,
          session_token: sessionToken
        });

        toast.success((response.data as { message: string }).message);
        window.location.href = `${getFrontendUrl()}/login`;
      }
    } catch (error) {
      console.error("Verification failed:", error);
      toast.error("Invalid or expired verification code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg animate-fadeIn">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        {isPasswordReset ? "Reset Password" : "Verify Your Email"}
      </h2>

      <p className="text-center mb-6 text-gray-600">
        {isPasswordReset
          ? "Enter the 8-digit code sent to your email to reset your password."
          : "Enter the 8-digit code sent to your email to verify your account."}
      </p>

      <div className="flex flex-col items-center space-y-6">
        <InputOTP
          maxLength={8}
          value={code}
          onChange={setCode}
          render={({ slots }) => (
            <InputOTPGroup>
              {slots.map((slot, index) => (
                <InputOTPSlot key={index} {...slot} index={index} />
              ))}
            </InputOTPGroup>
          )}
        />

        <Button
          onClick={handleVerify}
          className="w-full bg-primary hover:bg-primary/90"
          disabled={isLoading || code.length !== 8}
        >
          {isLoading ? "Verifying..." : "Verify Code"}
        </Button>

        <p className="text-sm text-gray-500">
          Didn't receive a code? Check your spam folder or{" "}
          <button
            onClick={() => navigate(isPasswordReset ? "/forgot-password" : "/signup")}
            className="text-primary hover:underline"
          >
            try again
          </button>
        </p>
      </div>
    </div>
  );
};

export default VerifyCodeForm;
