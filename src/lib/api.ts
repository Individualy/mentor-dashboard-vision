import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface SignupResponse {
  message: string;
  session_token: string;
}

interface LoginResponse {
  access_token: string;
}

export interface UserInfo {
  id: number;
  full_name: string;
  email: string;
  role: string;
}

export interface Meeting {
  id: string | number;
  title: string;
  start_time: string;
  end_time: string;
  link: string;
  duration: string;
  class_id: number;
}

interface ForgotPasswordResponse {
  message: string;
  session_token: string;
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
  console.log('Making login request to:', `${API_URL}/login`);
  try {
    const response = await axios.post<LoginResponse>(`${API_URL}/login`, { email, password });
    console.log('Login response status:', response.status);
    console.log('Login response data:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error in login:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
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

export const getUserInfo = async (token: string): Promise<UserInfo> => {
  console.log('API_URL:', API_URL);
  console.log('Making request to:', `${API_URL}/me`);

  // Validate token format
  if (!token || typeof token !== 'string' || token.trim() === '') {
    console.error('Invalid token format:', token);
    throw new Error('Invalid token format');
  }

  try {
    // Make sure token is properly formatted
    const authHeader = `Bearer ${token.trim()}`;
    console.log('Authorization header:', authHeader);

    const response = await axios.get<UserInfo>(`${API_URL}/me`, {
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json'
      }
    });

    console.log('Response received:', response.status, response.statusText);
    console.log('User data:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error in getUserInfo:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
};

// Function to get all meetings
export const getMeetings = async (token: string): Promise<Meeting[]> => {
  try {
    const response = await axios.get<Meeting[]>(`${API_URL}/get-meetings`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching meetings:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
};

// Function to get auth token for 100ms
export const get100msToken = async (token: string, meetingId: string | number, role: string): Promise<string> => {
  try {
    console.log('Getting 100ms token for meeting:', meetingId, 'with role:', role);
    // This is a placeholder. In a real implementation, you would call your backend
    // to get a token for the specific meeting and user role
    // For now, we'll return a hardcoded token
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2ZXJzaW9uIjoyLCJ0eXBlIjoiYXBwIiwiYXBwX2RhdGEiOm51bGwsImFjY2Vzc19rZXkiOiI2N2Y2OGQ4MzMzY2U3NGFiOWJlOTViYzAiLCJyb2xlIjoiaG9zdCIsInJvb21faWQiOiI2N2Y2OGU0MzM2ZDRjZmMxOTgxZjE5MTciLCJ1c2VyX2lkIjoiMzcwNjZmNjMtZWUxYS00NmZiLTg1M2QtZmM0NzQ3ZjQ3NTE0IiwiZXhwIjoxNzQ0Mjk4MDQ5LCJqdGkiOiIxNWYxZTQyOS0yNWFlLTRiOTMtODk2OC00N2NjYTAwY2Q1YTYiLCJpYXQiOjE3NDQyMTE2NDksImlzcyI6IjY3ZjY4ZDgzMzNjZTc0YWI5YmU5NWJiZSIsIm5iZiI6MTc0NDIxMTY0OSwic3ViIjoiYXBpIn0.fx0ezpYYNuir70kjiPnrFzlbwiEtBXvzbM27z-ODlqc';
  } catch (error: any) {
    console.error('Error getting 100ms token:', error.message);
    throw error;
  }
};