import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.usemelon.co/api/v1';

export interface LoginCredentials {
  field: string;
  password: string;
}

export interface User {
  created_at: string;
  updated_at: string;
  _v: number;
  user_id: string;
  email: string;
  phone_number: string;
  username: string;
  firstname: string;
  middlename: string;
  lastname: string;
  connection_type: number;
  role: string;
  active_status: string;
  email_verified: boolean;
  phone_verified: boolean;
  last_login: string | null;
  account_tier: number;
}

export interface LoginResponse {
  statusCode: number;
  status: string;
  success: boolean;
  error: string;
  token: string;
  user: User;
  message: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await axios.post<LoginResponse>(`${API_URL}/auth/signin`, credentials);
      
      // Store token in cookie
      Cookies.set('token', response.data.token, {
        expires: 7, // 7 days
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      // Store user data in cookie
      Cookies.set('user', JSON.stringify(response.data.user), {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message: string }>;
        throw new Error(axiosError.response?.data?.message || 'Login failed');
      }
      throw new Error('An unexpected error occurred');
    }
  },

  logout() {
    Cookies.remove('token');
    Cookies.remove('user');
  },

  getToken(): string | undefined {
    return Cookies.get('token');
  },

  getUser(): User | null {
    const userStr = Cookies.get('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}; 