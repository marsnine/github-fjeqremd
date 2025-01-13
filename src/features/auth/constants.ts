export const AUTH_ROUTES = {
  CALLBACK: '/auth/callback',
  PROFILE: '/profile',
  HOME: '/',
};

export const OAUTH_PROVIDERS = {
  GOOGLE: 'google',
} as const;

export const OAUTH_SCOPES = {
  GOOGLE: 'openid email profile',
} as const;

export const USER_LEVELS = {
  ADMIN: 'admin',
  UPLOADER: 'uploader',
  VIEWER: 'viewer',
} as const;

export const AUTH_ERRORS = {
  NOT_AUTHENTICATED: '사용자가 로그인되어 있지 않습니다.',
  SIGNUP_FAILED: '회원가입 실패',
  PROFILE_CREATE_FAILED: '프로필 생성 실패',
  PROFILE_UPDATE_FAILED: '프로필 업데이트 실패',
  INVALID_STATE: '유효하지 않은 상태값입니다.',
  NO_AUTH_CODE: '인증 코드를 찾을 수 없습니다.',
  NO_GOOGLE_ACCOUNT: '연동된 Google 계정이 없습니다.',
  CONTEXT_ERROR: 'useAuth must be used within an AuthProvider',
} as const;