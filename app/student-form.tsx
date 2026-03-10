import React, { useState, useEffect } from "react";
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

export default function StudentFormScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { students, classes, addStudent, updateStudent } = useData();
  const isEdit = !!id;
  const existing = isEdit ? students.find(s => s.id === id) : null;

  const [firstName, setFirstName] = useState(existing?.firstName || "");
  const [lastName, setLastName] = useState(existing?.lastName || "");
  const [dateOfBirth, setDateOfBirth] = useState(existing?.dateOfBirth || "");
  const [classId, setClassId] = useState(existing?.classId || "");
  const [phone, setPhone] = useState(existing?.phone || "");
  const [address, setAddress] = useState(existing?.address || "");
  const [enrollmentDate, setEnrollmentDate] = useState(existing?.enrollmentDate || "");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = "First name is required";
    if (!lastName.trim()) e.lastName = "Last name is required";
    if (!enrollmentDate.trim()) e.enrollmentDate = "Enrollment date is required";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setSaving(true);
    try {
      const data = { firstName, lastName, dateOfBirth, classId, phone, address, enrollmentDate };
      if (isEdit && id) {
        await updateStudent(id, data);
      } else {
        await addStudent(data);
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
        <Text style={styles.title}>{isEdit ? "Edit Student" : "Add Student"}</Text>
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
        <FormField label="First Name" value={firstName} onChangeText={setFirstName} error={errors.firstName} placeholder="e.g. Alex" />
        <FormField label="Last Name" value={lastName} onChangeText={setLastName} error={errors.lastName} placeholder="e.g. Martinez" />
        <FormField label="Date of Birth" value={dateOfBirth} onChangeText={setDateOfBirth} placeholder="YYYY-MM-DD" />
        <FormField label="Enrollment Date" value={enrollmentDate} onChangeText={setEnrollmentDate} error={errors.enrollmentDate} placeholder="YYYY-MM-DD" />
        <FormField label="Phone" value={phone} onChangeText={setPhone} placeholder="+1-555-0000" keyboardType="phone-pad" />
        <FormField label="Address" value={address} onChangeText={setAddress} placeholder="123 Main St, City" multiline />

        <View style={styles.field}>
          <Text style={styles.label}>Class</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.classOptions}>
            <Pressable
              style={[styles.classChip, !classId && styles.classChipActive]}
              onPress={() => setClassId("")}
            >
              <Text style={[styles.classChipText, !classId && styles.classChipTextActive]}>None</Text>
            </Pressable>
            {classes.map(cls => (
              <Pressable
                key={cls.id}
                style={[styles.classChip, classId === cls.id && styles.classChipActive]}
                onPress={() => setClassId(cls.id)}
              >
                <Text style={[styles.classChipText, classId === cls.id && styles.classChipTextActive]}>
                  {cls.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

function FormField({
  label, value, onChangeText, error, placeholder, keyboardType, multiline,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  error?: string;
  placeholder?: string;
  keyboardType?: any;
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline, error ? styles.inputError : null]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.muted}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
  field: { gap: 6 },
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
  inputMultiline: { minHeight: 80, textAlignVertical: "top" },
  inputError: { borderColor: Colors.error },
  errorText: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.error },
  classOptions: { gap: 8, paddingVertical: 2 },
  classChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  classChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  classChipText: { fontSize: 14, fontFamily: "Inter_500Medium", color: Colors.textSecondary },
  classChipTextActive: { color: Colors.surface },
});
