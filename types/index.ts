export type UserRole = "CO_FOUNDER" | "INTERN";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string | null;
  isActive: boolean;
}

export interface Session {
  user: AuthUser;
  expires: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    fields?: Record<string, string[]>;
  };
}
