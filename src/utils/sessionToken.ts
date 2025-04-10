export enum SESSION_KEYS {
  REGISTRATION = 'registration_session',
  PASSWORD_RESET = 'password_reset_session',
  AUTH = 'auth_session'
}

export interface SessionData {
  email?: string;
  token?: string;
  timestamp: number;
  countdownEnd?: number;
}

export function getSession(key: SESSION_KEYS): SessionData | null {
  const sessionData = sessionStorage.getItem(key);
  if (!sessionData) return null;
  
  try {
    return JSON.parse(sessionData) as SessionData;
  } catch (error) {
    console.error('Error parsing session data:', error);
    return null;
  }
}

export function setSession(key: SESSION_KEYS, data: SessionData): void {
  sessionStorage.setItem(key, JSON.stringify(data));
}

export function clearSession(key: SESSION_KEYS): void {
  sessionStorage.removeItem(key);
}

export function updateSession(key: SESSION_KEYS, updates: Partial<SessionData>): void {
  const session = getSession(key);
  if (session) {
    setSession(key, { ...session, ...updates });
  }
}
