-- 관리자가 모든 비디오를 볼 수 있도록 정책 추가
CREATE POLICY "Admins can view all videos"
  ON public.videos
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE user_level = 'admin'
    )
  );

-- 관리자가 모든 비디오를 수정할 수 있도록 정책 추가
CREATE POLICY "Admins can update all videos"
  ON public.videos
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE user_level = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE user_level = 'admin'
    )
  );

-- 관리자가 모든 비디오를 삭제할 수 있도록 정책 추가
CREATE POLICY "Admins can delete all videos"
  ON public.videos
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE user_level = 'admin'
    )
  );

-- 관리자가 모든 비디오를 추가할 수 있도록 정책 추가
CREATE POLICY "Admins can insert videos"
  ON public.videos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE user_level = 'admin'
    )
  );