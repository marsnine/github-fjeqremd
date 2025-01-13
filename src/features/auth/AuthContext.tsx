import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import {
  AuthContextType,
  AuthResponse,
  SignUpData,
  SignInData,
  AuthState
} from './types';
import {
  getUserProfile,
  upsertProfile
} from './utils';
import {
  USER_LEVELS,
  AUTH_ERRORS
} from './constants';

const initialState: AuthState = {
  user: null,
  loading: true,
  isAuthenticated: false,
  isGoogleLinked: false,
};

const initialContext: AuthContextType = {
  ...initialState,
  signUp: async () => ({ error: new Error('AuthContext not initialized') }),
  signIn: async () => ({ error: new Error('AuthContext not initialized') }),
  signOut: async () => ({ error: new Error('AuthContext not initialized') }),
  resetPassword: async () => ({ error: new Error('AuthContext not initialized') }),
  updateProfile: async () => ({ error: new Error('AuthContext not initialized') }),
  signInWithGoogle: async () => ({ error: new Error('AuthContext not initialized') }),
  linkWithGoogle: async () => ({ error: new Error('AuthContext not initialized') }),
  unlinkGoogle: async () => ({ error: new Error('AuthContext not initialized') }),
};

const AuthContext = createContext<AuthContextType>(initialContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setState] = useState<AuthState>(initialState);

  // 회원가입
  const signUp = async ({ email, password, username }: SignUpData): Promise<AuthResponse> => {
    try {
      // 1. 사용자 계정 생성
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error(AUTH_ERRORS.SIGNUP_FAILED);

      // 2. 프로필 정보 저장
      const profile = await upsertProfile(authData.user.id, {
        username,
        user_level: USER_LEVELS.VIEWER,
        created_at: new Date().toISOString(),
      });

      if (!profile) throw new Error(AUTH_ERRORS.PROFILE_CREATE_FAILED);

      return { error: null, data: authData };
    } catch (error) {
      console.error('회원가입 중 오류:', error);
      return { error: error as Error };
    }
  };

  // 로그인
  const signIn = async ({ email, password }: SignInData): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { error: null, data };
    } catch (error) {
      console.error('로그인 중 오류:', error);
      return { error: error as Error };
    }
  };

  // 로그아웃
  const signOut = async (): Promise<AuthResponse> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
      return { error: error as Error };
    }
  };

  // 비밀번호 재설정
  const resetPassword = async (email: string): Promise<AuthResponse> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('비밀번호 재설정 중 오류:', error);
      return { error: error as Error };
    }
  };

  // 프로필 업데이트
  const updateProfile = async ({ username }: { username: string }): Promise<AuthResponse> => {
    try {
      if (!authState.user) throw new Error(AUTH_ERRORS.NOT_AUTHENTICATED);

      const profile = await upsertProfile(authState.user.id, {
        username,
        updated_at: new Date().toISOString(),
      });

      if (!profile) throw new Error(AUTH_ERRORS.PROFILE_UPDATE_FAILED);
      return { error: null };
    } catch (error) {
      console.error('프로필 업데이트 중 오류:', error);
      return { error: error as Error };
    }
  };

  // 사용자 상태 업데이트
  const updateUserState = async (user: User | null) => {
    if (!user) {
      setState({
        user: null,
        loading: false,
        isAuthenticated: false,
        isGoogleLinked: false,
      });
      return;
    }

    const profile = await getUserProfile(user.id);

    setState({
      user: {
        ...user,
        user_metadata: {
          ...user.user_metadata,
          ...profile,
        },
      },
      loading: false,
      isAuthenticated: true,
      isGoogleLinked: false,
    });
  };

  useEffect(() => {
    // 현재 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      updateUserState(session?.user ?? null);
    });

    // 인증 상태 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      updateUserState(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    ...authState,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    signInWithGoogle: async () => ({ error: new Error('Not implemented') }),
    linkWithGoogle: async () => ({ error: new Error('Not implemented') }),
    unlinkGoogle: async () => ({ error: new Error('Not implemented') }),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(AUTH_ERRORS.CONTEXT_ERROR);
  }
  return context;
};