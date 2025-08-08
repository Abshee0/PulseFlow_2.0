/*
  # Create tasks table

  1. New Tables
    - `tasks`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `description` (text, optional)
      - `status` (text, required)
      - `priority` (text, default 'medium')
      - `dueDate` (timestamptz, optional)
      - `assignee` (text, optional)
      - `subtasks` (jsonb, default empty array)
      - `board_id` (uuid, foreign key to boards)
      - `created_by` (uuid, foreign key to auth.users)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `tasks` table
    - Add policies for authenticated users to manage tasks in their boards
    - Add policies for users with shared board access

  3. Indexes
    - Index on board_id for efficient querying
    - Index on created_by for user-specific queries
*/

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text NOT NULL,
  priority text DEFAULT 'medium',
  dueDate timestamptz,
  assignee text,
  subtasks jsonb DEFAULT '[]'::jsonb,
  board_id uuid NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS tasks_board_id_idx ON tasks(board_id);
CREATE INDEX IF NOT EXISTS tasks_created_by_idx ON tasks(created_by);

-- RLS Policies

-- Users can view tasks in boards they own
CREATE POLICY "Users can view tasks in owned boards"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (
    board_id IN (
      SELECT id FROM boards WHERE user_id = auth.uid()
    )
  );

-- Users can view tasks in boards shared with them
CREATE POLICY "Users can view tasks in shared boards"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (
    board_id IN (
      SELECT board_id FROM board_shares WHERE user_id = auth.uid()
    )
  );

-- Users can insert tasks in boards they own
CREATE POLICY "Users can insert tasks in owned boards"
  ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    board_id IN (
      SELECT id FROM boards WHERE user_id = auth.uid()
    )
  );

-- Users can insert tasks in boards shared with them (with edit permission)
CREATE POLICY "Users can insert tasks in shared boards"
  ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    board_id IN (
      SELECT board_id FROM board_shares 
      WHERE user_id = auth.uid() AND permission IN ('edit', 'admin')
    )
  );

-- Users can update tasks in boards they own
CREATE POLICY "Users can update tasks in owned boards"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (
    board_id IN (
      SELECT id FROM boards WHERE user_id = auth.uid()
    )
  );

-- Users can update tasks in boards shared with them (with edit permission)
CREATE POLICY "Users can update tasks in shared boards"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (
    board_id IN (
      SELECT board_id FROM board_shares 
      WHERE user_id = auth.uid() AND permission IN ('edit', 'admin')
    )
  );

-- Users can delete tasks in boards they own
CREATE POLICY "Users can delete tasks in owned boards"
  ON tasks
  FOR DELETE
  TO authenticated
  USING (
    board_id IN (
      SELECT id FROM boards WHERE user_id = auth.uid()
    )
  );

-- Users can delete tasks in boards shared with them (with edit permission)
CREATE POLICY "Users can delete tasks in shared boards"
  ON tasks
  FOR DELETE
  TO authenticated
  USING (
    board_id IN (
      SELECT board_id FROM board_shares 
      WHERE user_id = auth.uid() AND permission IN ('edit', 'admin')
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on task updates
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();