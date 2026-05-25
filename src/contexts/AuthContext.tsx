import {
  createContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../services/firebase';
import type { AppMode, UserProfile } from '../types';

interface AuthContextValue {
  currentUser: UserProfile | null;
  authLoading: boolean;
  mode: AppMode;
  isFirebaseReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  continueDemo: (name?: string, email?: string) => Promise<void>;
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

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [mode, setMode] = useState<AppMode>(isFirebaseConfigured ? 'firebase' : 'demo');

  useEffect(() => {
    const storedDemoUser = localStorage.getItem(demoUserStorageKey);
    if (storedDemoUser && mode === 'demo') {
      setCurrentUser(JSON.parse(storedDemoUser) as UserProfile);
      setAuthLoading(false);
      return;
    }

    if (mode === 'demo' || !auth) {
      setAuthLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setCurrentUser(null);
        setAuthLoading(false);
        return;
      }

      setCurrentUser({
        uid: firebaseUser.uid,
        organizationId: 'org_live_nexus',
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'NEXUS User',
        email: firebaseUser.email || '',
        role: 'owner',
        demoMode: false,
      });
      setAuthLoading(false);
    });

    return unsubscribe;
  }, [mode]);

  const continueDemo = async (name = 'Demo Operator', email = 'demo@nexus.ai') => {
    const profile = createDemoProfile(name, email);
    localStorage.setItem(demoUserStorageKey, JSON.stringify(profile));
    setMode('demo');
    setCurrentUser(profile);
  };

  const login = async (email: string, password: string) => {
    if (mode === 'demo' || !auth) {
      await continueDemo(email.split('@')[0], email);
      return;
    }

    const credential = await signInWithEmailAndPassword(auth, email, password);
    setCurrentUser({
      uid: credential.user.uid,
      organizationId: 'org_live_nexus',
      displayName: credential.user.displayName || email.split('@')[0],
      email,
      role: 'owner',
      demoMode: false,
    });
  };

  const signup = async (name: string, email: string, password: string) => {
    if (mode === 'demo' || !auth) {
      await continueDemo(name, email);
      return;
    }

    const credential = await createUserWithEmailAndPassword(auth, email, password);
    setCurrentUser({
      uid: credential.user.uid,
      organizationId: 'org_live_nexus',
      displayName: name,
      email,
      role: 'owner',
      demoMode: false,
    });
  };

  const logout = async () => {
    localStorage.removeItem(demoUserStorageKey);
    if (mode === 'firebase' && auth) {
      await signOut(auth);
    }
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        authLoading,
        mode,
        isFirebaseReady: isFirebaseConfigured,
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
