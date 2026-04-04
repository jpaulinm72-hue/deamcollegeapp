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
import { useAuth } from "@/lib/auth-context";

export default function StudentsScreen() {
  const insets = useSafeAreaInsets();
  const { students, classes, deleteStudent } = useData();
  const { logout } = useAuth();
  const [search, setSearch] = useState("");
  const [filterClassId, setFilterClassId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return students.filter(s => {
      const name = `${s.firstName} ${s.lastName}`.toLowerCase();
      const matchSearch = name.includes(search.toLowerCase()) || search === "";
      const matchClass = !filterClassId || s.classId === filterClassId;
      return matchSearch && matchClass;
    });
  }, [students, search, filterClassId]);

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      "Delete Student",
      `Are you sure you want to delete ${name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await deleteStudent(id);
          },
        },
      ]
    );
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
            <Text style={styles.title}>Students</Text>
            <Text style={styles.subtitle}>{students.length} enrolled</Text>
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
              onPress={() => router.push("/student-form")}
            >
              <Feather name="plus" size={20} color={Colors.surface} />
            </Pressable>
          </View>
        </View>

        <View style={styles.searchBar}>
          <Feather name="search" size={16} color={Colors.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search students..."
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

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          <Pressable
            style={[styles.filterChip, !filterClassId && styles.filterChipActive]}
            onPress={() => setFilterClassId(null)}
          >
            <Text style={[styles.filterChipText, !filterClassId && styles.filterChipTextActive]}>
              All Classes
            </Text>
          </Pressable>
          {classes.map(cls => (
            <Pressable
              key={cls.id}
              style={[styles.filterChip, filterClassId === cls.id && styles.filterChipActive]}
              onPress={() => setFilterClassId(filterClassId === cls.id ? null : cls.id)}
            >
              <Text style={[styles.filterChipText, filterClassId === cls.id && styles.filterChipTextActive]}>
                {cls.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={56} color={Colors.muted} />
            <Text style={styles.emptyTitle}>No students found</Text>
            <Text style={styles.emptyText}>
              {search ? "Try a different search term" : "Add your first student"}
            </Text>
          </View>
        ) : (
          filtered.map(student => {
            const cls = classes.find(c => c.id === student.classId);
            return (
              <Pressable
                key={student.id}
                style={({ pressed }) => [styles.card, { opacity: pressed ? 0.85 : 1 }]}
                onPress={() => router.push(`/student/${student.id}`)}
              >
                <View style={styles.cardLeft}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {student.firstName[0]}{student.lastName[0]}
                    </Text>
                  </View>
                  <View style={styles.info}>
                    <Text style={styles.name}>{student.firstName} {student.lastName}</Text>
                    <Text style={styles.meta}>{cls?.name || "No class"} · {student.phone || "No phone"}</Text>
                    <Text style={styles.date}>Enrolled {student.enrollmentDate}</Text>
                  </View>
                </View>
                <View style={styles.cardActions}>
                  <Pressable
                    style={styles.actionBtn}
                    onPress={() => router.push({ pathname: "/student-form", params: { id: student.id } })}
                    hitSlop={8}
                  >
                    <Feather name="edit-2" size={15} color={Colors.accent} />
                  </Pressable>
                  <Pressable
                    style={styles.actionBtn}
                    onPress={() => handleDelete(student.id, `${student.firstName} ${student.lastName}`)}
                    hitSlop={8}
                  >
                    <Feather name="trash-2" size={15} color={Colors.error} />
                  </Pressable>
                </View>
              </Pressable>
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
  filters: { gap: 8, paddingVertical: 2 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.textSecondary,
  },
  filterChipTextActive: { color: Colors.surface },
  empty: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.accentLight,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: Colors.accent,
  },
  info: { flex: 1 },
  name: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.text },
  meta: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textSecondary, marginTop: 2 },
  date: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.muted, marginTop: 2 },
  cardActions: { flexDirection: "row", gap: 8 },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
});
