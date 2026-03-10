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

const SUBJECTS = [
  "Mathematics", "Science", "English", "History", "Geography",
  "Art", "Music", "Physics", "Chemistry", "Biology",
  "Physical Education", "Computer Science",
];

const GRADES = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"];

const GRADE_COLORS: Record<string, string> = {
  "A+": Colors.success, "A": Colors.success, "A-": "#16A34A",
  "B+": Colors.accent, "B": Colors.accent, "B-": "#2563EB",
  "C+": Colors.warning, "C": Colors.warning, "C-": "#D97706",
  "D": Colors.error, "F": Colors.error,
};

export default function GradeFormScreen() {
  const insets = useSafeAreaInsets();
  const { studentId } = useLocalSearchParams<{ studentId?: string }>();
  const { students, addGrade } = useData();

  const [selectedStudentId, setSelectedStudentId] = useState(studentId || "");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [examDate, setExamDate] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!selectedStudentId) e.student = "Select a student";
    if (!subject) e.subject = "Select a subject";
    if (!grade) e.grade = "Select a grade";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSaving(true);
    try {
      await addGrade({ studentId: selectedStudentId, subject, grade, examDate });
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
        <Text style={styles.title}>Add Grade</Text>
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
        {!studentId && (
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

        {studentId && (
          <View style={styles.selectedStudent}>
            <Text style={styles.selectedStudentLabel}>Student</Text>
            <Text style={styles.selectedStudentName}>
              {students.find(s => s.id === studentId)?.firstName} {students.find(s => s.id === studentId)?.lastName}
            </Text>
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>Subject</Text>
          {errors.subject ? <Text style={styles.errorText}>{errors.subject}</Text> : null}
          <View style={styles.chipGrid}>
            {SUBJECTS.map(s => (
              <Pressable
                key={s}
                style={[styles.chip, subject === s && styles.chipActive]}
                onPress={() => setSubject(s)}
              >
                <Text style={[styles.chipText, subject === s && styles.chipTextActive]}>{s}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Grade</Text>
          {errors.grade ? <Text style={styles.errorText}>{errors.grade}</Text> : null}
          <View style={styles.gradeGrid}>
            {GRADES.map(g => {
              const color = GRADE_COLORS[g] || Colors.muted;
              const isSelected = grade === g;
              return (
                <Pressable
                  key={g}
                  style={[
                    styles.gradeChip,
                    { borderColor: isSelected ? color : Colors.border },
                    isSelected && { backgroundColor: color },
                  ]}
                  onPress={() => setGrade(g)}
                >
                  <Text style={[styles.gradeChipText, { color: isSelected ? Colors.surface : color }]}>
                    {g}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Exam Date</Text>
          <TextInput
            style={styles.input}
            value={examDate}
            onChangeText={setExamDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={Colors.muted}
          />
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
  errorText: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.error },
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
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
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
  gradeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  gradeChip: {
    width: 56,
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  gradeChipText: { fontSize: 15, fontFamily: "Inter_700Bold" },
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
});
