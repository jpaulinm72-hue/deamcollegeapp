import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useData } from "@/lib/data-context";
import { useAuth } from "@/lib/auth-context";

interface StatCardProps {
  label: string;
  value: number;
  icon: string;
  color: string;
  bgColor: string;
  onPress?: () => void;
}

function StatCard({ label, value, icon, color, bgColor, onPress }: StatCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.statCard, { opacity: pressed ? 0.8 : 1 }]}
      onPress={onPress}
    >
      <View style={[styles.statIcon, { backgroundColor: bgColor }]}>
        <Ionicons name={icon as any} size={22} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Pressable>
  );
}

interface QuickActionProps {
  label: string;
  icon: string;
  color: string;
  onPress: () => void;
}

function QuickAction({ label, icon, color, onPress }: QuickActionProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.quickAction, { opacity: pressed ? 0.75 : 1 }]}
      onPress={onPress}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: color + "18" }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </Pressable>
  );
}

export default function DashboardScreen() {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const { students, teachers, classes, payments } = useData();
  const { logout, session } = useAuth();
  
  const displayName = session?.user?.user_metadata?.username || "Admin";

  const toggleLanguage = async () => {
    const newLang = i18n.language === "en" ? "fr" : "en";
    await i18n.changeLanguage(newLang);
    await AsyncStorage.setItem("user-language", newLang);
  };

  const paidPayments = payments.filter(p => p.status === "paid");
  const unpaidPayments = payments.filter(p => p.status === "unpaid");
  const totalRevenue = paidPayments.reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = unpaidPayments.reduce((sum, p) => sum + p.amount, 0);

  const topPaddingWeb = Platform.OS === "web" ? 67 : 0;
  const bottomPaddingWeb = Platform.OS === "web" ? 34 : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + topPaddingWeb + 16,
          paddingBottom: insets.bottom + bottomPaddingWeb + 100,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>{t("welcome")}, {displayName}</Text>
          <Text style={styles.title}>{t("dashboard")}</Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable
            style={({ pressed }) => [styles.logoutBtn, { opacity: pressed ? 0.7 : 1, marginRight: 8 }]}
            onPress={toggleLanguage}
          >
            <Text style={{ fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.primary }}>
              {i18n.language === "en" ? "FR" : "EN"}
            </Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.logoutBtn, { opacity: pressed ? 0.7 : 1 }]}
            onPress={logout}
          >
            <Feather name="log-out" size={18} color={Colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      <View style={styles.heroCard}>
        <View>
          <Text style={styles.heroLabel}>{t("total_revenue")}</Text>
          <Text style={styles.heroValue}>${totalRevenue.toLocaleString()}</Text>
          <Text style={styles.heroPending}>${pendingAmount.toLocaleString()} {t("pending")}</Text>
        </View>
        <View style={styles.heroIcon}>
          <Ionicons name="analytics" size={36} color="rgba(255,255,255,0.9)" />
        </View>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          label={t("students")}
          value={students.length}
          icon="people"
          color="#3B82F6"
          bgColor="#EFF6FF"
          onPress={() => router.push("/(tabs)/students")}
        />
        <StatCard
          label={t("teachers")}
          value={teachers.length}
          icon="school"
          color="#8B5CF6"
          bgColor="#F5F3FF"
          onPress={() => router.push("/(tabs)/teachers")}
        />
        <StatCard
          label={t("classes")}
          value={classes.length}
          icon="library"
          color="#0EA5E9"
          bgColor="#F0F9FF"
          onPress={() => router.push("/(tabs)/classes")}
        />
        <StatCard
          label={t("payments")}
          value={payments.length}
          icon="card"
          color="#10B981"
          bgColor="#F0FDF4"
          onPress={() => router.push("/(tabs)/payments")}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("payment_overview")}</Text>
        <View style={styles.paymentOverview}>
          <View style={styles.paymentStat}>
            <View style={[styles.paymentDot, { backgroundColor: Colors.success }]} />
            <View>
              <Text style={styles.paymentStatLabel}>{t("paid")}</Text>
              <Text style={styles.paymentStatValue}>{paidPayments.length} {t("records")}</Text>
            </View>
          </View>
          <View style={styles.paymentDivider} />
          <View style={styles.paymentStat}>
            <View style={[styles.paymentDot, { backgroundColor: Colors.warning }]} />
            <View>
              <Text style={styles.paymentStatLabel}>{t("pending_status")}</Text>
              <Text style={styles.paymentStatValue}>{unpaidPayments.length} {t("records")}</Text>
            </View>
          </View>
        </View>
        {payments.length > 0 && (
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.round((paidPayments.length / payments.length) * 100)}%` as any },
              ]}
            />
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("quick_actions")}</Text>
        <View style={styles.quickActionsGrid}>
          <QuickAction
            label={t("add_student")}
            icon="person-add"
            color="#3B82F6"
            onPress={() => router.push("/student-form")}
          />
          <QuickAction
            label={t("add_teacher")}
            icon="add-circle"
            color="#8B5CF6"
            onPress={() => router.push("/teacher-form")}
          />
          <QuickAction
            label={t("new_class")}
            icon="albums"
            color="#0EA5E9"
            onPress={() => router.push("/class-form")}
          />
          <QuickAction
            label={t("record_payment")}
            icon="cash"
            color="#10B981"
            onPress={() => router.push("/payment-form")}
          />
        </View>
      </View>

      {students.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("recent_students")}</Text>
            <Pressable onPress={() => router.push("/(tabs)/students")}>
              <Text style={styles.seeAll}>{t("see_all")}</Text>
            </Pressable>
          </View>
          {students.slice(0, 3).map(student => {
            const cls = classes.find(c => c.id === student.classId);
            return (
              <Pressable
                key={student.id}
                style={({ pressed }) => [styles.studentRow, { opacity: pressed ? 0.7 : 1 }]}
                onPress={() => router.push(`/student/${student.id}`)}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {student.firstName[0]}{student.lastName[0]}
                  </Text>
                </View>
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{student.firstName} {student.lastName}</Text>
                  <Text style={styles.studentClass}>{cls?.name || "No class"}</Text>
                </View>
                <Feather name="chevron-right" size={18} color={Colors.muted} />
              </Pressable>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 20, gap: 24 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  greeting: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    marginTop: 2,
  },
  headerRight: { flexDirection: "row", alignItems: "center" },
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  heroCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.7)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  heroValue: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    color: Colors.surface,
    marginTop: 4,
  },
  heroPending: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.6)",
    marginTop: 4,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "44%",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  statLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
  },
  section: { gap: 12 },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  seeAll: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.accent,
  },
  paymentOverview: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  paymentStat: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  paymentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  paymentStatLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  paymentStatValue: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  paymentDivider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.border,
    marginHorizontal: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.success,
    borderRadius: 3,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickAction: {
    flex: 1,
    minWidth: "44%",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
    textAlign: "center",
  },
  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.accentLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.accent,
  },
  studentInfo: { flex: 1 },
  studentName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  studentClass: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
