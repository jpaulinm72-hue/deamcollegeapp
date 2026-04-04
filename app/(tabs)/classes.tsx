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
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useData } from "@/lib/data-context";
import { useAuth } from "@/lib/auth-context";

const LEVEL_COLORS: Record<string, string> = {
  "Grade 1": "#3B82F6",
  "Grade 2": "#8B5CF6",
  "Grade 3": "#10B981",
  "Grade 4": "#F59E0B",
  "Grade 5": "#EC4899",
  "Grade 6": "#0EA5E9",
  "Grade 7": "#F97316",
  "Grade 8": "#06B6D4",
  "Grade 9": "#14B8A6",
  "Grade 10": "#22C55E",
  "Grade 11": "#6366F1",
  "Grade 12": "#EF4444",
};

function getLevelColor(level: string): string {
  return LEVEL_COLORS[level] || Colors.accent;
}

export default function ClassesScreen() {
  const insets = useSafeAreaInsets();
  const { classes, teachers, students, deleteClass } = useData();
  const { logout } = useAuth();

  const handleDelete = (id: string, name: string) => {
    Alert.alert("Delete Class", `Delete ${name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await deleteClass(id);
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
            <Text style={styles.title}>Classes</Text>
            <Text style={styles.subtitle}>{classes.length} active classes</Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable
              style={({ pressed }) => [styles.logoutBtn, { opacity: pressed ? 0.7 : 1, marginRight: 8 }]}
              onPress={logout}
            >
              <Feather name="log-out" size={18} color={Colors.textSecondary} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.addBtn, { opacity: pressed ? 0.8 : 1 }]}
              onPress={() => router.push("/class-form")}
            >
              <Feather name="plus" size={20} color={Colors.surface} />
            </Pressable>
          </View>
        </View>

        {classes.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="library-outline" size={56} color={Colors.muted} />
            <Text style={styles.emptyTitle}>No classes yet</Text>
            <Text style={styles.emptyText}>Create your first class</Text>
          </View>
        ) : (
          classes.map(cls => {
            const teacher = teachers.find(t => t.id === cls.teacherId);
            const studentCount = students.filter(s => s.classId === cls.id).length;
            const color = getLevelColor(cls.level);

            return (
              <View key={cls.id} style={[styles.card, { borderLeftColor: color, borderLeftWidth: 4 }]}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <View style={[styles.levelBadge, { backgroundColor: color + "18" }]}>
                      <Text style={[styles.levelText, { color }]}>{cls.level}</Text>
                    </View>
                    <View style={styles.actions}>
                      <Pressable
                        style={styles.actionBtn}
                        onPress={() => router.push({ pathname: "/class-form", params: { id: cls.id } })}
                      >
                        <Feather name="edit-2" size={15} color={Colors.accent} />
                      </Pressable>
                      <Pressable
                        style={styles.actionBtn}
                        onPress={() => handleDelete(cls.id, cls.name)}
                      >
                        <Feather name="trash-2" size={15} color={Colors.error} />
                      </Pressable>
                    </View>
                  </View>
                  <Text style={styles.className}>{cls.name}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.stats}>
                  <View style={styles.stat}>
                    <View style={styles.statIcon}>
                      <Ionicons name="people" size={16} color={Colors.accent} />
                    </View>
                    <View>
                      <Text style={styles.statValue}>{studentCount}</Text>
                      <Text style={styles.statLabel}>Students</Text>
                    </View>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.stat}>
                    <View style={[styles.statIcon, { backgroundColor: "#8B5CF618" }]}>
                      <Ionicons name="school" size={16} color="#8B5CF6" />
                    </View>
                    <View>
                      <Text style={styles.statValue} numberOfLines={1}>
                        {teacher ? `${teacher.firstName} ${teacher.lastName}` : "Unassigned"}
                      </Text>
                      <Text style={styles.statLabel}>Teacher</Text>
                    </View>
                  </View>
                </View>

                {teacher && (
                  <View style={styles.teacherRow}>
                    <Feather name="book" size={12} color={Colors.muted} />
                    <Text style={styles.teacherSubject}>{teacher.subject}</Text>
                  </View>
                )}
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
  headerRight: { flexDirection: "row", alignItems: "center" },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
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
    overflow: "hidden",
  },
  cardHeader: { gap: 8 },
  cardTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  levelText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  actions: { flexDirection: "row", gap: 8 },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  className: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.text },
  divider: { height: 1, backgroundColor: Colors.border },
  stats: { flexDirection: "row", alignItems: "center" },
  stat: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: Colors.accentLight,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.text },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.muted },
  statDivider: { width: 1, height: 36, backgroundColor: Colors.border, marginHorizontal: 12 },
  teacherRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  teacherSubject: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.muted },
});
