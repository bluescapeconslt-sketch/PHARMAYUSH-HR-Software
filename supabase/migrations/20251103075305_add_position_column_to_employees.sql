/*
  # Add Position Column to Employees Table

  ## Overview
  This migration adds a position column to the employees table to track hierarchical positions within the organization.

  ## Changes
  1. New Columns
    - `position` (text) - Employee's position in the organization hierarchy
      - Options: 'Intern', 'Employee', 'Dept. Head', 'Manager', 'CEO'
      - Default: 'Employee'
  
  ## Notes
  - Existing employees will default to 'Employee' position
  - Position is independent of role (role controls permissions, position controls hierarchy)
*/

-- Add position column to employees table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'position'
  ) THEN
    ALTER TABLE employees ADD COLUMN position text DEFAULT 'Employee';
  END IF;
END $$;