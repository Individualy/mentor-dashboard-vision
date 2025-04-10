import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '@/lib/api';
import { useUser } from '@/contexts/UserContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';

const LoginForm = () => {
  const navigate = useNavigate();
  const { fetchUserInfo } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    try {
      console.log('Attempting login with email:', email);
      const data = await login(email, password);
      console.log('Login response:', data);

      const token = data.access_token;
      console.log('Token received:', token ? 'Token exists' : 'No token');

      // Validate token before storing
      if (!token || typeof token !== 'string' || token.trim() === '') {
        console.error('Invalid token received from server');
        throw new Error('Invalid token received from server');
      }

      // Store token in localStorage
      localStorage.setItem('token', token.trim());

      // Fetch user information using the context
      console.log('Fetching user info after login...');
      const userInfo = await fetchUserInfo();
      console.log('User info after login:', userInfo);

      setMessage('Login successful!');
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setMessage('Error logging in');
      toast.error('Error logging in');
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg animate-fadeIn">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Welcome back</h2>
      <div className="space-y-4">
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
        <div>
          <Input
            type="password"
            placeholder="Password"
            className="w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button onClick={handleLogin} className="w-full bg-primary hover:bg-primary/90">
          Sign In
        </Button>
        <p>{message}</p>
      </div>
      <div className="mt-4 text-center space-y-2">
        <button
          onClick={() => navigate("/forgot-password")}
          className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          Forgot password?
        </button>
        <div className="text-sm text-gray-600">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/signup")}
            className="text-primary hover:text-primary/90 transition-colors"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
