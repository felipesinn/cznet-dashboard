import api from './api';
import type { LoginCredentials, LoginResponse, User } from '../types/auth.types';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/login', credentials);
    return response.data;
  },
  
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      const userData = JSON.parse(userStr);
      return {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        sector: userData.sector || 'adm',
        avatar: userData.avatar,
      };
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      return null;
    }
  },
  
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  }
};