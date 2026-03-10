import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useData } from "@/lib/data-context";

const MONTHS = [
  "January 2025", "February 2025", "March 2025", "April 2025",
  "May 2025", "June 2025", "July 2025", "August 2025",
  "September 2025", "October 2025", "November 2025", "December 2025",
];

export default function PaymentFormScreen() {
  const insets = useSafeAreaInsets();
  const { studentId: presetStudentId } = useLocalSearchParams<{ studentId?: string }>();
  const { students, addPayment } = useData();

  const [selectedStudentId, setSelectedStudentId] = useState(presetStudentId || "");
  const [amount, setAmount] = useState("500");
  const [month, setMonth] = useState(MONTHS[0]);
  const [status, setStatus] = useState<"paid" | "unpaid">("paid");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!selectedStudentId) e.student = "Select a student";
    if (!amount || isNaN(parseFloat(amount))) e.amount = "Enter a valid amount";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSaving(true);
    try {
      await addPayment({
        studentId: selectedStudentId,
        amount: parseFloat(amount),
        paymentDate: status === "paid" ? paymentDate : "",
        status,
        month,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } finally {
      setSaving(false);
    }
  };

  const topPaddingWeb = Platform.OS === "web" ? 67 : 0;
  const bottomPaddingWeb = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + topPaddingWeb + 16 }]}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Feather name="x" size={20} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>Record Payment</Text>
        <Pressable
          style={({ pressed }) => [styles.saveBtn, { opacity: pressed || saving ? 0.8 : 1 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={Colors.surface} />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.form, { paddingBottom: insets.bottom + bottomPaddingWeb + 40 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {!presetStudentId && (
          <View style={styles.field}>
            <Text style={styles.label}>Student</Text>
            {errors.student ? <Text style={styles.errorText}>{errors.student}</Text> : null}
            {students.map(s => (
              <Pressable
                key={s.id}
                style={[styles.selectRow, selectedStudentId === s.id && styles.selectRowActive]}
                onPress={() => setSelectedStudentId(s.id)}
              >
                <View style={[styles.radio, selectedStudentId === s.id && styles.radioActive]}>
                  {selectedStudentId === s.id && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.selectRowText}>{s.firstName} {s.lastName}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {presetStudentId && (
          <View style={styles.selectedStudent}>
            <Text style={styles.selectedStudentLabel}>Student</Text>
            <Text style={styles.selectedStudentName}>
              {students.find(s => s.id === presetStudentId)?.firstName} {students.find(s => s.id === presetStudentId)?.lastName}
            </Text>
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>Amount ($)</Text>
          {errors.amount ? <Text style={styles.errorText}>{errors.amount}</Text> : null}
          <TextInput
            style={[styles.input, errors.amount ? styles.inputError : null]}
            value={amount}
            onChangeText={setAmount}
            placeholder="500"
            placeholderTextColor={Colors.muted}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Month</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.monthRow}>
            {MONTHS.map(m => (
              <Pressable
                key={m}
                style={[styles.monthChip, month === m && styles.monthChipActive]}
                onPress={() => setMonth(m)}
              >
                <Text style={[styles.monthChipText, month === m && styles.monthChipTextActive]}>{m}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.statusToggle}>
            <Pressable
              style={[styles.statusBtn, status === "paid" && styles.statusBtnPaid]}
              onPress={() => setStatus("paid")}
            >
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={status === "paid" ? Colors.surface : Colors.success}
              />
              <Text style={[styles.statusBtnText, status === "paid" && { color: Colors.surface }]}>
                Paid
              </Text>
            </Pressable>
            <Pressable
              style={[styles.statusBtn, status === "unpaid" && styles.statusBtnUnpaid]}
              onPress={() => setStatus("unpaid")}
            >
              <Ionicons
                name="time"
                size={18}
                color={status === "unpaid" ? Colors.surface : Colors.warning}
              />
              <Text style={[styles.statusBtnText, status === "unpaid" && { color: Colors.surface }]}>
                Unpaid
              </Text>
            </Pressable>
          </View>
        </View>

        {status === "paid" && (
          <View style={styles.field}>
            <Text style={styles.label}>Payment Date</Text>
            <TextInput
              style={styles.input}
              value={paymentDate}
              onChangeText={setPaymentDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.muted}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text },
  saveBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    minWidth: 60,
    alignItems: "center",
  },
  saveBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.surface },
  scroll: { flex: 1 },
  form: { paddingHorizontal: 20, paddingTop: 20, gap: 20 },
  field: { gap: 8 },
  label: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  errorText: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.error },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.text,
  },
  inputError: { borderColor: Colors.error },
  selectRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    gap: 12,
    marginBottom: 8,
  },
  selectRowActive: { borderColor: Colors.primary, backgroundColor: Colors.accentLight },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: { borderColor: Colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  selectRowText: { fontSize: 14, fontFamily: "Inter_500Medium", color: Colors.text },
  selectedStudent: {
    backgroundColor: Colors.accentLight,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: Colors.accent,
  },
  selectedStudentLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: Colors.accent, textTransform: "uppercase", letterSpacing: 0.5 },
  selectedStudentName: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.primary, marginTop: 2 },
  monthRow: { gap: 8, paddingVertical: 2 },
  monthChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  monthChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  monthChipText: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.textSecondary },
  monthChipTextActive: { color: Colors.surface },
  statusToggle: { flexDirection: "row", gap: 12 },
  statusBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  statusBtnPaid: { backgroundColor: Colors.success, borderColor: Colors.success },
  statusBtnUnpaid: { backgroundColor: Colors.warning, borderColor: Colors.warning },
  statusBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.text },
});
