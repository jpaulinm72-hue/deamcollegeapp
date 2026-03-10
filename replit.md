# SchoolAdmin - School Administration Management App

## Overview
A complete mobile + web school administration app built with Expo/React Native and a Node.js/Express backend. Manages students, teachers, classes, grades, and payments.

## Architecture
- **Frontend**: Expo Router (React Native + web), TypeScript
- **Backend**: Express.js on port 5000
- **Storage**: AsyncStorage (local persistence, no external database)
- **Auth**: Mock admin auth via AsyncStorage (email: admin@school.com, password: admin123)

## File Structure
```
app/
  _layout.tsx          # Root layout with AuthProvider + DataProvider
  login.tsx            # Admin login screen
  (tabs)/
    _layout.tsx        # Tab navigation (NativeTabs + classic fallback)
    index.tsx          # Dashboard
    students.tsx       # Students list + search + filter
    teachers.tsx       # Teachers list
    classes.tsx        # Classes list
    payments.tsx       # Payments + status tracking
  student/[id].tsx     # Student detail, grades, payments
  student-form.tsx     # Add/edit student (modal)
  teacher-form.tsx     # Add/edit teacher (modal)
  class-form.tsx       # Add/edit class with teacher/student assignment (modal)
  grade-form.tsx       # Add grade (modal)
  payment-form.tsx     # Record payment (modal)

lib/
  auth-context.tsx     # Auth state + login/logout
  data-context.tsx     # All CRUD data (students, teachers, classes, grades, payments)
  query-client.ts      # React Query + API utilities

constants/
  colors.ts            # App theme (navy blue + professional palette)
```

## Key Features
1. **Authentication** - Admin-only login (admin@school.com / admin123)
2. **Dashboard** - Stats overview, payment summary, quick actions, recent students
3. **Student Management** - Full CRUD, search, filter by class, profile view
4. **Teacher Management** - Full CRUD, subject color coding
5. **Class Management** - Create/edit with teacher + student assignment
6. **Grades** - Add per-student grades with letter grade picker
7. **Payments** - Track paid/unpaid, toggle status, financial overview

## Design
- Color scheme: Deep navy (#1E3A5F) + sky blue (#3B82F6) on light grey (#F1F5F9)
- Font: Inter (400, 500, 600, 700)
- iOS 26+: Liquid glass tab bars via NativeTabs
- Safe area insets handled for all platforms

## Running
- Backend: `npm run server:dev` (port 5000)
- Frontend: `npm run expo:dev` (port 8081)

## Seed Data
App seeds 3 teachers, 3 classes, 3 students, 4 grades, and 4 payments on first launch.
