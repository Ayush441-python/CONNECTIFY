import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { authApi } from '../api';
import { api, extractErrorMessage, registerUnauthorizedHandler, setAccessToken } from '../lib/api';
import type { Profile, Role, User } from '../types';

interface AuthContextValue {
  user: User | null;
  profile: Profile;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  googleAuth: (idToken: string) => Promise<User | { isNewUser: boolean; signupToken: string; suggested: any }>;
  registerInfluencer: (payload: Record<string, unknown>) => Promise<User>;
  registerBrand: (payload: Record<string, unknown>) => Promise<User>;
  googleRegisterInfluencer: (payload: Record<string, unknown>) => Promise<User>;
  googleRegisterBrand: (payload: Record<string, unknown>) => Promise<User>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setProfile: (p: Profile) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile>(null);
  const [loading, setLoading] = useState(true);

  const hydrate = useCallback(async () => {
    try {
      const res = await authApi.me();
      setUser(res.data.data.user);
      setProfile(res.data.data.profile);
    } catch {
      setUser(null);
      setProfile(null);
      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      setUser(null);
      setProfile(null);
    });
    // Attempt silent refresh via httpOnly cookie on first load.
    (async () => {
      try {
        const res = await api.post('/auth/refresh');
        setAccessToken(res.data.data.accessToken);
        await hydrate();
      } catch {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await authApi.login(email, password);
      setAccessToken(res.data.data.accessToken);
      setUser(res.data.data.user);
      setProfile(res.data.data.profile);
      return res.data.data.user as User;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  }, []);

  const registerInfluencer = useCallback(async (payload: Record<string, unknown>) => {
    try {
      const res = await authApi.registerInfluencer({ ...payload, role: 'INFLUENCER' });
      setAccessToken(res.data.data.accessToken);
      setUser(res.data.data.user);
      setProfile(res.data.data.profile);
      return res.data.data.user as User;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  }, []);

  const registerBrand = useCallback(async (payload: Record<string, unknown>) => {
    try {
      const res = await authApi.registerBrand({ ...payload, role: 'BRAND' });
      setAccessToken(res.data.data.accessToken);
      setUser(res.data.data.user);
      setProfile(res.data.data.profile);
      return res.data.data.user as User;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  }, []);

  const googleAuth = useCallback(async (idToken: string) => {
    try {
      const res = await authApi.googleAuth(idToken);
      if (res.data.data.isNewUser) {
        return res.data.data;
      }
      setAccessToken(res.data.data.accessToken);
      setUser(res.data.data.user);
      setProfile(res.data.data.profile);
      return res.data.data.user as User;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  }, []);

  const googleRegisterInfluencer = useCallback(async (payload: Record<string, unknown>) => {
    try {
      const res = await authApi.googleRegisterInfluencer(payload);
      setAccessToken(res.data.data.accessToken);
      setUser(res.data.data.user);
      setProfile(res.data.data.profile);
      return res.data.data.user as User;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  }, []);

  const googleRegisterBrand = useCallback(async (payload: Record<string, unknown>) => {
    try {
      const res = await authApi.googleRegisterBrand(payload);
      setAccessToken(res.data.data.accessToken);
      setUser(res.data.data.user);
      setProfile(res.data.data.profile);
      return res.data.data.user as User;
    } catch (err) {
      throw new Error(extractErrorMessage(err));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
      setProfile(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, profile, loading, login, googleAuth, registerInfluencer, registerBrand, googleRegisterInfluencer, googleRegisterBrand, logout, refreshProfile: hydrate, setProfile }),
    [user, profile, loading, login, googleAuth, registerInfluencer, registerBrand, googleRegisterInfluencer, googleRegisterBrand, logout, hydrate]
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
