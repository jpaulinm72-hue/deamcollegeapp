import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Platform, Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, userData: { firstName: string, lastName: string, username: string }) => Promise<{ success: boolean; error?: string }>;
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

  const signUp = async (email: string, password: string, userData: { firstName: string, lastName: string, username: string }) => {
    let emailRedirectTo: string;
    if (Platform.OS === "web") {
      emailRedirectTo = (typeof window !== "undefined" ? window.location.origin : "") + "/auth-callback";
    } else {
      const ip = "192.168.0.115";
      emailRedirectTo = `exp://${ip}:8082/--/auth-callback`;
    }

    const { error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        emailRedirectTo,
        data: userData,
      }
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };



  const logout = async () => {
    console.log("Logout triggered");

    const performLogout = async () => {
      console.log("Performing logout...");
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("Supabase signOut error:", error.message);
          Alert.alert("Logout Error", error.message);
          return;
        }
        console.log("Logout successful, navigating to login");
        router.replace("/login");
      } catch (error: any) {
        console.error("Logout catch error:", error.message);
        Alert.alert("Logout Error", "Something went wrong. Please try again.");
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to sign out?")) {
        await performLogout();
      }
    } else {
      Alert.alert(
        "Confirm Logout",
        "Are you sure you want to sign out?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Log Out",
            style: "destructive",
            onPress: performLogout
          },
        ]
      );
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!session,
      isLoading,
      session,
      login,
      signUp,
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
