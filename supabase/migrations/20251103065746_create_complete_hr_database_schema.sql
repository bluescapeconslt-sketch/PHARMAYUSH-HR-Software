/*
  # Complete HR Management System Database Schema

  ## Overview
  This migration creates all tables needed for the HR management system.

  ## New Tables
  
  ### 1. departments - Company departments
  - `id` (uuid, primary key)
  - `name` (text) - Department name
  - `description` (text) - Department description
  - `head_id` (uuid) - Reference to employee who heads the department
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. roles - User roles and permissions
  - `id` (uuid, primary key)
  - `name` (text) - Role name (Admin, Manager, Employee, etc.)
  - `description` (text) - Role description
  - `permissions` (jsonb) - Array of permission strings
  - `created_at` (timestamptz)

  ### 3. employees - Employee records
  - `id` (uuid, primary key)
  - `email` (text, unique) - Employee email/login
  - `password` (text) - Password (hashed in production)
  - `first_name` (text) - First name
  - `last_name` (text) - Last name
  - `phone` (text) - Phone number
  - `date_of_birth` (date) - Date of birth
  - `address` (text) - Street address
  - `city` (text) - City
  - `state` (text) - State
  - `postal_code` (text) - Postal code
  - `country` (text) - Country
  - `department_id` (uuid) - Reference to department
  - `role_id` (uuid) - Reference to role
  - `job_title` (text) - Job title
  - `hire_date` (date) - Hire date
  - `employment_status` (text) - active, on_leave, terminated
  - `salary` (numeric) - Salary amount
  - `bank_account` (text) - Bank account number
  - `bank_name` (text) - Bank name
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. notices - Company announcements
  - `id` (uuid, primary key)
  - `title` (text) - Notice title
  - `content` (text) - Notice content
  - `author_id` (uuid) - Employee who created notice
  - `author_name` (text) - Author name for display
  - `posted_date` (date) - When posted
  - `notice_date` (date) - Display date
  - `expiry_date` (date) - Expiration date
  - `color` (text) - Display color
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. meetings - Meeting schedules
  - `id` (uuid, primary key)
  - `title` (text) - Meeting title
  - `department_id` (uuid) - Department
  - `meeting_date` (date) - Meeting date
  - `meeting_time` (text) - Meeting time
  - `recurrence` (text) - Recurrence pattern
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 6. leave_requests - Employee leave applications
  - `id` (uuid, primary key)
  - `employee_id` (uuid) - Employee requesting leave
  - `leave_type` (text) - vacation, sick, personal
  - `start_date` (date) - Leave start date
  - `end_date` (date) - Leave end date
  - `start_time` (text) - Start time for partial days
  - `end_time` (text) - End time for partial days
  - `reason` (text) - Leave reason
  - `status` (text) - Pending, Approved, Rejected
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 7. onboarding_tasks - New employee onboarding
  - `id` (uuid, primary key)
  - `employee_id` (uuid) - Employee being onboarded
  - `task` (text) - Task description
  - `due_date` (date) - Task due date
  - `completed` (boolean) - Completion status
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 8. policies - Company policies
  - `id` (uuid, primary key)
  - `title` (text) - Policy title
  - `category` (text) - Policy category
  - `content` (text) - Policy content
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 9. performance_reviews - Employee performance reviews
  - `id` (uuid, primary key)
  - `employee_id` (uuid) - Employee being reviewed
  - `reviewer_id` (uuid) - Reviewer
  - `review_date` (date) - Review date
  - `rating` (integer) - Performance rating
  - `comments` (text) - Review comments
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 10. settings - System settings
  - `id` (uuid, primary key)
  - `key` (text, unique) - Setting key
  - `value` (jsonb) - Setting value
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  All tables have RLS enabled with permissive policies for custom authentication.
*/

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  head_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  permissions jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
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
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  role_id uuid REFERENCES roles(id) ON DELETE SET NULL,
  job_title text,
  hire_date date DEFAULT CURRENT_DATE,
  employment_status text DEFAULT 'active',
  salary numeric(10, 2),
  bank_account text,
  bank_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notices table
CREATE TABLE IF NOT EXISTS notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  author_id uuid REFERENCES employees(id) ON DELETE SET NULL,
  author_name text NOT NULL,
  posted_date date DEFAULT CURRENT_DATE,
  notice_date date DEFAULT CURRENT_DATE,
  expiry_date date,
  color text DEFAULT 'blue',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  department_id uuid REFERENCES departments(id) ON DELETE CASCADE,
  meeting_date date NOT NULL,
  meeting_time text NOT NULL,
  recurrence text DEFAULT 'None',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create leave_requests table
CREATE TABLE IF NOT EXISTS leave_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  start_time text,
  end_time text,
  reason text NOT NULL,
  status text DEFAULT 'Pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create onboarding_tasks table
CREATE TABLE IF NOT EXISTS onboarding_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  task text NOT NULL,
  due_date date NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create policies table
CREATE TABLE IF NOT EXISTS policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create performance_reviews table
CREATE TABLE IF NOT EXISTS performance_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  reviewer_id uuid REFERENCES employees(id) ON DELETE SET NULL,
  review_date date DEFAULT CURRENT_DATE,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comments text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_onboarding_tasks_employee ON onboarding_tasks(employee_id);
CREATE INDEX IF NOT EXISTS idx_meetings_department ON meetings(department_id);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(meeting_date);

-- Enable Row Level Security on all tables
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create permissive RLS policies for custom authentication
CREATE POLICY "Allow all operations on departments"
  ON departments FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on roles"
  ON roles FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow read on employees"
  ON employees FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow insert on employees"
  ON employees FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update on employees"
  ON employees FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete on employees"
  ON employees FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow all operations on notices"
  ON notices FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on meetings"
  ON meetings FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on leave_requests"
  ON leave_requests FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on onboarding_tasks"
  ON onboarding_tasks FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on policies"
  ON policies FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on performance_reviews"
  ON performance_reviews FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on settings"
  ON settings FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);