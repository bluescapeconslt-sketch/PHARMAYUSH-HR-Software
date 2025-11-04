/*
  # Update RLS policies for anonymous access
  
  This migration temporarily allows anonymous (anon) users full access to all tables.
  This is a temporary solution to enable the application to work with the database
  without implementing full Supabase authentication.
  
  IMPORTANT: In production, you should implement proper authentication and 
  restrictive RLS policies.
  
  Changes:
  - Allow anonymous users to read, insert, update, and delete on all tables
*/

-- Drop existing policies and create new ones that allow anon access

-- Employees table
DROP POLICY IF EXISTS "Allow read on employees" ON employees;
DROP POLICY IF EXISTS "Allow insert on employees" ON employees;
DROP POLICY IF EXISTS "Allow update on employees" ON employees;
DROP POLICY IF EXISTS "Allow delete on employees" ON employees;

CREATE POLICY "Allow anon all on employees"
  ON employees
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Attendance table  
DROP POLICY IF EXISTS "Employees can view own attendance" ON attendance;
DROP POLICY IF EXISTS "Managers can view all attendance" ON attendance;
DROP POLICY IF EXISTS "Employees can insert own attendance" ON attendance;

CREATE POLICY "Allow anon all on attendance"
  ON attendance
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Hierarchies table
CREATE POLICY "Allow anon all on hierarchies"
  ON hierarchies
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Buddies table
CREATE POLICY "Allow anon all on buddies"
  ON buddies
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Shifts table
DROP POLICY IF EXISTS "Anyone can view shifts" ON shifts;
DROP POLICY IF EXISTS "Admins can insert shifts" ON shifts;
DROP POLICY IF EXISTS "Admins can update shifts" ON shifts;
DROP POLICY IF EXISTS "Admins can delete shifts" ON shifts;

CREATE POLICY "Allow anon all on shifts"
  ON shifts
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
