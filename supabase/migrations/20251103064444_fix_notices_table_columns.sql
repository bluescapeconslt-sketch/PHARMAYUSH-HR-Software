/*
  # Fix notices table to match application code expectations
  
  ## Changes
  1. Add missing columns
    - `author_name` (text) - Name of the notice author
    - `notice_date` (date) - Date of the notice
    - `color` (text) - Display color for the notice
  
  2. Keep existing columns for backward compatibility
    - Keep `author_id`, `posted_date`, `expiry_date`
  
  ## Notes
  - This migration adds columns needed by the frontend code
  - Existing data is preserved
*/

-- Add author_name column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notices' AND column_name = 'author_name'
  ) THEN
    ALTER TABLE notices ADD COLUMN author_name text;
  END IF;
END $$;

-- Add notice_date column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notices' AND column_name = 'notice_date'
  ) THEN
    ALTER TABLE notices ADD COLUMN notice_date date DEFAULT CURRENT_DATE;
  END IF;
END $$;

-- Add color column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notices' AND column_name = 'color'
  ) THEN
    ALTER TABLE notices ADD COLUMN color text DEFAULT 'blue';
  END IF;
END $$;