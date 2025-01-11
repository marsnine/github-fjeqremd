-- 기존 정책 삭제
DROP POLICY IF EXISTS "Admins can update all videos" ON public.videos;

-- 새로운 정책 추가 (더 간단한 조건으로)
CREATE POLICY "Admins can update all videos"
  ON public.videos
  FOR UPDATE
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

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can update their own videos" ON public.videos;

-- 새로운 정책 추가 (관리자 또는 소유자)
CREATE POLICY "Users can update their own videos"
  ON public.videos
  FOR UPDATE
  USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_level = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_level = 'admin'
    )
  );