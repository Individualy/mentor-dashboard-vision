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

export const signup = async (fullName: string, email: string, password: string, role: string): Promise<SignupResponse> => {
  const response = await axios.post<SignupResponse>(`${API_URL}/signup`, { fullName, email, password, role });
  return response.data;
};

export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/check-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    // Only return true if the email exists AND is active
    return data.exists && data.is_active;
  } catch (error) {
    console.error("Error checking email existence:", error);
    return false; // Assume email doesn't exist in case of an error
  }
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