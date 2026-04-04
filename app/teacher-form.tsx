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
  "Art", "Music", "Physics", "Chemistry", "Biology", "Physical Education",
  "Computer Science", "Economics",
];

export default function TeacherFormScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { teachers, addTeacher, updateTeacher } = useData();
  const isEdit = !!id;
  const existing = isEdit ? teachers.find(t => t.id === id) : null;

  const [firstName, setFirstName] = useState(existing?.firstName || "");
  const [lastName, setLastName] = useState(existing?.lastName || "");
  const [subject, setSubject] = useState(existing?.subject || "");
  const [phone, setPhone] = useState(existing?.phone || "");
  const [email, setEmail] = useState(existing?.email || "");
  const [subjectsList, setSubjectsList] = useState(() => {
    const list = [...SUBJECTS];
    if (existing?.subject && !list.includes(existing.subject)) {
      list.push(existing.subject);
    }
    return list;
  });
  const [customSubject, setCustomSubject] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddCustomSubject = () => {
    if (customSubject.trim()) {
      const newSubject = customSubject.trim();
      if (!subjectsList.includes(newSubject)) {
        setSubjectsList([...subjectsList, newSubject]);
      }
      setSubject(newSubject);
      setCustomSubject("");
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = "First name is required";
    if (!lastName.trim()) e.lastName = "Last name is required";
    if (!subject.trim()) e.subject = "Subject is required";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSaving(true);
    try {
      const data = { firstName, lastName, subject, phone, email };
      if (isEdit && id) {
        await updateTeacher(id, data);
      } else {
        await addTeacher(data);
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
        <Text style={styles.title}>{isEdit ? "Edit Teacher" : "Add Teacher"}</Text>
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
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={[styles.input, errors.firstName ? styles.inputError : null]}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="e.g. Sarah"
            placeholderTextColor={Colors.muted}
          />
          {errors.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={[styles.input, errors.lastName ? styles.inputError : null]}
            value={lastName}
            onChangeText={setLastName}
            placeholder="e.g. Johnson"
            placeholderTextColor={Colors.muted}
          />
          {errors.lastName ? <Text style={styles.errorText}>{errors.lastName}</Text> : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Subject</Text>
          {errors.subject ? <Text style={styles.errorText}>{errors.subject}</Text> : null}
          <View style={styles.subjectGrid}>
            {subjectsList.map(s => (
              <Pressable
                key={s}
                style={[styles.subjectChip, subject === s && styles.subjectChipActive]}
                onPress={() => setSubject(s)}
              >
                <Text style={[styles.subjectChipText, subject === s && styles.subjectChipTextActive]}>
                  {s}
                </Text>
              </Pressable>
            ))}
          </View>
          
          <View style={styles.addCustomContainer}>
            <TextInput
              style={styles.customInput}
              value={customSubject}
              onChangeText={setCustomSubject}
              placeholder="Add other subject..."
              placeholderTextColor={Colors.muted}
            />
            <Pressable 
              style={[styles.addBtn, !customSubject.trim() && { opacity: 0.5 }]} 
              onPress={handleAddCustomSubject}
              disabled={!customSubject.trim()}
            >
              <Feather name="plus" size={18} color={Colors.surface} />
            </Pressable>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="+1-555-0000"
            placeholderTextColor={Colors.muted}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="teacher@school.edu"
            placeholderTextColor={Colors.muted}
            keyboardType="email-address"
            autoCapitalize="none"
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
  form: { paddingHorizontal: 20, paddingTop: 20, gap: 18 },
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
  subjectGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  subjectChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  subjectChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  subjectChipText: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.textSecondary },
  subjectChipTextActive: { color: Colors.surface },
  addCustomContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    alignItems: "center",
  },
  customInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.text,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
