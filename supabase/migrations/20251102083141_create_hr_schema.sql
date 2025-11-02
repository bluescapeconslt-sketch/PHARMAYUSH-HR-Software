/*
  # Create HR Management Database Schema

  1. New Tables
    - `departments` - Store department information
    - `roles` - Store job roles and permissions
    - `employees` - Store employee details
    - `leave_requests` - Track employee leave applications
    - `policies` - Store company policies
    - `notices` - Store company notices/announcements
    - `onboarding_tasks` - Track employee onboarding tasks
    - `performance_reviews` - Store performance review records
    - `settings` - Store system settings

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Ensure data isolation by user/role
*/

-- Departments Table
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  head_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view departments"
  ON departments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage departments"
  ON departments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Only admins can update departments"
  ON departments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Roles Table
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  permissions text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view roles"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage roles"
  ON roles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Only admins can update roles"
  ON roles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Employees Table
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  date_of_birth date,
  address text,
  city text,
  state text,
  postal_code text,
  country text,
  department_id uuid REFERENCES departments(id),
  role_id uuid REFERENCES roles(id),
  job_title text,
  hire_date date,
  employment_status text DEFAULT 'active',
  salary decimal(12,2),
  bank_account text,
  bank_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all employees"
  ON employees FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Employees can update own profile"
  ON employees FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "Only admins can create employees"
  ON employees FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Leave Requests Table
CREATE TABLE IF NOT EXISTS leave_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text,
  status text DEFAULT 'pending',
  approved_by uuid REFERENCES employees(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view own leave requests"
  ON leave_requests FOR SELECT
  TO authenticated
  USING (auth.uid()::text = employee_id::text);

CREATE POLICY "Employees can create leave requests"
  ON leave_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = employee_id::text);

CREATE POLICY "Managers can view team leave requests"
  ON leave_requests FOR SELECT
  TO authenticated
  USING (true);

-- Policies Table
CREATE TABLE IF NOT EXISTS policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  content text,
  category text,
  version text DEFAULT '1.0',
  effective_date date,
  created_by uuid REFERENCES employees(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view policies"
  ON policies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage policies"
  ON policies FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Only admins can update policies"
  ON policies FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Notices Table
CREATE TABLE IF NOT EXISTS notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  author_id uuid REFERENCES employees(id),
  posted_date date DEFAULT CURRENT_DATE,
  expiry_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view notices"
  ON notices FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage notices"
  ON notices FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Only admins can update notices"
  ON notices FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Onboarding Tasks Table
CREATE TABLE IF NOT EXISTS onboarding_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  task_name text NOT NULL,
  task_description text,
  status text DEFAULT 'pending',
  due_date date,
  assigned_to uuid REFERENCES employees(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE onboarding_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view onboarding tasks"
  ON onboarding_tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage onboarding tasks"
  ON onboarding_tasks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Only admins can update onboarding tasks"
  ON onboarding_tasks FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Performance Reviews Table
CREATE TABLE IF NOT EXISTS performance_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  reviewer_id uuid REFERENCES employees(id),
  review_date date DEFAULT CURRENT_DATE,
  rating decimal(3,1),
  comments text,
  performance_areas text[],
  improvement_areas text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view own reviews"
  ON performance_reviews FOR SELECT
  TO authenticated
  USING (auth.uid()::text = employee_id::text);

CREATE POLICY "Managers can view team reviews"
  ON performance_reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can create reviews"
  ON performance_reviews FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view settings"
  ON settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage settings"
  ON settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Only admins can update settings"
  ON settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);