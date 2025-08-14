/**
 * API Response and Data Interfaces
 * Central place for all API-related TypeScript interfaces
 */

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

/**
 * User data interface
 */
export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  date_joined?: string;
}

/**
 * Authentication request interfaces
 */
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  uid: string;
  token: string;
  new_password: string;
  confirm_password: string;
}

/**
 * Authentication response interfaces
 */
export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface TokenRefreshResponse {
  access: string;
}

/**
 * Video-related interfaces (für später)
 */
export interface Video {
  id: number;
  title: string;
  description?: string;
  video_file?: string;
  thumbnail?: string;
  category?: string;
  created_at?: string;
}

export interface VideoListResponse {
  count: number;
  results: Video[];
  next?: string;
  previous?: string;
}
