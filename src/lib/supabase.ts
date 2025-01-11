import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// 사용자 레벨 타입
export type UserLevel = 'admin' | 'uploader' | 'viewer';

// 사용자 레벨 체크 함수
export async function checkUserLevel(): Promise<UserLevel> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 'viewer';

  const { data } = await supabase
    .from('profiles')
    .select('user_level')
    .eq('id', user.id)
    .single();

  return (data?.user_level as UserLevel) || 'viewer';
}

// 관리자 체크 함수
export async function isAdmin(): Promise<boolean> {
  const userLevel = await checkUserLevel();
  return userLevel === 'admin';
}

// 업로더 체크 함수
export async function isUploader(): Promise<boolean> {
  const userLevel = await checkUserLevel();
  return userLevel === 'uploader' || userLevel === 'admin';
}
