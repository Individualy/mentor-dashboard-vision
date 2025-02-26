import axios from 'axios';

const API_URL = 'http://localhost:5000';  // URL của backend

interface SignupResponse {
  message: string;
}

interface LoginResponse {
  access_token: string;
}

interface ForgotPasswordResponse {
  message: string;
}

export const signup = async (email: string, password: string, role: string): Promise<SignupResponse> => {
  const response = await axios.post<SignupResponse>(`${API_URL}/signup`, { email, password, role });
  return response.data;
};

export const checkEmailExists = async (email: string): Promise<boolean> => {
  const response = await axios.post<{ exists: boolean }>(`${API_URL}/check-email`, { email });
  return response.data.exists;
};

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await axios.post<LoginResponse>(`${API_URL}/login`, { email, password });
  return response.data;
};

export const changePassword = async (token: string, oldPassword: string, newPassword: string) => {
  const response = await axios.post(`${API_URL}/change-password`, { old_password: oldPassword, new_password: newPassword }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

export const forgotPassword = async (email: string): Promise<ForgotPasswordResponse> => {
  const response = await axios.post<ForgotPasswordResponse>(`${API_URL}/forgot-password`, { email });
  return response.data;
};