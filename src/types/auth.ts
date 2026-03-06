export type UserType = 'personal' | 'showcase';

export interface AuthState {
  userType: UserType | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextValue extends AuthState {
  login: (passphrase: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

export interface LoginResponse {
  success: boolean;
  userType?: UserType;
  error?: string;
}

export interface VerifyResponse {
  success: boolean;
  userType: UserType | null;
}
