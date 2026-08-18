export interface AuthFormData {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export interface AuthResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}
