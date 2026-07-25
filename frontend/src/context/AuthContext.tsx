import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/react';
import { api } from '../lib/api';
import type { Profile, Role, User } from '../types';
import { useNavigate } from 'react-router-dom';

interface AuthContextValue {
  user: User | null;
  profile: Profile;
  loading: boolean;
  needsOnboarding: boolean;
  refreshProfile: () => Promise<void>;
  setProfile: (p: Profile) => void;
  clerkRegisterInfluencer: (payload: Record<string, unknown>) => Promise<void>;
  clerkRegisterBrand: (payload: Record<string, unknown>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const { getToken } = useClerkAuth();
  
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const hydrate = useCallback(async () => {
    if (!isSignedIn) {
      setUser(null);
      setProfile(null);
      setNeedsOnboarding(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/clerk-sync');
      if (res.data.data.isNewUser) {
        setNeedsOnboarding(true);
        setUser(null);
        setProfile(null);
      } else {
        setUser(res.data.data.user);
        setProfile(res.data.data.profile);
        setNeedsOnboarding(false);
      }
    } catch (error) {
      console.error('Failed to sync Clerk user with backend:', error);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (isLoaded) {
      hydrate();
    }
  }, [isLoaded, isSignedIn, clerkUser?.id]); // Refetch when Clerk user changes

  const clerkRegisterInfluencer = useCallback(async (payload: Record<string, unknown>) => {
    try {
      const res = await api.post('/auth/clerk/register/influencer', payload);
      setUser(res.data.data.user);
      setProfile(res.data.data.profile);
      setNeedsOnboarding(false);
    } catch (error) {
      throw error; // Let the component handle it
    }
  }, []);

  const clerkRegisterBrand = useCallback(async (payload: Record<string, unknown>) => {
    try {
      const res = await api.post('/auth/clerk/register/brand', payload);
      setUser(res.data.data.user);
      setProfile(res.data.data.profile);
      setNeedsOnboarding(false);
    } catch (error) {
      throw error; // Let the component handle it
    }
  }, []);

  const value = useMemo(
    () => ({ user, profile, loading: !isLoaded || loading, needsOnboarding, refreshProfile: hydrate, setProfile, clerkRegisterInfluencer, clerkRegisterBrand }),
    [user, profile, isLoaded, loading, needsOnboarding, hydrate, clerkRegisterInfluencer, clerkRegisterBrand]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useDashboardBasePath(role?: Role) {
  const r = role;
  if (r === 'BRAND') return '/brand';
  if (r === 'INFLUENCER') return '/influencer';
  if (r === 'ADMIN') return '/admin';
  return '/';
}
