
"use client";

import type { ReactNode } from 'react';
import { useEffect, useState, createContext, useContext } from 'react';
import { auth, googleProvider } from '@/lib/firebase/config';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, type User } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged will handle setting user and setLoading(false)
      toast({ title: "Signed In", description: "Successfully signed in with Google." });
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      toast({ variant: "destructive", title: "Sign In Failed", description: error.message || "Could not sign in with Google." });
      setLoading(false); 
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      // onAuthStateChanged will handle setting user to null and setLoading(false)
      toast({ title: "Signed Out", description: "Successfully signed out." });
    } catch (error: any) {
      console.error("Error signing out:", error);
      toast({ variant: "destructive", title: "Sign Out Failed", description: error.message || "Could not sign out." });
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
