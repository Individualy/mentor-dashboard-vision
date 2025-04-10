import React from 'react';
import { useSearchParams } from 'react-router-dom';
import ResetPasswordWithCodeForm from "@/components/auth/ResetPasswordWithCodeForm";

const ResetPasswordWithCodePage = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const code = searchParams.get('code') || '';
  const sessionToken = searchParams.get('session') || '';

  if (!email || !code || !sessionToken) {
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
      <ResetPasswordWithCodeForm email={email} code={code} sessionToken={sessionToken} />
    </div>
  );
};

export default ResetPasswordWithCodePage;
