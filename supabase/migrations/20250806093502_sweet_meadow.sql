/*
  # Add updated_at column to profiles table

  1. Changes
    - Add `updated_at` column to profiles table with default value of now()
    - Add trigger to automatically update the timestamp on row modifications

  2. Notes
    - This aligns the database schema with application expectations
    - Uses existing update_updated_at_column function from tasks migration
*/

-- Add updated_at column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Add trigger to automatically update updated_at on profile updates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'update_profiles_updated_at'
  ) THEN
    CREATE TRIGGER update_profiles_updated_at
      BEFORE UPDATE ON profiles
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;