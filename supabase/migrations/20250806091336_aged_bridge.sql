/*
  # Create feedback table for global chat

  1. New Tables
    - `feedback`
      - `id` (uuid, primary key)
      - `message` (text, feedback message)
      - `user_id` (uuid, references auth.users)
      - `user_name` (text, user display name)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `feedback` table
    - Add policies for authenticated users to read all feedback
    - Add policies for authenticated users to create their own feedback
*/

CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all feedback
CREATE POLICY "Users can read all feedback"
  ON feedback
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to create feedback
CREATE POLICY "Users can create feedback"
  ON feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS feedback_created_at_idx ON feedback(created_at DESC);