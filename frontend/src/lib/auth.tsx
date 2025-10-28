import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import type { AuthLoginRequest, AuthRegisterRequest, AuthSuccessResponse, User } from '../../TYPES';
import { ApiError, apiFetch } from './api';

type AuthResult =
  | { success: true; user: User }
  | { success: false; message: string };

interface AuthContextValue {
  user: User | null;
  token: string | null;
  initializing: boolean;
  pending: boolean;
  login: (credentials: AuthLoginRequest) => Promise<AuthResult>;
  register: (payload: AuthRegisterRequest) => Promise<AuthResult>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const LOCAL_STORAGE_KEY = 'customer-voice-auth-token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(LOCAL_STORAGE_KEY));
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState<boolean>(true);
  const [pending, setPending] = useState<boolean>(false);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }, []);

  const refresh = useCallback(async () => {
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const data = await apiFetch<{ user: User }>('/auth/me', { token });
      setUser(data.user);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        logout();
      }
    }
  }, [token, logout]);

  useEffect(() => {
    let active = true;
    if (!token) {
      setInitializing(false);
      setUser(null);
      return;
    }

    setInitializing(true);

    apiFetch<{ user: User }>('/auth/me', { token })
      .then((data) => {
        if (!active) {
          return;
        }
        setUser(data.user);
      })
      .catch((error) => {
        if (!active) {
          return;
        }
        if (error instanceof ApiError && error.status === 401) {
          logout();
        }
      })
      .finally(() => {
        if (active) {
          setInitializing(false);
        }
      });

    return () => {
      active = false;
    };
  }, [token, logout]);

  const performAuth = useCallback(
    async (path: string, body: AuthLoginRequest | AuthRegisterRequest): Promise<AuthResult> => {
      setPending(true);
      try {
        const data = await apiFetch<AuthSuccessResponse>(path, {
          method: 'POST',
          body: JSON.stringify(body),
        });
        setToken(data.token);
        localStorage.setItem(LOCAL_STORAGE_KEY, data.token);
        setUser(data.user);
        return { success: true, user: data.user };
      } catch (error) {
        let message = 'Unable to process your request. Please try again.';
        if (error instanceof ApiError) {
          message = typeof error.payload === 'object' && error.payload && 'message' in error.payload ? String(error.payload.message) : error.message;
        }
        return { success: false, message };
      } finally {
        setPending(false);
      }
    },
    []
  );

  const login = useCallback(
    (credentials: AuthLoginRequest) => performAuth('/auth/login', credentials),
    [performAuth]
  );

  const register = useCallback(
    (payload: AuthRegisterRequest) => performAuth('/auth/register', payload),
    [performAuth]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      initializing,
      pending,
      login,
      register,
      logout,
      refresh,
    }),
    [user, token, initializing, pending, login, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
