import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "./supabase";

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
  isLoading: boolean;
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

// ── Seed IDs (fixed so cross-references work) ──────────────────────────────
const S_T1 = "a1b2c3d4-0001-0001-0001-000000000001";
const S_T2 = "a1b2c3d4-0002-0002-0002-000000000002";
const S_T3 = "a1b2c3d4-0003-0003-0003-000000000003";
const S_C1 = "b1b2c3d4-0001-0001-0001-000000000001";
const S_C2 = "b1b2c3d4-0002-0002-0002-000000000002";
const S_C3 = "b1b2c3d4-0003-0003-0003-000000000003";
const S_S1 = "c1b2c3d4-0001-0001-0001-000000000001";
const S_S2 = "c1b2c3d4-0002-0002-0002-000000000002";
const S_S3 = "c1b2c3d4-0003-0003-0003-000000000003";

// ── Row mappers ─────────────────────────────────────────────────────────────
function toStudent(r: any): Student {
  return {
    id: r.id,
    firstName: r.first_name ?? "",
    lastName: r.last_name ?? "",
    dateOfBirth: r.date_of_birth ?? "",
    classId: r.class_id ?? "",
    phone: r.phone ?? "",
    address: r.address ?? "",
    enrollmentDate: r.enrollment_date ?? "",
  };
}
function fromStudent(d: Omit<Student, "id">) {
  return {
    first_name: d.firstName,
    last_name: d.lastName,
    date_of_birth: d.dateOfBirth,
    class_id: d.classId,
    phone: d.phone,
    address: d.address,
    enrollment_date: d.enrollmentDate,
  };
}

function toTeacher(r: any): Teacher {
  return {
    id: r.id,
    firstName: r.first_name ?? "",
    lastName: r.last_name ?? "",
    subject: r.subject ?? "",
    phone: r.phone ?? "",
    email: r.email ?? "",
  };
}
function fromTeacher(d: Omit<Teacher, "id">) {
  return {
    first_name: d.firstName,
    last_name: d.lastName,
    subject: d.subject,
    phone: d.phone,
    email: d.email,
  };
}

function toClass(r: any): Class {
  return {
    id: r.id,
    name: r.name ?? "",
    level: r.level ?? "",
    teacherId: r.teacher_id ?? "",
    studentIds: r.student_ids ?? [],
  };
}
function fromClass(d: Omit<Class, "id">) {
  return {
    name: d.name,
    level: d.level,
    teacher_id: d.teacherId,
    student_ids: d.studentIds,
  };
}

function toGrade(r: any): Grade {
  return {
    id: r.id,
    studentId: r.student_id ?? "",
    subject: r.subject ?? "",
    grade: r.grade ?? "",
    examDate: r.exam_date ?? "",
  };
}
function fromGrade(d: Omit<Grade, "id">) {
  return {
    student_id: d.studentId,
    subject: d.subject,
    grade: d.grade,
    exam_date: d.examDate,
  };
}

function toPayment(r: any): Payment {
  return {
    id: r.id,
    studentId: r.student_id ?? "",
    amount: r.amount ?? 0,
    paymentDate: r.payment_date ?? "",
    status: r.status === "paid" ? "paid" : "unpaid",
    month: r.month ?? "",
  };
}
function fromPayment(d: Omit<Payment, "id">) {
  return {
    student_id: d.studentId,
    amount: d.amount,
    payment_date: d.paymentDate,
    status: d.status,
    month: d.month,
  };
}

