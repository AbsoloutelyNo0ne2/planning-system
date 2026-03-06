import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { UserType, AuthContextValue } from '../types/auth';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [userType, setUserType] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check existing session on mount
  useEffect(() => {
    async function verifySession() {
      try {
        const response = await fetch('/api/auth/verify', {
          method: 'GET',
          credentials: 'include',
        });
        
        const data = await response.json();
        
        if (data.success && data.userType) {
          setUserType(data.userType);
        }
      } catch (error) {
        console.error('Session verification failed:', error);
      } finally {
        setIsLoading(false);
      }
    }

    verifySession();
  }, []);

  const login = useCallback(async (passphrase: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ passphrase }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUserType(data.userType);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Authentication failed' };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setUserType(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, []);

  const value: AuthContextValue = {
    userType,
    isAuthenticated: !!userType,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
