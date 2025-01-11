-- Create enum type for user levels
CREATE TYPE user_level AS ENUM ('admin', 'uploader', 'viewer');

-- Add user_level column to profiles table with default value 'viewer'
ALTER TABLE profiles 
ADD COLUMN user_level user_level NOT NULL DEFAULT 'viewer';

-- Create policy to allow only admins to change user_level
CREATE POLICY "Only admins can update user_level"
ON profiles
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id 
    FROM auth.users 
    WHERE id IN (
      SELECT auth.uid() 
      FROM profiles 
      WHERE user_level = 'admin'
    )
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT id 
    FROM auth.users 
    WHERE id IN (
      SELECT auth.uid() 
      FROM profiles 
      WHERE user_level = 'admin'
    )
  )
);

-- Create policy to allow users to read their own user_level
CREATE POLICY "Users can read their own user_level"
ON profiles
FOR SELECT
USING (auth.uid() = id);

-- Create policy to allow admins to read all user_levels
CREATE POLICY "Admins can read all user_levels"
ON profiles
FOR SELECT
USING (
  auth.uid() IN (
    SELECT id 
    FROM auth.users 
    WHERE id IN (
      SELECT auth.uid() 
      FROM profiles 
      WHERE user_level = 'admin'
    )
  )
);

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
    AND user_level = 'admin'
  );
$$;

-- Create function to check if user is uploader
CREATE OR REPLACE FUNCTION is_uploader()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
    AND user_level IN ('admin', 'uploader')
  );
$$;

-- Update videos table policy to allow only uploaders and admins to insert
DROP POLICY IF EXISTS "Users can insert their own videos" ON videos;
CREATE POLICY "Only uploaders and admins can insert videos"
ON videos
FOR INSERT
WITH CHECK (
  is_uploader()
);

-- Update videos table policy to allow only uploaders and admins to update their own videos
DROP POLICY IF EXISTS "Users can update own videos" ON videos;
CREATE POLICY "Uploaders and admins can update own videos"
ON videos
FOR UPDATE
USING (
  auth.uid() = user_id
  AND is_uploader()
)
WITH CHECK (
  auth.uid() = user_id
  AND is_uploader()
);

-- Update videos table policy to allow only uploaders and admins to delete their own videos
DROP POLICY IF EXISTS "Users can delete own videos" ON videos;
CREATE POLICY "Uploaders and admins can delete own videos"
ON videos
FOR DELETE
USING (
  auth.uid() = user_id
  AND is_uploader()
);
