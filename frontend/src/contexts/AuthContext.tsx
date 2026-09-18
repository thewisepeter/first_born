// src/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ensureCsrfToken } from '../app/lib/csrf';

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

interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  location?: string;
  organization?: string;
  partnerType?: 'individual' | 'company';
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
  checkAuth: () => Promise<boolean>;
  updateProfile: (data: UpdateProfileData) => Promise<{ success: boolean; error?: string }>;
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
      const response = await fetch('/api/auth/me/', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        credentials: 'include',
      });

      if (response.status === 401) {
        setUser(null);
        setAuthStatus('unauthenticated');
        return false;
      }

      if (!response.ok) {
        setUser(null);
        setAuthStatus('unauthenticated');
        return false;
      }

      const result = await response.json();
      const data = result.user;
      if (data && data.id) {
        setUser({
          id: String(data.id),
          email: data.email,
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          isPartner: data.is_partner === true,
          phone: data.partner_profile?.phone,
          partnerType: data.partner_profile?.partner_type,
          community: data.partner_profile?.community,
          communityType:
            data.partner_profile?.community === 'business' ? 'business-class' : 'working-class',
          partner_profile: data.partner_profile,
        });
        setAuthStatus('authenticated');
        return true;
      } else {
        setUser(null);
        setAuthStatus('unauthenticated');
        return false;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setAuthStatus('unauthenticated');
      return false;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const csrfToken = await ensureCsrfToken();

      const response = await fetch('/api/auth/login/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken, // ✅ THIS FIXES YOUR ISSUE
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      if (!(await checkAuth())) {
        return {
          success: false,
          error: 'Sign-in could not establish a session. Please allow cookies and try again.',
        };
      }
      return { success: true };
    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout/', {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      setUser(null);
      setAuthStatus('unauthenticated');
      router.push('/partnership/landing');
    }
  };

  // In AuthContext.tsx
  const updateProfile = async (
    data: UpdateProfileData
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const getCSRFToken = () => {
        const match = document.cookie.match(/csrftoken=([^;]+)/);
        return match ? match[1] : '';
      };

      const response = await fetch('/api/partners/profile/', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken(),
          Referer: window.location.origin,
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.error || 'Failed to update profile' };
      }

      const result = await response.json();
      const updatedProfile = result.profile || result;

      // Update the user state
      if (user && updatedProfile) {
        setUser({
          ...user,
          firstName: updatedProfile.first_name || user.firstName,
          lastName: updatedProfile.last_name || user.lastName,
          phone: updatedProfile.phone || user.phone,
          partnerType: updatedProfile.partner_type || user.partnerType,
          community: updatedProfile.community || user.community,
          partner_profile: updatedProfile,
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  /**
   * TEMPORARY
   * This will be replaced by "request partnership" flow
   */
  const register = async (userData: RegisterData) => {
    try {
      const response = await fetch('/api/auth/register/', {
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
        updateProfile,
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
