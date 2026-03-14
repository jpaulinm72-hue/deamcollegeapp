import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useAuth } from "@/lib/auth-context";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const result = await login(email.trim(), password);
      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError(result.error || "Invalid email or password");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setIsGoogleLoading(true);
    try {
      const result = await loginWithGoogle();
      if (!result.success && result.error && result.error !== "Google sign-in was cancelled") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError(result.error);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={[styles.flex, { backgroundColor: Colors.primary }]}
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 20),
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 20),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Feather name="book-open" size={40} color={Colors.surface} />
          </View>
          <Text style={styles.appName}>SchoolAdmin</Text>
          <Text style={styles.subtitle}>Administration Portal</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome back</Text>
          <Text style={styles.cardSubtitle}>Sign in to your admin account</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={16} color={Colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Google Sign-In */}
          <Pressable
            style={({ pressed }) => [
              styles.googleButton,
              { opacity: pressed || isGoogleLoading ? 0.8 : 1 },
            ]}
            onPress={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
            testID="google-signin-btn"
          >
            {isGoogleLoading ? (
              <ActivityIndicator color={Colors.text} />
            ) : (
              <>
                <View style={styles.googleIconBox}>
                  <Text style={styles.googleG}>G</Text>
                </View>
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </>
            )}
          </Pressable>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or sign in with email</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Feather name="mail" size={18} color={Colors.muted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={Colors.muted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                testID="email-input"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Feather name="lock" size={18} color={Colors.muted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={Colors.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
                testID="password-input"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={Colors.muted} />
              </Pressable>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              { opacity: pressed || isLoading ? 0.85 : 1 },
            ]}
            onPress={handleLogin}
            disabled={isLoading || isGoogleLoading}
            testID="signin-btn"
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.surface} />
            ) : (
              <>
                <Text style={styles.loginButtonText}>Sign In</Text>
                <Feather name="arrow-right" size={18} color={Colors.surface} />
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    gap: 32,
  },
  header: {
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  appName: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: Colors.surface,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.65)",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 28,
    gap: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  cardSubtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    marginTop: -10,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.errorLight,
    padding: 12,
    borderRadius: 10,
  },
  errorText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.error,
    flex: 1,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  googleIconBox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: "#4285F4",
    alignItems: "center",
    justifyContent: "center",
  },
  googleG: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    lineHeight: 16,
  },
  googleButtonText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.muted,
  },
  inputGroup: { gap: 6 },
  label: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    gap: 10,
  },
  inputIcon: { flexShrink: 0 },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.text,
  },
  eyeButton: { padding: 4 },
  loginButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  loginButtonText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.surface,
  },
});
