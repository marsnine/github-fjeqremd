-- 기존 정책 모두 제거
DROP POLICY IF EXISTS "Admins can update all videos" ON public.videos;
DROP POLICY IF EXISTS "Users can update their own videos" ON public.videos;
DROP POLICY IF EXISTS "Videos are viewable by everyone" ON public.videos;
DROP POLICY IF EXISTS "Users can insert their own videos" ON public.videos;

-- 새로운 단순화된 정책 추가
CREATE POLICY "Enable all operations for admins"
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

-- 모든 사용자가 비디오를 볼 수 있도록 하는 정책
CREATE POLICY "Enable read access for all users"
ON public.videos
FOR SELECT
USING (true);

-- 사용자가 자신의 비디오를 관리할 수 있도록 하는 정책
CREATE POLICY "Enable insert/update/delete for video owners"
ON public.videos
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);