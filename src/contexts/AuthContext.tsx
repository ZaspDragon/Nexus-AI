import {
  createContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { getAuthRedirectUrl, isSupabaseConfigured, supabase } from '../services/supabase';
import type { AppMode, UserProfile } from '../types';

interface AuthActionResult {
  status: 'signed-in' | 'demo' | 'check-email';
}

interface AuthContextValue {
  currentUser: UserProfile | null;
  authLoading: boolean;
  mode: AppMode;
  isSupabaseReady: boolean;
  login: (email: string, password: string) => Promise<AuthActionResult>;
  signup: (name: string, email: string, password: string) => Promise<AuthActionResult>;
  continueDemo: (name?: string, email?: string) => Promise<AuthActionResult>;
  logout: () => Promise<void>;
  setMode: (mode: AppMode) => void;
}

const demoUserStorageKey = 'nexus-ai-user';

export const AuthContext = createContext<AuthContextValue | null>(null);

const createDemoProfile = (name: string, email: string): UserProfile => ({
  uid: `demo_${email.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'user'}`,
  organizationId: 'org_demo_nexus',
  displayName: name || 'Demo Operator',
  email: email || 'demo@nexus.ai',
  role: 'owner',
  demoMode: true,
});

const createLiveProfile = (user: User): UserProfile => ({
  uid: user.id,
  organizationId:
    typeof user.user_metadata.organizationId === 'string'
      ? user.user_metadata.organizationId
      : 'org_live_nexus',
  displayName:
    (typeof user.user_metadata.full_name === 'string' && user.user_metadata.full_name) ||
    (typeof user.user_metadata.name === 'string' && user.user_metadata.name) ||
    user.email?.split('@')[0] ||
    'NEXUS User',
  email: user.email || '',
  role: 'owner',
  demoMode: false,
});

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [mode, setModeState] = useState<AppMode>(isSupabaseConfigured ? 'supabase' : 'demo');

  useEffect(() => {
    const storedDemoUser = localStorage.getItem(demoUserStorageKey);
    if (storedDemoUser && mode === 'demo') {
      setCurrentUser(JSON.parse(storedDemoUser) as UserProfile);
      setAuthLoading(false);
      return;
    }

    if (mode === 'demo' || !supabase) {
      setCurrentUser(null);
      setAuthLoading(false);
      return;
    }

    const supabaseClient = supabase;
    let active = true;

    const hydrateSession = async () => {
      const { data, error } = await supabaseClient.auth.getSession();
      if (!active) return;

      if (error) {
        setCurrentUser(null);
        setAuthLoading(false);
        return;
      }

      setCurrentUser(data.session?.user ? createLiveProfile(data.session.user) : null);
      setAuthLoading(false);
    };

    void hydrateSession();

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setCurrentUser(session?.user ? createLiveProfile(session.user) : null);
      setAuthLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [mode]);

  const continueDemo = async (name = 'Demo Operator', email = 'demo@nexus.ai') => {
    const profile = createDemoProfile(name, email);
    localStorage.setItem(demoUserStorageKey, JSON.stringify(profile));
    setModeState('demo');
    setCurrentUser(profile);
    return { status: 'demo' } satisfies AuthActionResult;
  };

  const login = async (email: string, password: string) => {
    if (mode === 'demo' || !supabase) {
      return continueDemo(email.split('@')[0], email);
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user) {
      throw new Error('No user session returned from Supabase.');
    }

    setCurrentUser(createLiveProfile(data.user));
    return { status: 'signed-in' } satisfies AuthActionResult;
  };

  const signup = async (name: string, email: string, password: string) => {
    if (mode === 'demo' || !supabase) {
      return continueDemo(name, email);
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getAuthRedirectUrl(),
        data: {
          name,
          full_name: name,
          organizationId: 'org_live_nexus',
        },
      },
    });

    if (error) throw error;
    if (data.session && data.user) {
      setCurrentUser(createLiveProfile(data.user));
      return { status: 'signed-in' } satisfies AuthActionResult;
    }

    return { status: 'check-email' } satisfies AuthActionResult;
  };

  const logout = async () => {
    localStorage.removeItem(demoUserStorageKey);
    if (mode === 'supabase' && supabase) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
  };

  const setMode = (nextMode: AppMode) => {
    setModeState(nextMode === 'supabase' && !isSupabaseConfigured ? 'demo' : nextMode);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        authLoading,
        mode,
        isSupabaseReady: isSupabaseConfigured,
        login,
        signup,
        continueDemo,
        logout,
        setMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
