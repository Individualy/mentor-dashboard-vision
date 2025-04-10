import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { getUserInfo, UserInfo } from '@/lib/api';

interface UserContextType {
  user: UserInfo | null;
  token: string | null;
  setUser: React.Dispatch<React.SetStateAction<UserInfo | null>>;
  loading: boolean;
  error: string | null;
  fetchUserInfo: () => Promise<UserInfo | null>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserInfo = async (): Promise<UserInfo | null> => {
    const currentToken = localStorage.getItem('token');
    console.log('Token from localStorage:', currentToken ? 'Token exists' : 'No token');

    if (currentToken) {
      setToken(currentToken);
    }

    if (!currentToken) {
      setLoading(false);
      setError('No authentication token found');
      return null;
    }

    try {
      console.log('Fetching user info with token...');
      // Clear any previous error
      setError(null);

      const userData = await getUserInfo(currentToken);
      console.log('User data received:', userData);

      if (!userData) {
        setError('No user data received from server');
        return null;
      }

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (err: any) {
      console.error('Error fetching user info:', err);

      // Handle specific error cases
      if (err.response && err.response.status === 401) {
        setError('Authentication failed. Please log in again.');
        // Clear invalid token
        localStorage.removeItem('token');
      } else {
        setError('Failed to fetch user information');
      }

      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  useEffect(() => {
    // Try to get user from localStorage first
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    console.log('UserContext initialization:');
    console.log('- Token exists:', !!token);
    console.log('- Stored user exists:', !!storedUser);

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('- Parsed user:', parsedUser);
        setUser(parsedUser);
        setLoading(false);
      } catch (err) {
        console.error('Error parsing stored user:', err);
        // If parsing fails, fetch from API
        if (token) {
          console.log('- Fetching user info due to parse error');
          fetchUserInfo();
        } else {
          console.log('- No token available, cannot fetch user info');
          setLoading(false);
        }
      }
    } else if (token) {
      // If no stored user but token exists, fetch from API
      console.log('- No stored user but token exists, fetching from API');
      fetchUserInfo();
    } else {
      // No token, no user
      console.log('- No token, no user, setting loading to false');
      setLoading(false);
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, token, setUser, loading, error, fetchUserInfo, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
