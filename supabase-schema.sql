-- ============================================================
-- SchoolAdmin – Supabase Database Schema
-- Run this entire script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/vgujhwhgfskjhcgoyvfp/sql
-- ============================================================

-- Students
create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  first_name text not null default '',
  last_name text not null default '',
  date_of_birth text default '',
  class_id text default '',
  phone text default '',
  address text default '',
  enrollment_date text default '',
  created_at timestamptz default now()
);

-- Teachers
create table if not exists teachers (
  id uuid primary key default gen_random_uuid(),
  first_name text not null default '',
  last_name text not null default '',
  subject text default '',
  phone text default '',
  email text default '',
  created_at timestamptz default now()
);

-- Classes
create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  level text default '',
  teacher_id text default '',
  student_ids text[] default '{}',
  created_at timestamptz default now()
);

-- Grades
create table if not exists grades (
  id uuid primary key default gen_random_uuid(),
  student_id text default '',
  subject text default '',
  grade text default '',
  exam_date text default '',
  created_at timestamptz default now()
);

-- Payments
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  student_id text default '',
  amount numeric default 0,
  payment_date text default '',
  status text default 'unpaid',
  month text default '',
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table students enable row level security;
alter table teachers enable row level security;
alter table classes enable row level security;
alter table grades enable row level security;
alter table payments enable row level security;

-- Allow full access for authenticated users (admin app)
create policy "Authenticated full access" on students
  for all to authenticated using (true) with check (true);

create policy "Authenticated full access" on teachers
  for all to authenticated using (true) with check (true);

create policy "Authenticated full access" on classes
  for all to authenticated using (true) with check (true);

create policy "Authenticated full access" on grades
  for all to authenticated using (true) with check (true);

create policy "Authenticated full access" on payments
  for all to authenticated using (true) with check (true);
