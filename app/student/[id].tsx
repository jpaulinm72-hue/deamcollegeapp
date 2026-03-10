import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useData, Grade } from "@/lib/data-context";

const GRADE_COLORS: Record<string, string> = {
  "A+": Colors.success,
  "A": Colors.success,
  "A-": "#16A34A",
  "B+": Colors.accent,
  "B": Colors.accent,
  "B-": "#2563EB",
  "C+": Colors.warning,
  "C": Colors.warning,
  "C-": "#D97706",
  "D": Colors.error,
  "F": Colors.error,
};

function getGradeColor(grade: string): string {
  return GRADE_COLORS[grade] || Colors.muted;
}

export default function StudentDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { students, classes, grades, payments, deleteGrade } = useData();

  const student = students.find(s => s.id === id);
  const studentClass = classes.find(c => c.id === student?.classId);
  const studentGrades = grades.filter(g => g.studentId === id);
  const studentPayments = payments.filter(p => p.studentId === id);

  const topPaddingWeb = Platform.OS === "web" ? 67 : 0;
  const bottomPaddingWeb = Platform.OS === "web" ? 34 : 0;

  if (!student) {
    return (
      <View style={[styles.container, { alignItems: "center", justifyContent: "center" }]}>
        <Text style={styles.errorText}>Student not found</Text>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const handleDeleteGrade = (gradeId: string, subject: string) => {
    Alert.alert("Delete Grade", `Remove ${subject} grade?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await deleteGrade(gradeId);
        },
      },
    ]);
  };

  const paidCount = studentPayments.filter(p => p.status === "paid").length;
  const totalPaid = studentPayments.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + topPaddingWeb,
          paddingBottom: insets.bottom + bottomPaddingWeb + 40,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroSection}>
        <View style={styles.topBar}>
          <Pressable
            style={({ pressed }) => [styles.navBtn, { opacity: pressed ? 0.7 : 1 }]}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={20} color={Colors.text} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.editBtn, { opacity: pressed ? 0.7 : 1 }]}
            onPress={() => router.push({ pathname: "/student-form", params: { id: student.id } })}
          >
            <Feather name="edit-2" size={16} color={Colors.accent} />
            <Text style={styles.editBtnText}>Edit</Text>
          </Pressable>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.bigAvatar}>
            <Text style={styles.bigAvatarText}>
              {student.firstName[0]}{student.lastName[0]}
            </Text>
          </View>
          <Text style={styles.studentName}>{student.firstName} {student.lastName}</Text>
          <View style={styles.classBadge}>
            <Ionicons name="library" size={13} color={Colors.accent} />
            <Text style={styles.classBadgeText}>{studentClass?.name || "No class assigned"}</Text>
          </View>
        </View>
      </View>

      <View style={styles.infoCards}>
        <View style={styles.infoCard}>
          <Feather name="calendar" size={16} color={Colors.muted} />
          <View>
            <Text style={styles.infoLabel}>Date of Birth</Text>
            <Text style={styles.infoValue}>{student.dateOfBirth || "—"}</Text>
          </View>
        </View>
        <View style={styles.infoCard}>
          <Feather name="phone" size={16} color={Colors.muted} />
          <View>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{student.phone || "—"}</Text>
          </View>
        </View>
        <View style={styles.infoCard}>
          <Feather name="map-pin" size={16} color={Colors.muted} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.infoValue} numberOfLines={2}>{student.address || "—"}</Text>
          </View>
        </View>
        <View style={styles.infoCard}>
          <Feather name="user-check" size={16} color={Colors.muted} />
          <View>
            <Text style={styles.infoLabel}>Enrollment Date</Text>
            <Text style={styles.infoValue}>{student.enrollmentDate || "—"}</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderColor: Colors.accentLight }]}>
          <Text style={styles.statNum}>{studentGrades.length}</Text>
          <Text style={styles.statLbl}>Grades</Text>
        </View>
        <View style={[styles.statCard, { borderColor: Colors.successLight }]}>
          <Text style={[styles.statNum, { color: Colors.success }]}>${totalPaid}</Text>
          <Text style={styles.statLbl}>Paid ({paidCount})</Text>
        </View>
        <View style={[styles.statCard, { borderColor: Colors.warningLight }]}>
          <Text style={[styles.statNum, { color: Colors.warning }]}>
            {studentPayments.filter(p => p.status === "unpaid").length}
          </Text>
          <Text style={styles.statLbl}>Pending</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Grades</Text>
          <Pressable
            style={styles.sectionAddBtn}
            onPress={() => router.push({ pathname: "/grade-form", params: { studentId: student.id } })}
          >
            <Feather name="plus" size={14} color={Colors.accent} />
            <Text style={styles.sectionAddText}>Add Grade</Text>
          </Pressable>
        </View>

        {studentGrades.length === 0 ? (
          <View style={styles.emptySmall}>
            <Text style={styles.emptySmallText}>No grades recorded yet</Text>
          </View>
        ) : (
          studentGrades.map(grade => (
            <View key={grade.id} style={styles.gradeRow}>
              <View style={[styles.gradeBadge, { backgroundColor: getGradeColor(grade.grade) + "18" }]}>
                <Text style={[styles.gradeBadgeText, { color: getGradeColor(grade.grade) }]}>
                  {grade.grade}
                </Text>
              </View>
              <View style={styles.gradeInfo}>
                <Text style={styles.gradeSubject}>{grade.subject}</Text>
                <Text style={styles.gradeDate}>{grade.examDate}</Text>
              </View>
              <Pressable
                style={styles.gradeDeleteBtn}
                onPress={() => handleDeleteGrade(grade.id, grade.subject)}
              >
                <Feather name="trash-2" size={13} color={Colors.error} />
              </Pressable>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Payments</Text>
          <Pressable
            style={styles.sectionAddBtn}
            onPress={() => router.push({ pathname: "/payment-form", params: { studentId: student.id } })}
          >
            <Feather name="plus" size={14} color={Colors.accent} />
            <Text style={styles.sectionAddText}>Add Payment</Text>
          </Pressable>
        </View>

        {studentPayments.length === 0 ? (
          <View style={styles.emptySmall}>
            <Text style={styles.emptySmallText}>No payments recorded yet</Text>
          </View>
        ) : (
          studentPayments.map(payment => (
            <View key={payment.id} style={styles.paymentRow}>
              <View style={[styles.paymentIcon, {
                backgroundColor: payment.status === "paid" ? Colors.successLight : Colors.warningLight,
              }]}>
                <Ionicons
                  name={payment.status === "paid" ? "checkmark-circle" : "time"}
                  size={18}
                  color={payment.status === "paid" ? Colors.success : Colors.warning}
                />
              </View>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentMonth}>{payment.month}</Text>
                <Text style={styles.paymentDate}>
                  {payment.status === "paid" ? `Paid ${payment.paymentDate}` : "Pending"}
                </Text>
              </View>
              <Text style={[styles.paymentAmount, {
                color: payment.status === "paid" ? Colors.success : Colors.warning,
              }]}>
                ${payment.amount}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { gap: 20 },
  heroSection: {
    backgroundColor: Colors.surface,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.accentLight,
  },
  editBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.accent },
  profileSection: { alignItems: "center", paddingTop: 16, gap: 10 },
  bigAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accentLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Colors.surface,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  bigAvatarText: { fontSize: 28, fontFamily: "Inter_700Bold", color: Colors.accent },
  studentName: { fontSize: 24, fontFamily: "Inter_700Bold", color: Colors.text },
  classBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  classBadgeText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.accent },
  infoCards: { paddingHorizontal: 20, gap: 10 },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: Colors.muted, textTransform: "uppercase", letterSpacing: 0.5 },
  infoValue: { fontSize: 15, fontFamily: "Inter_500Medium", color: Colors.text, marginTop: 2 },
  statsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 20 },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 4,
  },
  statNum: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.text },
  statLbl: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textSecondary },
  section: { paddingHorizontal: 20, gap: 10 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text },
  sectionAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: Colors.accentLight,
  },
  sectionAddText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.accent },
  emptySmall: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptySmallText: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.muted },
  gradeRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gradeBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  gradeBadgeText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  gradeInfo: { flex: 1 },
  gradeSubject: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text },
  gradeDate: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.muted, marginTop: 2 },
  gradeDeleteBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.errorLight,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  paymentIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentInfo: { flex: 1 },
  paymentMonth: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text },
  paymentDate: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.muted, marginTop: 2 },
  paymentAmount: { fontSize: 16, fontFamily: "Inter_700Bold" },
  errorText: { fontSize: 16, fontFamily: "Inter_500Medium", color: Colors.textSecondary },
  backBtn: { marginTop: 12, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: Colors.primary, borderRadius: 10 },
  backBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.surface },
});
