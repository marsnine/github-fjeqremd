import { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import { UserLevel, UserProfile } from './types';

// Google 인증 URL 생성
export const createGoogleAuthUrl = (redirectTo: string, isLinking: boolean = false) => {
  const baseUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${window.location.origin}/auth/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
    state: JSON.stringify({ redirectTo, isLinking }),
  });

  return `${baseUrl}?${params.toString()}`;
};

// 사용자 프로필 가져오기
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('프로필 조회 중 오류:', error);
    return null;
  }
};

// 사용자 레벨 확인
export const checkUserLevel = (user: User | null): UserLevel => {
  return user?.user_metadata?.level || 'viewer';
};

// 권한 확인
export const hasPermission = (user: User | null, requiredLevel: UserLevel): boolean => {
  const userLevel = checkUserLevel(user);
  
  switch (requiredLevel) {
    case 'admin':
      return userLevel === 'admin';
    case 'uploader':
      return userLevel === 'admin' || userLevel === 'uploader';
    case 'viewer':
      return true;
    default:
      return false;
  }
};

// Google 계정 연동 상태 확인
export const isGoogleLinked = (user: User | null): boolean => {
  if (!user) return false;
  return user.identities?.some(identity => identity.provider === 'google') || false;
};

// 인증 상태 저장
export const saveAuthState = (state: string) => {
  sessionStorage.setItem('auth_state', state);
};

// 인증 상태 검증
export const validateAuthState = (receivedState: string): boolean => {
  const savedState = sessionStorage.getItem('auth_state');
  sessionStorage.removeItem('auth_state');
  return savedState === receivedState;
};

// 프로필 생성/업데이트
export const upsertProfile = async (
  userId: string,
  data: Partial<UserProfile>
): Promise<UserProfile | null> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        ...data,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return profile;
  } catch (error) {
    console.error('프로필 업데이트 중 오류:', error);
    return null;
  }
};