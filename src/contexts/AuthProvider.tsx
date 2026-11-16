import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { toast } from '@/components/ui/use-toast';
import {
  login as apiLogin,
  logout as apiLogout,
  fetchCurrentUser,
  fetchUserProfile,
  updateUserProfile,
  uploadAvatar,
  removeAvatar,
  fetchUserPreferences,
  updateUserPreferences,
} from '@/api/client';
import type { User, UserPreference } from '@/types';
import { useTheme } from './ThemeProvider';

interface AuthUser {
  user: User | null;
  preferences: any;
  loading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<boolean>;
  register: (name: string, email: string, password: string, terms: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  updatePreferences: (data: Partial<UserPreference>) => Promise<boolean>;
  uploadAvatarFn: (file: File) => Promise<boolean>;
  removeAvatarFn: () => Promise<boolean>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthUser | null>(null);

function getStoredUser(): User | null {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem('finara_user');
  return raw ? JSON.parse(raw) : null;
}

function setStoredUser(user: User | null) {
  if (typeof localStorage === 'undefined') return;
  if (user) localStorage.setItem('finara_user', JSON.stringify(user));
  else localStorage.removeItem('finara_user');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [preferences, setPreferences] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { setTheme, theme, resolvedTheme, toggleTheme } = useTheme();

  useEffect(() => {
    const verify = async () => {
      const stored = getStoredUser();
      if (stored && stored.email) {
        setUser(stored);
        setIsAuthenticated(true);
      }
      try {
        const u = await fetchCurrentUser();
        setUser(u);
        setIsAuthenticated(true);
      } catch {
        setUser(null);
        setIsAuthenticated(false);
      }
      try {
        const p = await fetchUserPreferences();
        setPreferences(p);
      } catch {
        setPreferences(null);
      }
      setLoading(false);
    };
    verify();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean) => {
    try {
      const data = await apiLogin({ email, password, rememberMe });
      const u = data.user;
      setUser(u);
      setIsAuthenticated(true);
      setStoredUser(u);
      if (!data.demoMode) {
        localStorage.setItem('finara_token', data.token);
      }
      toast({ title: 'Logged in', description: `Welcome back, ${u.displayName}` });
      return true;
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Login failed', description: err instanceof Error ? err.message : 'Invalid credentials' });
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, terms: boolean) => {
    try {
      const data = await apiLogin({ email, password, rememberMe: false });
      // For demo, we reuse the existing user account
      const u = { id: 'user_demo_001', fullName: name, displayName: name.split(' ')[0], email, phoneNumber: '', dateOfBirth: null, country: '', city: '', address: null, preferredLanguage: 'id', preferredCurrency: 'IDR', timeZone: 'Asia/Jakarta', avatarUrl: null, createdAt: new Date().toISOString() };
      setUser(u);
      setIsAuthenticated(true);
      setStoredUser(u);
      toast({ title: 'Account created', description: 'Welcome to Finara' });
      return true;
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Registration failed', description: err instanceof Error ? err.message : 'Failed to register' });
      return false;
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch {
      // ignore
    }
    setUser(null);
    setIsAuthenticated(false);
    setStoredUser(null);
    localStorage.removeItem('finara_token');
    toast({ title: 'Logged out' });
  };

  const refresh = async () => {
    try {
      const u = await fetchCurrentUser();
      setUser(u);
      setIsAuthenticated(true);
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const u = await updateUserProfile(data);
      setUser(u);
      setStoredUser(u);
      toast({ title: 'Profile updated' });
      return true;
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Update failed', description: err instanceof Error ? err.message : 'Failed to update profile' });
      return false;
    }
  };

  const uploadAvatarFn = async (file: File) => {
    try {
      const u = await uploadAvatar(file);
      setUser(u);
      setStoredUser(u);
      toast({ title: 'Avatar uploaded' });
      return true;
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Upload failed', description: err instanceof Error ? err.message : 'Failed to upload avatar' });
      return false;
    }
  };

  const updatePreferences = async (data: Partial<UserPreference>) => {
    try {
      await updateUserPreferences(data);
      setPreferences((prev: any) => ({ ...prev, ...data }));
      toast({ title: 'Preferences updated' });
      return true;
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Update failed', description: err instanceof Error ? err.message : 'Failed to update preferences' });
      return false;
    }
  };

  const removeAvatarFn = async () => {
    try {
      const u = await removeAvatar();
      setUser(u);
      setStoredUser(u);
      toast({ title: 'Avatar removed' });
      return true;
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Removal failed', description: err instanceof Error ? err.message : 'Failed to remove avatar' });
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, preferences, loading, login, register, logout, refresh, updateProfile, updatePreferences, uploadAvatarFn, removeAvatarFn, isAuthenticated, isLoading: loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
