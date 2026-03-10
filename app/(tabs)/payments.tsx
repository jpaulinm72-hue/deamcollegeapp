import React, { useState, useMemo } from "react";
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
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useData, Payment } from "@/lib/data-context";

type FilterStatus = "all" | "paid" | "unpaid";

export default function PaymentsScreen() {
  const insets = useSafeAreaInsets();
  const { payments, students, updatePayment, deletePayment } = useData();
  const [filter, setFilter] = useState<FilterStatus>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return payments;
    return payments.filter(p => p.status === filter);
  }, [payments, filter]);

  const totalPaid = payments.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const totalUnpaid = payments.filter(p => p.status === "unpaid").reduce((s, p) => s + p.amount, 0);

  const toggleStatus = async (payment: Payment) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newStatus = payment.status === "paid" ? "unpaid" : "paid";
    await updatePayment(payment.id, {
      status: newStatus,
      paymentDate: newStatus === "paid" ? new Date().toISOString().split("T")[0] : "",
    });
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete Payment", "Remove this payment record?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await deletePayment(id);
        },
      },
    ]);
  };

  const topPaddingWeb = Platform.OS === "web" ? 67 : 0;
  const bottomPaddingWeb = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + topPaddingWeb + 16,
            paddingBottom: insets.bottom + bottomPaddingWeb + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Payments</Text>
            <Text style={styles.subtitle}>{payments.length} total records</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.addBtn, { opacity: pressed ? 0.8 : 1 }]}
            onPress={() => router.push("/payment-form")}
          >
            <Feather name="plus" size={20} color={Colors.surface} />
          </Pressable>
        </View>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { borderLeftColor: Colors.success }]}>
            <Text style={styles.summaryLabel}>Collected</Text>
            <Text style={[styles.summaryAmount, { color: Colors.success }]}>
              ${totalPaid.toLocaleString()}
            </Text>
            <Text style={styles.summaryCount}>
              {payments.filter(p => p.status === "paid").length} payments
            </Text>
          </View>
          <View style={[styles.summaryCard, { borderLeftColor: Colors.warning }]}>
            <Text style={styles.summaryLabel}>Outstanding</Text>
            <Text style={[styles.summaryAmount, { color: Colors.warning }]}>
              ${totalUnpaid.toLocaleString()}
            </Text>
            <Text style={styles.summaryCount}>
              {payments.filter(p => p.status === "unpaid").length} pending
            </Text>
          </View>
        </View>

        <View style={styles.filterRow}>
          {(["all", "paid", "unpaid"] as FilterStatus[]).map(f => (
            <Pressable
              key={f}
              style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterBtnText, filter === f && styles.filterBtnTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="card-outline" size={56} color={Colors.muted} />
            <Text style={styles.emptyTitle}>No payments found</Text>
            <Text style={styles.emptyText}>Record a payment to get started</Text>
          </View>
        ) : (
          filtered.map(payment => {
            const student = students.find(s => s.id === payment.studentId);
            const isPaid = payment.status === "paid";

            return (
              <View key={payment.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.cardLeft}>
                    <View style={[styles.avatar, { backgroundColor: isPaid ? Colors.successLight : Colors.warningLight }]}>
                      <Ionicons
                        name={isPaid ? "checkmark-circle" : "time"}
                        size={22}
                        color={isPaid ? Colors.success : Colors.warning}
                      />
                    </View>
                    <View style={styles.info}>
                      <Text style={styles.studentName}>
                        {student ? `${student.firstName} ${student.lastName}` : "Unknown Student"}
                      </Text>
                      <Text style={styles.month}>{payment.month}</Text>
                    </View>
                  </View>
                  <Text style={styles.amount}>${payment.amount.toLocaleString()}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.cardBottom}>
                  <View style={[styles.statusBadge, {
                    backgroundColor: isPaid ? Colors.successLight : Colors.warningLight,
                  }]}>
                    <View style={[styles.statusDot, {
                      backgroundColor: isPaid ? Colors.success : Colors.warning,
                    }]} />
                    <Text style={[styles.statusText, {
                      color: isPaid ? Colors.success : Colors.warning,
                    }]}>
                      {isPaid ? "Paid" : "Unpaid"}
                    </Text>
                    {isPaid && payment.paymentDate ? (
                      <Text style={[styles.statusDate, { color: Colors.success }]}>
                        · {payment.paymentDate}
                      </Text>
                    ) : null}
                  </View>
                  <View style={styles.cardActions}>
                    <Pressable
                      style={[styles.toggleBtn, { backgroundColor: isPaid ? Colors.warningLight : Colors.successLight }]}
                      onPress={() => toggleStatus(payment)}
                    >
                      <Feather
                        name={isPaid ? "x-circle" : "check-circle"}
                        size={14}
                        color={isPaid ? Colors.warning : Colors.success}
                      />
                      <Text style={[styles.toggleText, { color: isPaid ? Colors.warning : Colors.success }]}>
                        {isPaid ? "Mark Unpaid" : "Mark Paid"}
                      </Text>
                    </Pressable>
                    <Pressable
                      style={styles.actionBtn}
                      onPress={() => handleDelete(payment.id)}
                    >
                      <Feather name="trash-2" size={14} color={Colors.error} />
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 14 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", color: Colors.text },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.textSecondary, marginTop: 2 },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryRow: { flexDirection: "row", gap: 12 },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 4,
    gap: 4,
  },
  summaryLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5 },
  summaryAmount: { fontSize: 22, fontFamily: "Inter_700Bold" },
  summaryCount: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.muted },
  filterRow: { flexDirection: "row", gap: 8 },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterBtnText: { fontSize: 14, fontFamily: "Inter_500Medium", color: Colors.textSecondary },
  filterBtnTextActive: { color: Colors.surface },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: Colors.text },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.textSecondary },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { gap: 2 },
  studentName: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.text },
  month: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textSecondary },
  amount: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.text },
  divider: { height: 1, backgroundColor: Colors.border },
  cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  statusDate: { fontSize: 12, fontFamily: "Inter_400Regular" },
  cardActions: { flexDirection: "row", gap: 8, alignItems: "center" },
  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 5,
  },
  toggleText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.errorLight,
    alignItems: "center",
    justifyContent: "center",
  },
});
