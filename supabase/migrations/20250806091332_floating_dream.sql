/*
  # Add board column to tasks table

  1. Changes
    - Add `board` column to tasks table as text field
    - Update existing tasks to use board name from boards table
    - Add index for better performance

  2. Notes
    - This adds a denormalized board name field for easier querying
    - Existing board_id foreign key relationship is maintained
*/

-- Add board column to tasks table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'board'
  ) THEN
    ALTER TABLE tasks ADD COLUMN board text;
  END IF;
END $$;

-- Update existing tasks with board names
UPDATE tasks 
SET board = boards.name 
FROM boards 
WHERE tasks.board_id = boards.id 
AND tasks.board IS NULL;

-- Add index for board column
CREATE INDEX IF NOT EXISTS tasks_board_idx ON tasks(board);