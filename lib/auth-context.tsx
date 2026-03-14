import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const loginWithGoogle = async () => {
    try {
      let redirectTo: string;
      if (Platform.OS === "web") {
        redirectTo = (typeof window !== "undefined" ? window.location.origin : "") + "/auth-callback";
      } else {
        redirectTo = Linking.createURL("/auth-callback");
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error) return { success: false, error: error.message };
      if (!data?.url) return { success: false, error: "No OAuth URL returned" };

      if (Platform.OS === "web") {
        if (typeof window !== "undefined") window.location.href = data.url;
        return { success: true };
      }

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      if (result.type === "success" && result.url) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(result.url);
        if (exchangeError) return { success: false, error: exchangeError.message };
        return { success: true };
      }

      return { success: false, error: "Google sign-in was cancelled" };
    } catch (e: any) {
      return { success: false, error: e?.message || "Google sign-in failed" };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!session,
      isLoading,
      session,
      login,
      loginWithGoogle,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
