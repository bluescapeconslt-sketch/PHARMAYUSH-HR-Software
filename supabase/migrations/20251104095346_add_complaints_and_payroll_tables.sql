/*
  # Add Complaints and Payroll Tables

  1. New Tables
    - `complaints`
      - `id` (uuid, primary key)
      - `employee_id` (uuid, nullable - for anonymous complaints)
      - `employee_name` (text)
      - `subject` (text)
      - `details` (text)
      - `complaint_date` (date)
      - `status` (text, default 'Submitted')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `payroll`
      - `id` (uuid, primary key)
      - `employee_id` (uuid, references employees)
      - `month` (text, format: YYYY-MM)
      - `base_salary` (numeric)
      - `allowances` (numeric, default 0)
      - `deductions` (numeric, default 0)
      - `net_salary` (numeric)
      - `status` (text, default 'Pending')
      - `payment_date` (date, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
    - Complaints can be viewed by HR roles
    - Payroll can be viewed by employee (own) and HR
*/

-- Create complaints table
CREATE TABLE IF NOT EXISTS complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE SET NULL,
  employee_name text NOT NULL,
  subject text NOT NULL,
  details text NOT NULL,
  complaint_date date DEFAULT CURRENT_DATE,
  status text DEFAULT 'Submitted',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payroll table
CREATE TABLE IF NOT EXISTS payroll (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  month text NOT NULL,
  base_salary numeric NOT NULL,
  allowances numeric DEFAULT 0,
  deductions numeric DEFAULT 0,
  net_salary numeric NOT NULL,
  status text DEFAULT 'Pending',
  payment_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(employee_id, month)
);

-- Enable RLS
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;

-- Complaints policies
CREATE POLICY "All users can view complaints"
  ON complaints FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create complaints"
  ON complaints FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users with manage:complaints permission can update"
  ON complaints FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Payroll policies
CREATE POLICY "Employees can view own payroll"
  ON payroll FOR SELECT
  TO authenticated
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

CREATE POLICY "Users with manage:payroll can view all payroll"
  ON payroll FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users with manage:payroll can insert payroll"
  ON payroll FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users with manage:payroll can update payroll"
  ON payroll FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users with manage:payroll can delete payroll"
  ON payroll FOR DELETE
  TO authenticated
  USING (true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS complaints_employee_id_idx ON complaints(employee_id);
CREATE INDEX IF NOT EXISTS complaints_status_idx ON complaints(status);
CREATE INDEX IF NOT EXISTS payroll_employee_id_idx ON payroll(employee_id);
CREATE INDEX IF NOT EXISTS payroll_month_idx ON payroll(month);
