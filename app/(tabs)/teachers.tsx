import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useData } from "@/lib/data-context";

const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: "#3B82F6",
  Science: "#10B981",
  English: "#8B5CF6",
  History: "#F59E0B",
  Geography: "#0EA5E9",
  Art: "#EC4899",
  Music: "#F97316",
  Physics: "#06B6D4",
  Chemistry: "#14B8A6",
  Biology: "#22C55E",
};

function getSubjectColor(subject: string): string {
  return SUBJECT_COLORS[subject] || Colors.accent;
}

export default function TeachersScreen() {
  const insets = useSafeAreaInsets();
  const { teachers, classes, deleteTeacher } = useData();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return teachers.filter(t => {
      const name = `${t.firstName} ${t.lastName}`.toLowerCase();
      const subject = t.subject.toLowerCase();
      return name.includes(search.toLowerCase()) || subject.includes(search.toLowerCase()) || search === "";
    });
  }, [teachers, search]);

  const handleDelete = (id: string, name: string) => {
    Alert.alert("Delete Teacher", `Remove ${name} from staff?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await deleteTeacher(id);
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
            <Text style={styles.title}>Teachers</Text>
            <Text style={styles.subtitle}>{teachers.length} staff members</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.addBtn, { opacity: pressed ? 0.8 : 1 }]}
            onPress={() => router.push("/teacher-form")}
          >
            <Feather name="plus" size={20} color={Colors.surface} />
          </Pressable>
        </View>

        <View style={styles.searchBar}>
          <Feather name="search" size={16} color={Colors.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or subject..."
            placeholderTextColor={Colors.muted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={Colors.muted} />
            </Pressable>
          )}
        </View>

        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="school-outline" size={56} color={Colors.muted} />
            <Text style={styles.emptyTitle}>No teachers found</Text>
            <Text style={styles.emptyText}>
              {search ? "Try a different search" : "Add your first teacher"}
            </Text>
          </View>
        ) : (
          filtered.map(teacher => {
            const assignedClasses = classes.filter(c => c.teacherId === teacher.id);
            const color = getSubjectColor(teacher.subject);
            return (
              <View key={teacher.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.cardLeft}>
                    <View style={[styles.avatar, { backgroundColor: color + "18" }]}>
                      <Text style={[styles.avatarText, { color }]}>
                        {teacher.firstName[0]}{teacher.lastName[0]}
                      </Text>
                    </View>
                    <View style={styles.info}>
                      <Text style={styles.name}>{teacher.firstName} {teacher.lastName}</Text>
                      <View style={[styles.subjectBadge, { backgroundColor: color + "18" }]}>
                        <Text style={[styles.subjectText, { color }]}>{teacher.subject}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.actions}>
                    <Pressable
                      style={styles.actionBtn}
                      onPress={() => router.push({ pathname: "/teacher-form", params: { id: teacher.id } })}
                    >
                      <Feather name="edit-2" size={15} color={Colors.accent} />
                    </Pressable>
                    <Pressable
                      style={styles.actionBtn}
                      onPress={() => handleDelete(teacher.id, `${teacher.firstName} ${teacher.lastName}`)}
                    >
                      <Feather name="trash-2" size={15} color={Colors.error} />
                    </Pressable>
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.cardDetails}>
                  <View style={styles.detail}>
                    <Feather name="phone" size={13} color={Colors.muted} />
                    <Text style={styles.detailText}>{teacher.phone || "No phone"}</Text>
                  </View>
                  <View style={styles.detail}>
                    <Feather name="mail" size={13} color={Colors.muted} />
                    <Text style={styles.detailText} numberOfLines={1}>{teacher.email || "No email"}</Text>
                  </View>
                  <View style={styles.detail}>
                    <Feather name="book" size={13} color={Colors.muted} />
                    <Text style={styles.detailText}>
                      {assignedClasses.length} class{assignedClasses.length !== 1 ? "es" : ""}
                    </Text>
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
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.text,
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
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  info: { gap: 6 },
  name: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.text },
  subjectBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  subjectText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  actions: { flexDirection: "row", gap: 8 },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: { height: 1, backgroundColor: Colors.border },
  cardDetails: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  detail: { flexDirection: "row", alignItems: "center", gap: 5 },
  detailText: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textSecondary },
});
