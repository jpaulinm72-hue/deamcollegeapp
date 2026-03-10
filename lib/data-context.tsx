import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  classId: string;
  phone: string;
  address: string;
  enrollmentDate: string;
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  subject: string;
  phone: string;
  email: string;
}

export interface Class {
  id: string;
  name: string;
  level: string;
  teacherId: string;
  studentIds: string[];
}

export interface Grade {
  id: string;
  studentId: string;
  subject: string;
  grade: string;
  examDate: string;
}

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  paymentDate: string;
  status: "paid" | "unpaid";
  month: string;
}

interface DataContextType {
  students: Student[];
  teachers: Teacher[];
  classes: Class[];
  grades: Grade[];
  payments: Payment[];
  addStudent: (s: Omit<Student, "id">) => Promise<void>;
  updateStudent: (id: string, s: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  addTeacher: (t: Omit<Teacher, "id">) => Promise<void>;
  updateTeacher: (id: string, t: Partial<Teacher>) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;
  addClass: (c: Omit<Class, "id">) => Promise<void>;
  updateClass: (id: string, c: Partial<Class>) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
  addGrade: (g: Omit<Grade, "id">) => Promise<void>;
  updateGrade: (id: string, g: Partial<Grade>) => Promise<void>;
  deleteGrade: (id: string) => Promise<void>;
  addPayment: (p: Omit<Payment, "id">) => Promise<void>;
  updatePayment: (id: string, p: Partial<Payment>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

const KEYS = {
  students: "school_students",
  teachers: "school_teachers",
  classes: "school_classes",
  grades: "school_grades",
  payments: "school_payments",
};

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

async function loadData<T>(key: string): Promise<T[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveData<T>(key: string, data: T[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(data));
}

const SEED_TEACHERS: Teacher[] = [
  { id: "t1", firstName: "Sarah", lastName: "Johnson", subject: "Mathematics", phone: "+1-555-0101", email: "s.johnson@school.edu" },
  { id: "t2", firstName: "Michael", lastName: "Chen", subject: "Science", phone: "+1-555-0102", email: "m.chen@school.edu" },
  { id: "t3", firstName: "Emily", lastName: "Davis", subject: "English", phone: "+1-555-0103", email: "e.davis@school.edu" },
];

const SEED_CLASSES: Class[] = [
  { id: "c1", name: "Class 10A", level: "Grade 10", teacherId: "t1", studentIds: ["s1", "s2"] },
  { id: "c2", name: "Class 9B", level: "Grade 9", teacherId: "t2", studentIds: ["s3"] },
  { id: "c3", name: "Class 11C", level: "Grade 11", teacherId: "t3", studentIds: [] },
];

const SEED_STUDENTS: Student[] = [
  { id: "s1", firstName: "Alex", lastName: "Martinez", dateOfBirth: "2008-03-15", classId: "c1", phone: "+1-555-0201", address: "123 Oak St, Springfield", enrollmentDate: "2023-09-01" },
  { id: "s2", firstName: "Emma", lastName: "Wilson", dateOfBirth: "2008-07-22", classId: "c1", phone: "+1-555-0202", address: "456 Elm Ave, Springfield", enrollmentDate: "2023-09-01" },
  { id: "s3", firstName: "Liam", lastName: "Brown", dateOfBirth: "2009-01-08", classId: "c2", phone: "+1-555-0203", address: "789 Pine Rd, Springfield", enrollmentDate: "2024-01-15" },
];

const SEED_GRADES: Grade[] = [
  { id: "g1", studentId: "s1", subject: "Mathematics", grade: "A", examDate: "2024-12-15" },
  { id: "g2", studentId: "s1", subject: "Science", grade: "B+", examDate: "2024-12-16" },
  { id: "g3", studentId: "s2", subject: "Mathematics", grade: "A-", examDate: "2024-12-15" },
  { id: "g4", studentId: "s3", subject: "English", grade: "B", examDate: "2024-12-17" },
];

const SEED_PAYMENTS: Payment[] = [
  { id: "p1", studentId: "s1", amount: 500, paymentDate: "2025-01-05", status: "paid", month: "January 2025" },
  { id: "p2", studentId: "s2", amount: 500, paymentDate: "2025-01-08", status: "paid", month: "January 2025" },
  { id: "p3", studentId: "s3", amount: 500, paymentDate: "", status: "unpaid", month: "January 2025" },
  { id: "p4", studentId: "s1", amount: 500, paymentDate: "", status: "unpaid", month: "February 2025" },
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    const init = async () => {
      const [s, t, c, g, p] = await Promise.all([
        loadData<Student>(KEYS.students),
        loadData<Teacher>(KEYS.teachers),
        loadData<Class>(KEYS.classes),
        loadData<Grade>(KEYS.grades),
        loadData<Payment>(KEYS.payments),
      ]);
      if (s.length === 0 && t.length === 0) {
        await Promise.all([
          saveData(KEYS.students, SEED_STUDENTS),
          saveData(KEYS.teachers, SEED_TEACHERS),
          saveData(KEYS.classes, SEED_CLASSES),
          saveData(KEYS.grades, SEED_GRADES),
          saveData(KEYS.payments, SEED_PAYMENTS),
        ]);
        setStudents(SEED_STUDENTS);
        setTeachers(SEED_TEACHERS);
        setClasses(SEED_CLASSES);
        setGrades(SEED_GRADES);
        setPayments(SEED_PAYMENTS);
      } else {
        setStudents(s);
        setTeachers(t);
        setClasses(c);
        setGrades(g);
        setPayments(p);
      }
    };
    init();
  }, []);

  const addStudent = useCallback(async (data: Omit<Student, "id">) => {
    const updated = [...students, { ...data, id: generateId() }];
    setStudents(updated);
    await saveData(KEYS.students, updated);
  }, [students]);

  const updateStudent = useCallback(async (id: string, data: Partial<Student>) => {
    const updated = students.map(s => s.id === id ? { ...s, ...data } : s);
    setStudents(updated);
    await saveData(KEYS.students, updated);
  }, [students]);

  const deleteStudent = useCallback(async (id: string) => {
    const updated = students.filter(s => s.id !== id);
    setStudents(updated);
    await saveData(KEYS.students, updated);
  }, [students]);

  const addTeacher = useCallback(async (data: Omit<Teacher, "id">) => {
    const updated = [...teachers, { ...data, id: generateId() }];
    setTeachers(updated);
    await saveData(KEYS.teachers, updated);
  }, [teachers]);

  const updateTeacher = useCallback(async (id: string, data: Partial<Teacher>) => {
    const updated = teachers.map(t => t.id === id ? { ...t, ...data } : t);
    setTeachers(updated);
    await saveData(KEYS.teachers, updated);
  }, [teachers]);

  const deleteTeacher = useCallback(async (id: string) => {
    const updated = teachers.filter(t => t.id !== id);
    setTeachers(updated);
    await saveData(KEYS.teachers, updated);
  }, [teachers]);

  const addClass = useCallback(async (data: Omit<Class, "id">) => {
    const updated = [...classes, { ...data, id: generateId() }];
    setClasses(updated);
    await saveData(KEYS.classes, updated);
  }, [classes]);

  const updateClass = useCallback(async (id: string, data: Partial<Class>) => {
    const updated = classes.map(c => c.id === id ? { ...c, ...data } : c);
    setClasses(updated);
    await saveData(KEYS.classes, updated);
  }, [classes]);

  const deleteClass = useCallback(async (id: string) => {
    const updated = classes.filter(c => c.id !== id);
    setClasses(updated);
    await saveData(KEYS.classes, updated);
  }, [classes]);

  const addGrade = useCallback(async (data: Omit<Grade, "id">) => {
    const updated = [...grades, { ...data, id: generateId() }];
    setGrades(updated);
    await saveData(KEYS.grades, updated);
  }, [grades]);

  const updateGrade = useCallback(async (id: string, data: Partial<Grade>) => {
    const updated = grades.map(g => g.id === id ? { ...g, ...data } : g);
    setGrades(updated);
    await saveData(KEYS.grades, updated);
  }, [grades]);

  const deleteGrade = useCallback(async (id: string) => {
    const updated = grades.filter(g => g.id !== id);
    setGrades(updated);
    await saveData(KEYS.grades, updated);
  }, [grades]);

  const addPayment = useCallback(async (data: Omit<Payment, "id">) => {
    const updated = [...payments, { ...data, id: generateId() }];
    setPayments(updated);
    await saveData(KEYS.payments, updated);
  }, [payments]);

  const updatePayment = useCallback(async (id: string, data: Partial<Payment>) => {
    const updated = payments.map(p => p.id === id ? { ...p, ...data } : p);
    setPayments(updated);
    await saveData(KEYS.payments, updated);
  }, [payments]);

  const deletePayment = useCallback(async (id: string) => {
    const updated = payments.filter(p => p.id !== id);
    setPayments(updated);
    await saveData(KEYS.payments, updated);
  }, [payments]);

  return (
    <DataContext.Provider value={{
      students, teachers, classes, grades, payments,
      addStudent, updateStudent, deleteStudent,
      addTeacher, updateTeacher, deleteTeacher,
      addClass, updateClass, deleteClass,
      addGrade, updateGrade, deleteGrade,
      addPayment, updatePayment, deletePayment,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
