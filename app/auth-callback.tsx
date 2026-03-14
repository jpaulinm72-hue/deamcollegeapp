import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import Colors from "@/constants/colors";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    if (url.includes("code=")) {
      supabase.auth.exchangeCodeForSession(url).then(() => {
        router.replace("/(tabs)");
      });
    } else {
      router.replace("/login");
    }
  }, []);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.background }}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}
