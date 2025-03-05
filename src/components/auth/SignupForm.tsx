import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup, checkEmailExists } from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const SignupForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Student",
  });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    try {
      const emailExists = await checkEmailExists(formData.email);
      if (emailExists) {
        toast.error("Email already exists. Please use a different email.");
        return;
      }
      const data = await signup(formData.fullName, formData.email, formData.password, formData.role);
      setMessage(data.message);
      toast.success("Signup successful! Please check your email for verification.");
      navigate("/login");
    } catch (error) {
      setMessage('Error signing up');
      toast.error("Error signing up");
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg animate-fadeIn">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Create an account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="text"
            placeholder="Full Name"
            className="w-full"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />
        </div>
        <div>
          <Input
            type="email"
            placeholder="Email"
            className="w-full"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div>
          <Input
            type="password"
            placeholder="Password"
            className="w-full"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>
        <div>
          <Input
            type="password"
            placeholder="Confirm Password"
            className="w-full"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
          />
        </div>
        <Select onValueChange={(value) => setFormData({ ...formData, role: value })}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Teacher">Teacher</SelectItem>
            <SelectItem value="Student">Student</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
          Sign Up
        </Button>
      </form>
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-primary hover:text-primary/90 transition-colors"
          >
            Sign in
          </button>
        </p>
      </div>
      <p>{message}</p>
    </div>
  );
};

export default SignupForm;
