import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from "sonner";
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      if (token) {
        try {
          const response = await axios.get<{ message: string }>(`${API_URL}/verify-email?token=${token}`);
          setMessage(response.data.message);
          toast.success("Email verified successfully!");
          navigate("/login");
        } catch (error) {
          setMessage('Invalid or expired token');
          toast.error("Invalid or expired token");
        }
      }
    };
    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg animate-fadeIn">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Email Verification</h2>
      <p className="text-center">{message}</p>
    </div>
  );
};

export default VerifyEmail;