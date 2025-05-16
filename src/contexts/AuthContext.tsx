/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService } from '../services/auth.service';
import type { LoginCredentials, AuthState } from '../types/auth.types';

interface AuthContextType {
  authState: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialState);
  
  useEffect(() => {
    const checkAuth = async () => {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      try {
        const initialState = authService.getInitialAuthState();
        setAuthState(initialState);
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          loading: false,
          error: 'Erro ao verificar autenticação'
        });
      }
    };
    
    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await authService.login(credentials);
      
      const user = authService.getCurrentUser();
      
      setAuthState({
        user,
        isAuthenticated: true,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: 'Credenciais inválidas'
      });
      
      throw error;
    }
  };

  const logout = (): void => {
    authService.logout();
    
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null
    });
  };

  return (
    <AuthContext.Provider 
      value={{ 
        authState, 
        login, 
        logout,
        isLoading: authState.loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;