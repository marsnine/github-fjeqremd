import { User, AuthError } from '@supabase/supabase-js';

export interface AuthResponse {
  error: AuthError | Error | null;
  data?: any;
}

export interface SignUpData {
  email: string;
  password: string;
  username: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isGoogleLinked: boolean;
}

export interface AuthContextType extends AuthState {
  signUp: (data: SignUpData) => Promise<AuthResponse>;
  signIn: (data: SignInData) => Promise<AuthResponse>;
  signInWithGoogle: () => Promise<AuthResponse>;
  linkWithGoogle: () => Promise<AuthResponse>;
  unlinkGoogle: () => Promise<AuthResponse>;
  signOut: () => Promise<AuthResponse>;
  resetPassword: (email: string) => Promise<AuthResponse>;
  updateProfile: (data: { username: string }) => Promise<AuthResponse>;
}

export type UserLevel = 'admin' | 'uploader' | 'viewer';

export interface UserProfile {
  id: string;
  username: string;
  user_level: UserLevel;
  created_at: string;
  updated_at?: string;
}