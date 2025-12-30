import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { signIn, signOut, getCurrentUser } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  try {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    return !!(url && key && url !== 'your_supabase_url' && key !== 'your_anon_key');
  } catch {
    return false;
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const useSupabase = isSupabaseConfigured();

  useEffect(() => {
    if (useSupabase) {
      // Check current user
      getCurrentUser()
        .then((data) => {
          if (data?.profile) {
            setUser(data.profile);
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });

      // Listen to auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          try {
            const data = await getCurrentUser();
            if (data?.profile) {
              setUser(data.profile);
            }
          } catch (error) {
            console.error('Error getting user:', error);
          }
        } else {
          setUser(null);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      // Fallback to mock data
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    }
  }, [useSupabase]);

  const login = async (email: string, password: string): Promise<boolean> => {
    if (useSupabase) {
      try {
        const { profile } = await signIn(email, password);
        if (profile) {
          setUser(profile);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    } else {
      // Mock authentication fallback
      await new Promise((resolve) => setTimeout(resolve, 500));

      let role: 'admin' | 'dosen' | 'mahasiswa' = 'mahasiswa';
      if (email.includes('admin')) role = 'admin';
      else if (email.includes('dosen') || email.includes('budi')) role = 'dosen';

      const mockUser: User = {
        id: `user-${Date.now()}`,
        name: email.split('@')[0],
        email,
        role,
      };

      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      return true;
    }
  };

  const logout = async () => {
    if (useSupabase) {
      try {
        await signOut();
        setUser(null);
      } catch (error) {
        console.error('Logout error:', error);
      }
    } else {
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};