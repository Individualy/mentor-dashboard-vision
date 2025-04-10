import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import VerifyCodeForm from "@/components/auth/VerifyCodeForm";
import { toast } from "sonner";

const VerifyCodePage = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const sessionToken = searchParams.get('session') || '';
  const isPasswordReset = searchParams.get('reset') === 'true';

  useEffect(() => {
    // Debug information
    console.log('VerifyCodePage loaded with params:', { email, sessionToken, isPasswordReset });

    if (email && sessionToken) {
      toast.info(`Verification for: ${email}`);
    }
  }, [email, sessionToken, isPasswordReset]);

  if (!email || !sessionToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Invalid Request</h2>
          <p className="text-center">Missing required parameters. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <VerifyCodeForm email={email} sessionToken={sessionToken} isPasswordReset={isPasswordReset} />
    </div>
  );
};

export default VerifyCodePage;
