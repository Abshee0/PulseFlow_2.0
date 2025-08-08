/*
  # Fix tasks table column naming

  1. Changes
    - Add missing dueDate column (application expects camelCase)
    - Ensure all columns match application expectations

  2. Notes
    - The existing table has 'duedate' but application expects 'dueDate'
    - Adding the correctly named column for frontend compatibility
*/

-- Add the dueDate column that the application expects
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'dueDate'
  ) THEN
    ALTER TABLE tasks ADD COLUMN "dueDate" timestamptz;
  END IF;
END $$;

-- Copy data from existing duedate column if it exists and has data
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'duedate'
  ) THEN
    UPDATE tasks SET "dueDate" = duedate WHERE duedate IS NOT NULL;
  END IF;
END $$;