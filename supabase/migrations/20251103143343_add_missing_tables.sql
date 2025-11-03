/*
  # Add Missing Tables
  
  1. New Tables
    - `shifts`
      - `id` (uuid, primary key)
      - `name` (text) - Shift name (e.g., "Morning Shift", "Night Shift")
      - `start_time` (text) - Start time in HH:MM format
      - `end_time` (text) - End time in HH:MM format
      - `description` (text, optional) - Description of the shift
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `attendance`
      - `id` (uuid, primary key)
      - `employee_id` (uuid, foreign key to employees)
      - `attendance_date` (date) - Date of attendance
      - `check_in_time` (text) - Check in time
      - `check_out_time` (text, optional) - Check out time
      - `status` (text) - Present, Absent, Late, Half Day
      - `notes` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `hierarchies`
      - `id` (uuid, primary key)
      - `employee_id` (uuid, foreign key to employees) - The employee
      - `manager_id` (uuid, foreign key to employees) - Their manager
      - `created_at` (timestamp)
    
    - `buddies`
      - `id` (uuid, primary key)
      - `employee_id` (uuid, foreign key to employees) - New employee
      - `buddy_id` (uuid, foreign key to employees) - Their assigned buddy
      - `assigned_date` (date) - When buddy was assigned
      - `status` (text) - Active, Completed
      - `created_at` (timestamp)
  
  2. Modifications
    - Add `shift_id` column to `employees` table if it doesn't exist
    - Add `avatar` column to `employees` table for profile pictures
    - Add `leave_balance` column to `employees` table as jsonb
    - Add `last_leave_allocation` column to `employees` table
  
  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to read their own data
    - Add policies for managers/admins to read all data
*/

-- Create shifts table
CREATE TABLE IF NOT EXISTS shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  start_time text NOT NULL,
  end_time text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view shifts"
  ON shifts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert shifts"
  ON shifts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.id::text = auth.jwt()->>'sub'
      AND r.permissions::jsonb ? 'manage:shifts'
    )
  );

CREATE POLICY "Admins can update shifts"
  ON shifts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.id::text = auth.jwt()->>'sub'
      AND r.permissions::jsonb ? 'manage:shifts'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.id::text = auth.jwt()->>'sub'
      AND r.permissions::jsonb ? 'manage:shifts'
    )
  );

CREATE POLICY "Admins can delete shifts"
  ON shifts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.id::text = auth.jwt()->>'sub'
      AND r.permissions::jsonb ? 'manage:shifts'
    )
  );

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  attendance_date date NOT NULL DEFAULT CURRENT_DATE,
  check_in_time text,
  check_out_time text,
  status text DEFAULT 'Present',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(employee_id, attendance_date)
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view own attendance"
  ON attendance FOR SELECT
  TO authenticated
  USING (employee_id::text = auth.jwt()->>'sub');

CREATE POLICY "Managers can view all attendance"
  ON attendance FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.id::text = auth.jwt()->>'sub'
      AND r.permissions::jsonb ? 'view:attendance-report'
    )
  );

CREATE POLICY "Employees can insert own attendance"
  ON attendance FOR INSERT
  TO authenticated
  WITH CHECK (employee_id::text = auth.jwt()->>'sub');

CREATE POLICY "Employees can update own attendance"
  ON attendance FOR UPDATE
  TO authenticated
  USING (employee_id::text = auth.jwt()->>'sub')
  WITH CHECK (employee_id::text = auth.jwt()->>'sub');

-- Create hierarchies table
CREATE TABLE IF NOT EXISTS hierarchies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  manager_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(employee_id, manager_id)
);

ALTER TABLE hierarchies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view own hierarchy"
  ON hierarchies FOR SELECT
  TO authenticated
  USING (
    employee_id::text = auth.jwt()->>'sub' OR 
    manager_id::text = auth.jwt()->>'sub'
  );

CREATE POLICY "Managers can view all hierarchies"
  ON hierarchies FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.id::text = auth.jwt()->>'sub'
      AND r.permissions::jsonb ? 'view:employees'
    )
  );

CREATE POLICY "Admins can manage hierarchies"
  ON hierarchies FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.id::text = auth.jwt()->>'sub'
      AND r.permissions::jsonb ? 'manage:employees'
    )
  );

-- Create buddies table
CREATE TABLE IF NOT EXISTS buddies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  buddy_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  assigned_date date DEFAULT CURRENT_DATE,
  status text DEFAULT 'Active',
  created_at timestamptz DEFAULT now(),
  UNIQUE(employee_id, buddy_id)
);

ALTER TABLE buddies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view own buddy assignments"
  ON buddies FOR SELECT
  TO authenticated
  USING (
    employee_id::text = auth.jwt()->>'sub' OR 
    buddy_id::text = auth.jwt()->>'sub'
  );

CREATE POLICY "Managers can view all buddy assignments"
  ON buddies FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.id::text = auth.jwt()->>'sub'
      AND r.permissions::jsonb ? 'view:onboarding'
    )
  );

CREATE POLICY "Admins can manage buddy assignments"
  ON buddies FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.id::text = auth.jwt()->>'sub'
      AND r.permissions::jsonb ? 'manage:onboarding'
    )
  );

-- Add missing columns to employees table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'shift_id'
  ) THEN
    ALTER TABLE employees ADD COLUMN shift_id uuid REFERENCES shifts(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'avatar'
  ) THEN
    ALTER TABLE employees ADD COLUMN avatar text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'leave_balance'
  ) THEN
    ALTER TABLE employees ADD COLUMN leave_balance jsonb DEFAULT '{"short": 0, "sick": 0, "personal": 0}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'last_leave_allocation'
  ) THEN
    ALTER TABLE employees ADD COLUMN last_leave_allocation text;
  END IF;
END $$;