// ── Seed data ───────────────────────────────────────────────────────────────
async function seedIfEmpty() {
  const { count } = await supabase.from("students").select("*", { count: "exact", head: true });
  if (count !== null && count > 0) return;

  const teachers = [
    { id: S_T1, first_name: "Sarah", last_name: "Johnson", subject: "Mathematics", phone: "+1-555-0101", email: "s.johnson@school.edu" },
    { id: S_T2, first_name: "Michael", last_name: "Chen", subject: "Science", phone: "+1-555-0102", email: "m.chen@school.edu" },
    { id: S_T3, first_name: "Emily", last_name: "Davis", subject: "English", phone: "+1-555-0103", email: "e.davis@school.edu" },
  ];
  const classes = [
    { id: S_C1, name: "Class 10A", level: "Grade 10", teacher_id: S_T1, student_ids: [S_S1, S_S2] },
    { id: S_C2, name: "Class 9B", level: "Grade 9", teacher_id: S_T2, student_ids: [S_S3] },
    { id: S_C3, name: "Class 11C", level: "Grade 11", teacher_id: S_T3, student_ids: [] },
  ];
  const students = [
    { id: S_S1, first_name: "Alex", last_name: "Martinez", date_of_birth: "2008-03-15", class_id: S_C1, phone: "+1-555-0201", address: "123 Oak St, Springfield", enrollment_date: "2023-09-01" },
    { id: S_S2, first_name: "Emma", last_name: "Wilson", date_of_birth: "2008-07-22", class_id: S_C1, phone: "+1-555-0202", address: "456 Elm Ave, Springfield", enrollment_date: "2023-09-01" },
    { id: S_S3, first_name: "Liam", last_name: "Brown", date_of_birth: "2009-01-08", class_id: S_C2, phone: "+1-555-0203", address: "789 Pine Rd, Springfield", enrollment_date: "2024-01-15" },
  ];
  const grades = [
    { student_id: S_S1, subject: "Mathematics", grade: "A", exam_date: "2024-12-15" },
    { student_id: S_S1, subject: "Science", grade: "B+", exam_date: "2024-12-16" },
    { student_id: S_S2, subject: "Mathematics", grade: "A-", exam_date: "2024-12-15" },
    { student_id: S_S3, subject: "English", grade: "B", exam_date: "2024-12-17" },
  ];
  const payments = [
    { student_id: S_S1, amount: 500, payment_date: "2025-01-05", status: "paid", month: "January 2025" },
    { student_id: S_S2, amount: 500, payment_date: "2025-01-08", status: "paid", month: "January 2025" },
    { student_id: S_S3, amount: 500, payment_date: "", status: "unpaid", month: "January 2025" },
    { student_id: S_S1, amount: 500, payment_date: "", status: "unpaid", month: "February 2025" },
  ];

  await Promise.all([
    supabase.from("teachers").upsert(teachers),
    supabase.from("classes").upsert(classes),
    supabase.from("students").upsert(students),
    supabase.from("grades").insert(grades),
    supabase.from("payments").insert(payments),
  ]);
}

