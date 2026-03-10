// src/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isPartner: boolean;
  phone?: string;
  partnerType?: 'individual' | 'company';
  community?: 'working' | 'business';
  communityType?: 'working-class' | 'business-class';

  partner_profile?: {
    id: number;
    partner_type: 'individual' | 'company';
    community: 'working' | 'business';
    bio: string | null;
    location: string | null;
    organization: string | null;
    total_given: string;
    months_active: number;
    joined_at: string;
    member_since: string;
    last_active: string;
    is_active: boolean;
  };
}

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextType {
  user: User | null;
  authStatus: AuthStatus;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  checkAuth: () => Promise<void>;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  commitment?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setAuthStatus('loading');

    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        setUser(null);
        setAuthStatus('unauthenticated');
        return;
      }

      const data = await response.json();

      if (data.authenticated && data.user) {
        const userData = data.user;

        setUser({
          id: String(userData.id),
          email: userData.email,
          firstName: userData.first_name || '',
          lastName: userData.last_name || '',
          isPartner: userData.is_partner === true,
          phone: userData.partner_profile?.phone, // Get phone from partner_profile
          partnerType: userData.partner_profile?.partner_type,
          community: userData.partner_profile?.community,
          communityType:
            userData.partner_profile?.community === 'business' ? 'business-class' : 'working-class',

          // ✅ STORE THE ENTIRE PARTNER PROFILE
          partner_profile: userData.partner_profile,
        });

        setAuthStatus('authenticated');
      } else {
        setUser(null);
        setAuthStatus('unauthenticated');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setAuthStatus('unauthenticated');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      await checkAuth();
      return { success: true };
    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      setUser(null);
      setAuthStatus('unauthenticated');
      router.push('/partnership/landing');
    }
  };

  /**
   * TEMPORARY
   * This will be replaced by "request partnership" flow
   */
  const register = async (userData: RegisterData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      return { success: true };
    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authStatus,
        isAuthenticated: authStatus === 'authenticated',
        isLoading: authStatus === 'loading',
        login,
        logout,
        register,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
