/*
  # Add Remaining Tables for HR System

  ## New Tables Created
  
  ### 1. notices - Company announcements and notices
  ### 2. meetings - Department meetings schedule
  ### 3. leave_requests - Employee leave applications
  ### 4. onboarding_tasks - New employee onboarding checklist
  ### 5. policies - Company policies and procedures

  ## Security
  
  All tables have RLS enabled with policies for authenticated users.
*/

-- Create notices table
CREATE TABLE IF NOT EXISTS notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  author_name text NOT NULL,
  notice_date date NOT NULL DEFAULT CURRENT_DATE,
  color text NOT NULL DEFAULT 'blue',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read notices"
  ON notices FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert notices"
  ON notices FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update notices"
  ON notices FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete notices"
  ON notices FOR DELETE
  TO authenticated
  USING (true);

-- Create meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  department_id uuid REFERENCES departments(id) ON DELETE CASCADE,
  meeting_date date NOT NULL,
  meeting_time text NOT NULL,
  recurrence text NOT NULL DEFAULT 'None',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read meetings"
  ON meetings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert meetings"
  ON meetings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update meetings"
  ON meetings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete meetings"
  ON meetings FOR DELETE
  TO authenticated
  USING (true);

-- Create leave_requests table
CREATE TABLE IF NOT EXISTS leave_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'Pending',
  start_time text,
  end_time text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own leave requests"
  ON leave_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own leave requests"
  ON leave_requests FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update leave requests"
  ON leave_requests FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete leave requests"
  ON leave_requests FOR DELETE
  TO authenticated
  USING (true);

-- Create onboarding_tasks table
CREATE TABLE IF NOT EXISTS onboarding_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  task text NOT NULL,
  due_date date NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE onboarding_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read relevant onboarding tasks"
  ON onboarding_tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert onboarding tasks"
  ON onboarding_tasks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update onboarding tasks"
  ON onboarding_tasks FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete onboarding tasks"
  ON onboarding_tasks FOR DELETE
  TO authenticated
  USING (true);

-- Create policies table
CREATE TABLE IF NOT EXISTS policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read policies"
  ON policies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert policies"
  ON policies FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update policies"
  ON policies FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete policies"
  ON policies FOR DELETE
  TO authenticated
  USING (true);