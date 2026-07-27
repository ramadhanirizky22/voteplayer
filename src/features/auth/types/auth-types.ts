export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
}
