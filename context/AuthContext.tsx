"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { getCurrentUser, signOut as supabaseSignOut } from "@/lib/auth"; // Assuming auth functions are in '@/lib/auth'

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  // Add login/signup functions if they are to be managed globally here
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const { user: currentUser, session: currentSession } = await getCurrentUser();
        setUser(currentUser);
        setSession(currentSession);
      } catch (error) {
        console.error("Error fetching user on mount:", error);
        // Handle error, perhaps clear user state or set an error flag
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();

    // Optional: Subscribe to Supabase auth state changes for real-time updates
    // const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
    //   console.log("Supabase auth state changed:", event, session);
    //   setUser(session?.user || null);
    //   setSession(session);
    // });

    // Cleanup listener on unmount
    // return () => {
    //   authListener?.unsubscribe();
    // };
  }, []);

  const signOut = async () => {
    await supabaseSignOut();
    setUser(null);
    setSession(null);
    // Redirect to login page or clear relevant state
    window.location.href = '/auth/login';
  };

  const isAuthenticated = !!user && !!session;

  return (
    <AuthContext.Provider value={{ user, session, isLoading, isAuthenticated, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
