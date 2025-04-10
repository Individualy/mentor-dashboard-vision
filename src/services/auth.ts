import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

interface ApiResponse {
  error?: string;
  message?: string;
  success?: boolean;
}

export async function verifyEmail(email: string, code: string): Promise<ApiResponse> {
  try {
    // Get session token from session storage
    const sessionData = sessionStorage.getItem('registration_session');
    let session_token = null;

    if (sessionData) {
      try {
        const parsedData = JSON.parse(sessionData);
        session_token = parsedData.token;
        console.log('Using session token from storage:', session_token);
      } catch (e) {
        console.error('Error parsing session data:', e);
      }
    }

    if (!session_token) {
      console.warn('No session token found in storage, trying fallback method');
      session_token = getSessionTokenFromStorage(email);
    }

    console.log('Sending verification request with:', { email, code, session_token });

    const response = await axios.post(`${API_URL}/verify-email`, {
      email,
      code,
      session_token
    });

    return {
      success: true,
      message: (response.data as { message: string }).message
    };
  } catch (error) {
    console.error('Error verifying email:', error);

    if (error && 'isAxiosError' in error && error.response) {
      return {
        error: error.response.data.message || 'Verification failed. Please try again.'
      };
    }

    return {
      error: 'Network error. Please check your connection and try again.'
    };
  }
}

export async function resendVerificationCode(email: string): Promise<ApiResponse> {
  try {
    // This is a simplified implementation - in a real app, you'd have a dedicated endpoint
    const response = await axios.post(`${API_URL}/signup`, {
      email,
      resend: true
    });

    // Store the new session token if provided
    if (typeof response.data === 'object' && response.data && 'session_token' in response.data) {
      storeSessionToken(email, response.data.session_token as string);
    }

    return {
      success: true,
      message: (response.data as { message: string }).message
    };
  } catch (error) {
    console.error('Error resending verification code:', error);

    if (error && 'isAxiosError' in error && error.response) {
      return {
        error: error.response.data.message || 'Failed to resend code. Please try again.'
      };
    }

    return {
      error: 'Network error. Please check your connection and try again.'
    };
  }
}

// Helper functions for session token management
function storeSessionToken(email: string, token: string): void {
  sessionStorage.setItem(`session_token_${email}`, token);
}

function getSessionTokenFromStorage(email: string): string | null {
  return sessionStorage.getItem(`session_token_${email}`);
}
