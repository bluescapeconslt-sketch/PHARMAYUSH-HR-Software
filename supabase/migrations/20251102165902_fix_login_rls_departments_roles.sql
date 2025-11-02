/*
  # Fix Login RLS for Departments and Roles

  1. Changes
    - Add policy to allow anonymous users to read departments for login
    - Add policy to allow anonymous users to read roles for login
    - This enables the login query to join with these tables
  
  2. Security
    - Policies are read-only (SELECT only)
    - Still maintains RLS protection for write operations
*/

-- Allow anonymous users to read departments for login purposes
CREATE POLICY "Allow anonymous to view departments"
  ON departments
  FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous users to read roles for login purposes
CREATE POLICY "Allow anonymous to view roles"
  ON roles
  FOR SELECT
  TO anon
  USING (true);