// ── Provider ─────────────────────────────────────────────────────────────────
export function DataProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setIsLoading(true);
    try {
      await seedIfEmpty();
      const [s, t, c, g, p] = await Promise.all([
        supabase.from("students").select("*").order("created_at"),
        supabase.from("teachers").select("*").order("created_at"),
        supabase.from("classes").select("*").order("created_at"),
        supabase.from("grades").select("*").order("created_at"),
        supabase.from("payments").select("*").order("created_at"),
      ]);
      setStudents((s.data ?? []).map(toStudent));
      setTeachers((t.data ?? []).map(toTeacher));
      setClasses((c.data ?? []).map(toClass));
      setGrades((g.data ?? []).map(toGrade));
      setPayments((p.data ?? []).map(toPayment));
    } catch {
      // keep empty arrays on error
    } finally {
      setIsLoading(false);
    }
  };

  // ── Students ──────────────────────────────────────────────────────────────
  const addStudent = useCallback(async (data: Omit<Student, "id">) => {
    const { data: row } = await supabase.from("students").insert(fromStudent(data)).select().single();
    if (row) setStudents(prev => [...prev, toStudent(row)]);
  }, []);

  const updateStudent = useCallback(async (id: string, data: Partial<Student>) => {
    const patch: any = {};
    if (data.firstName !== undefined) patch.first_name = data.firstName;
    if (data.lastName !== undefined) patch.last_name = data.lastName;
    if (data.dateOfBirth !== undefined) patch.date_of_birth = data.dateOfBirth;
    if (data.classId !== undefined) patch.class_id = data.classId;
    if (data.phone !== undefined) patch.phone = data.phone;
    if (data.address !== undefined) patch.address = data.address;
    if (data.enrollmentDate !== undefined) patch.enrollment_date = data.enrollmentDate;
    const { data: row } = await supabase.from("students").update(patch).eq("id", id).select().single();
    if (row) setStudents(prev => prev.map(s => s.id === id ? toStudent(row) : s));
  }, []);

  const deleteStudent = useCallback(async (id: string) => {
    await supabase.from("students").delete().eq("id", id);
    setStudents(prev => prev.filter(s => s.id !== id));
  }, []);

  // ── Teachers ──────────────────────────────────────────────────────────────
  const addTeacher = useCallback(async (data: Omit<Teacher, "id">) => {
    const { data: row } = await supabase.from("teachers").insert(fromTeacher(data)).select().single();
    if (row) setTeachers(prev => [...prev, toTeacher(row)]);
  }, []);

  const updateTeacher = useCallback(async (id: string, data: Partial<Teacher>) => {
    const patch: any = {};
    if (data.firstName !== undefined) patch.first_name = data.firstName;
    if (data.lastName !== undefined) patch.last_name = data.lastName;
    if (data.subject !== undefined) patch.subject = data.subject;
    if (data.phone !== undefined) patch.phone = data.phone;
    if (data.email !== undefined) patch.email = data.email;
    const { data: row } = await supabase.from("teachers").update(patch).eq("id", id).select().single();
    if (row) setTeachers(prev => prev.map(t => t.id === id ? toTeacher(row) : t));
  }, []);

  const deleteTeacher = useCallback(async (id: string) => {
    await supabase.from("teachers").delete().eq("id", id);
    setTeachers(prev => prev.filter(t => t.id !== id));
  }, []);

  // ── Classes ───────────────────────────────────────────────────────────────
  const addClass = useCallback(async (data: Omit<Class, "id">) => {
    const { data: row } = await supabase.from("classes").insert(fromClass(data)).select().single();
    if (row) setClasses(prev => [...prev, toClass(row)]);
  }, []);

  const updateClass = useCallback(async (id: string, data: Partial<Class>) => {
    const patch: any = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.level !== undefined) patch.level = data.level;
    if (data.teacherId !== undefined) patch.teacher_id = data.teacherId;
    if (data.studentIds !== undefined) patch.student_ids = data.studentIds;
    const { data: row } = await supabase.from("classes").update(patch).eq("id", id).select().single();
    if (row) setClasses(prev => prev.map(c => c.id === id ? toClass(row) : c));
  }, []);

  const deleteClass = useCallback(async (id: string) => {
    await supabase.from("classes").delete().eq("id", id);
    setClasses(prev => prev.filter(c => c.id !== id));
  }, []);

  // ── Grades ────────────────────────────────────────────────────────────────
  const addGrade = useCallback(async (data: Omit<Grade, "id">) => {
    const { data: row } = await supabase.from("grades").insert(fromGrade(data)).select().single();
    if (row) setGrades(prev => [...prev, toGrade(row)]);
  }, []);

  const updateGrade = useCallback(async (id: string, data: Partial<Grade>) => {
    const patch: any = {};
    if (data.studentId !== undefined) patch.student_id = data.studentId;
    if (data.subject !== undefined) patch.subject = data.subject;
    if (data.grade !== undefined) patch.grade = data.grade;
    if (data.examDate !== undefined) patch.exam_date = data.examDate;
    const { data: row } = await supabase.from("grades").update(patch).eq("id", id).select().single();
    if (row) setGrades(prev => prev.map(g => g.id === id ? toGrade(row) : g));
  }, []);

  const deleteGrade = useCallback(async (id: string) => {
    await supabase.from("grades").delete().eq("id", id);
    setGrades(prev => prev.filter(g => g.id !== id));
  }, []);

  // ── Payments ──────────────────────────────────────────────────────────────
  const addPayment = useCallback(async (data: Omit<Payment, "id">) => {
    const { data: row } = await supabase.from("payments").insert(fromPayment(data)).select().single();
    if (row) setPayments(prev => [...prev, toPayment(row)]);
  }, []);

  const updatePayment = useCallback(async (id: string, data: Partial<Payment>) => {
    const patch: any = {};
    if (data.studentId !== undefined) patch.student_id = data.studentId;
    if (data.amount !== undefined) patch.amount = data.amount;
    if (data.paymentDate !== undefined) patch.payment_date = data.paymentDate;
    if (data.status !== undefined) patch.status = data.status;
    if (data.month !== undefined) patch.month = data.month;
    const { data: row } = await supabase.from("payments").update(patch).eq("id", id).select().single();
    if (row) setPayments(prev => prev.map(p => p.id === id ? toPayment(row) : p));
  }, []);

  const deletePayment = useCallback(async (id: string) => {
    await supabase.from("payments").delete().eq("id", id);
    setPayments(prev => prev.filter(p => p.id !== id));
  }, []);

  return (
    <DataContext.Provider value={{
      students, teachers, classes, grades, payments, isLoading,
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
