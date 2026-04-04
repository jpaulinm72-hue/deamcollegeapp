import { useEffect, useRef } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams, Redirect } from "expo-router";
import * as Linking from "expo-linking";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import Colors from "@/constants/colors";

export default function AuthCallback() {
  const router = useRouter();
  const { code } = useLocalSearchParams();
  const deepLinkUrl = Linking.useURL();
  const { isAuthenticated } = useAuth();
  const hasExchanged = useRef(false);

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  useEffect(() => {
    const handleAuth = async () => {
      if (hasExchanged.current) return;
      
      // Get the URL from the deep link or browser
      const url = deepLinkUrl || (typeof window !== "undefined" ? window.location.href : "");
      
      if (code || url.includes("code=")) {
        hasExchanged.current = true;
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(url);
          if (error) throw error;
          router.replace("/(tabs)");
        } catch (error) {
          console.error("Token exchange failed:", error);
          router.replace("/login");
        }
      } else {
        // If no code, just check if we have a session already
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.replace("/(tabs)");
        } else {
          router.replace("/login");
        }
      }
    };

    handleAuth();
  }, [code, deepLinkUrl]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.background }}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}
