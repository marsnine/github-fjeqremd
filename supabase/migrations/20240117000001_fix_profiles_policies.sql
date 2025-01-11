-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can read their own user_level" ON profiles;
DROP POLICY IF EXISTS "Admins can read all user_levels" ON profiles;
DROP POLICY IF EXISTS "Only admins can update user_level" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can read profiles" ON profiles;
DROP POLICY IF EXISTS "Anyone can read videos with profiles" ON videos;
DROP POLICY IF EXISTS "Uploaders and admins can insert videos" ON videos;
DROP POLICY IF EXISTS "Uploaders and admins can update own videos" ON videos;

-- Create new simplified policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read any profile
CREATE POLICY "Anyone can read profiles"
ON profiles FOR SELECT
USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow users to read videos with their associated profiles
CREATE POLICY "Anyone can read videos with profiles"
ON videos FOR SELECT
USING (true);

-- Allow uploaders and admins to insert videos
CREATE POLICY "Uploaders and admins can insert videos"
ON videos FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
    AND user_level IN ('admin', 'uploader')
  )
);

-- Allow uploaders and admins to update their own videos
CREATE POLICY "Uploaders and admins can update own videos"
ON videos FOR UPDATE
USING (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
    AND user_level IN ('admin', 'uploader')
  )
)
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
    AND user_level IN ('admin', 'uploader')
  )
);
