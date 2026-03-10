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
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useData } from "@/lib/data-context";

const LEVELS = [
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6",
  "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12",
];

export default function ClassFormScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { classes, teachers, students, addClass, updateClass } = useData();
  const isEdit = !!id;
  const existing = isEdit ? classes.find(c => c.id === id) : null;

  const [name, setName] = useState(existing?.name || "");
  const [level, setLevel] = useState(existing?.level || "");
  const [teacherId, setTeacherId] = useState(existing?.teacherId || "");
  const [studentIds, setStudentIds] = useState<string[]>(existing?.studentIds || []);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Class name is required";
    if (!level) e.level = "Level is required";
    return e;
  };

  const toggleStudent = (sid: string) => {
    setStudentIds(prev =>
      prev.includes(sid) ? prev.filter(id => id !== sid) : [...prev, sid]
    );
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSaving(true);
    try {
      const data = { name, level, teacherId, studentIds };
      if (isEdit && id) {
        await updateClass(id, data);
      } else {
        await addClass(data);
      }
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
        <Text style={styles.title}>{isEdit ? "Edit Class" : "New Class"}</Text>
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
        <View style={styles.field}>
          <Text style={styles.label}>Class Name</Text>
          <TextInput
            style={[styles.input, errors.name ? styles.inputError : null]}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Class 10A"
            placeholderTextColor={Colors.muted}
          />
          {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Level</Text>
          {errors.level ? <Text style={styles.errorText}>{errors.level}</Text> : null}
          <View style={styles.chipGrid}>
            {LEVELS.map(l => (
              <Pressable
                key={l}
                style={[styles.chip, level === l && styles.chipActive]}
                onPress={() => setLevel(l)}
              >
                <Text style={[styles.chipText, level === l && styles.chipTextActive]}>{l}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Assign Teacher</Text>
          <View style={styles.chipGrid}>
            <Pressable
              style={[styles.chip, !teacherId && styles.chipActive]}
              onPress={() => setTeacherId("")}
            >
              <Text style={[styles.chipText, !teacherId && styles.chipTextActive]}>None</Text>
            </Pressable>
            {teachers.map(t => (
              <Pressable
                key={t.id}
                style={[styles.chip, teacherId === t.id && styles.chipActive]}
                onPress={() => setTeacherId(t.id)}
              >
                <Text style={[styles.chipText, teacherId === t.id && styles.chipTextActive]}>
                  {t.firstName} {t.lastName}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Students ({studentIds.length} selected)</Text>
          {students.length === 0 ? (
            <Text style={styles.noItems}>No students available</Text>
          ) : (
            students.map(s => {
              const selected = studentIds.includes(s.id);
              return (
                <Pressable
                  key={s.id}
                  style={[styles.studentRow, selected && styles.studentRowActive]}
                  onPress={() => toggleStudent(s.id)}
                >
                  <View style={[styles.checkbox, selected && styles.checkboxActive]}>
                    {selected && <Feather name="check" size={12} color={Colors.surface} />}
                  </View>
                  <Text style={[styles.studentName, selected && styles.studentNameActive]}>
                    {s.firstName} {s.lastName}
                  </Text>
                </Pressable>
              );
            })
          )}
        </View>
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
  errorText: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.error },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.textSecondary },
  chipTextActive: { color: Colors.surface },
  noItems: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.muted },
  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    gap: 12,
  },
  studentRowActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.accentLight,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  studentName: { fontSize: 14, fontFamily: "Inter_500Medium", color: Colors.text },
  studentNameActive: { color: Colors.primary },
});
