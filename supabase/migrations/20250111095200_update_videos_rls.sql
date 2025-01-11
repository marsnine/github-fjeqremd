-- 기존 RLS 정책 제거
DROP POLICY IF EXISTS "Enable all operations for admins" ON public.videos;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.videos;
DROP POLICY IF EXISTS "Enable insert/update/delete for video owners" ON public.videos;
DROP POLICY IF EXISTS "Admins can update all videos" ON public.videos;
DROP POLICY IF EXISTS "Users can update their own videos" ON public.videos;
DROP POLICY IF EXISTS "Videos are viewable by everyone" ON public.videos;
DROP POLICY IF EXISTS "Users can insert their own videos" ON public.videos;

-- RLS 활성화 확인
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- 1. Admin 권한 사용자를 위한 모든 작업 허용 정책
CREATE POLICY "admin_full_access"
ON public.videos
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_level = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_level = 'admin'
  )
);

-- 2. 비디오 소유자(Uploader)를 위한 CRUD 정책
CREATE POLICY "owner_full_access"
ON public.videos
FOR ALL
USING (
  auth.uid() = user_id
)
WITH CHECK (
  auth.uid() = user_id
);

-- 3. 모든 사용자를 위한 읽기 전용 정책
CREATE POLICY "viewer_read_access"
ON public.videos
FOR SELECT
USING (true);

-- 정책 설명 추가
COMMENT ON POLICY "admin_full_access" ON public.videos IS 'Allows admin users to perform all operations on videos';
COMMENT ON POLICY "owner_full_access" ON public.videos IS 'Allows video owners to perform all operations on their own videos';
COMMENT ON POLICY "viewer_read_access" ON public.videos IS 'Allows all users to view videos';