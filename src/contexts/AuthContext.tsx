import React, { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import type { User } from '../types/auth.types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

interface AuthContextType {
  authState: AuthState;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface ApiError {
  message: string;
  status?: number;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialState);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  
  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (storedUser && token) {
        try {
          const user = JSON.parse(storedUser);
          
          // Se não tiver setor definido, definir um padrão
          if (!user.sector) {
            user.sector = 'suporte';
            localStorage.setItem('user', JSON.stringify(user));
          }
          
          setAuthState({
            user,
            isAuthenticated: true,
            loading: false,
            error: null
          });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setAuthState({
            ...initialState,
            loading: false
          });
        }
      } else {
        setAuthState({
          ...initialState,
          loading: false
        });
      }
    };
    
    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setAuthState({
      ...authState,
      loading: true,
      error: null
    });
    
    try {
      const loginUrl = `${API_URL}/login`;
      
      const response = await axios.post<{token: string; user: User}>(loginUrl, credentials, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const { token, user } = response.data;

      // Salvar dados no localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setAuthState({
        user,
        isAuthenticated: true,
        loading: false,
        error: null
      });
    } catch (error) {
      let errorMessage = 'Erro ao fazer login.';
      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiError>;
        errorMessage = axiosError.response?.data?.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setAuthState({
        ...initialState,
        loading: false,
        error: errorMessage
      });
      
      throw error;
    }
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null
    });
  };

  const value: AuthContextType = {
    authState,
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;