// Common API response format for Safatanc Connect API
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

// User data format
export interface User {
  id?: string;
  email?: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  global_role?: string;
  is_email_verified?: boolean;
  created_at?: string;
  [key: string]: any;
}

// Badge data format
export interface Badge {
  id: string;
  name: string;
  description: string;
  image_url: string;
  created_at: string;
}

// Pagination metadata
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Paginated response format
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
