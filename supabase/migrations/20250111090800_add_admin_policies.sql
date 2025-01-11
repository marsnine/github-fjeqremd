-- 관리자가 모든 프로필을 볼 수 있도록 정책 추가
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE user_level = 'admin'
    )
  );

-- 관리자가 모든 프로필을 수정할 수 있도록 정책 추가
CREATE POLICY "Admins can update all profiles"
  ON public.profiles
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

-- 관리자가 모든 프로필을 삭제할 수 있도록 정책 추가
CREATE POLICY "Admins can delete all profiles"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE user_level = 'admin'
    )
  );