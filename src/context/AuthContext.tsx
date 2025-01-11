import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthResponse {
  error: AuthError | Error | null;
  data?: any;
}

interface SignUpData {
  email: string;
  password: string;
  username: string;
}

interface SignInData {
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signUp: (data: SignUpData) => Promise<AuthResponse>;
  signIn: (data: SignInData) => Promise<AuthResponse>;
  signOut: () => Promise<AuthResponse>;
  resetPassword: (email: string) => Promise<AuthResponse>;
  updateProfile: (data: { username: string }) => Promise<AuthResponse>;
}

const initialContext: AuthContextType = {
  user: null,
  loading: true,
  isAuthenticated: false,
  signUp: async () => ({ error: new Error('AuthContext not initialized') }),
  signIn: async () => ({ error: new Error('AuthContext not initialized') }),
  signOut: async () => ({ error: new Error('AuthContext not initialized') }),
  resetPassword: async () => ({ error: new Error('AuthContext not initialized') }),
  updateProfile: async () => ({ error: new Error('AuthContext not initialized') }),
};

const AuthContext = createContext<AuthContextType>(initialContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 회원가입
  const signUp = async ({ email, password, username }: SignUpData): Promise<AuthResponse> => {
    try {
      // 1. 사용자 계정 생성
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        // 2. 프로필 정보 저장
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: authData.user.id,
            username,
            user_level: 'viewer',
            created_at: new Date().toISOString(),
          }]);

        if (profileError) {
          throw profileError;
        }

        return { error: null, data: authData };
      }

      return { error: new Error('회원가입 실패') };
    } catch (error) {
      console.error('회원가입 중 오류 발생:', error);
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

      if (error) {
        throw error;
      }

      return { error: null, data };
    } catch (error) {
      console.error('로그인 중 오류 발생:', error);
      return { error: error as Error };
    }
  };

  // 로그아웃
  const signOut = async (): Promise<AuthResponse> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      return { error: null };
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
      return { error: error as Error };
    }
  };

  // 비밀번호 재설정
  const resetPassword = async (email: string): Promise<AuthResponse> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      return { error: null };
    } catch (error) {
      console.error('비밀번호 재설정 중 오류 발생:', error);
      return { error: error as Error };
    }
  };

  // 프로필 업데이트
  const updateProfile = async ({ username }: { username: string }): Promise<AuthResponse> => {
    try {
      if (!user) {
        throw new Error('사용자가 로그인되어 있지 않습니다.');
      }

      const { error } = await supabase
        .from('profiles')
        .update({ username, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      return { error: null };
    } catch (error) {
      console.error('프로필 업데이트 중 오류 발생:', error);
      return { error: error as Error };
    }
  };

  useEffect(() => {
    // 현재 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session?.user);
      setLoading(false);
    });

    // 인증 상태 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session?.user);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};