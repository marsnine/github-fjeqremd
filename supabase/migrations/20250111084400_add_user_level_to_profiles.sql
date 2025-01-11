-- Add user_level to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS user_level TEXT NOT NULL DEFAULT 'viewer'
CHECK (user_level IN ('admin', 'uploader', 'viewer'));

-- Update existing profiles to have 'viewer' as default user_level
UPDATE public.profiles
SET user_level = 'viewer'
WHERE user_level IS NULL;