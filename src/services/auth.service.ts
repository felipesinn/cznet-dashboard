import api from './api';
import type { LoginCredentials, LoginResponse, User, AuthState } from '../types/auth.types';

class AuthService {
  /**
   * Realiza login com as credenciais fornecidas
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/login', credentials);
    
    // Armazenar token e usuário no localStorage
    this.setToken(response.data.token);
    this.setUser(response.data.user);
    
    return response.data;
  }
  
  /**
   * Realiza logout
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
  
  /**
   * Obtém o usuário atual do localStorage
   */
  getCurrentUser(): User | null {
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
        isActive: userData.isActive
      };
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      this.logout(); // Limpar dados inválidos
      return null;
    }
  }
  
  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
  
  /**
   * Obtém o estado inicial de autenticação
   */
  getInitialAuthState(): AuthState {
    return {
      user: this.getCurrentUser(),
      isAuthenticated: this.isAuthenticated(),
      loading: false,
      error: null
    };
  }
  
  /**
   * Armazena o token no localStorage
   */
  private setToken(token: string): void {
    localStorage.setItem('token', token);
  }
  
  /**
   * Armazena o usuário no localStorage
   */
  private setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }
}

export const authService = new AuthService();