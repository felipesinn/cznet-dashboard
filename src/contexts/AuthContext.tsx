import React, { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import axios, { AxiosError } from 'axios';

// Interface para o usuário
interface User {
  role?: string;
  name?: string;
  email: string;
  sector?: string;
  [key: string]: unknown;
}

// Interface para as credenciais de login
interface LoginCredentials {
  email: string;
  password: string;
}

// Interface para erros da API
interface ApiError {
  message: string;
  status?: number;
  [key: string]: unknown;
}

// Interface para o estado de autenticação
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean; // Renomeado de isLoading para loading para compatibilidade
  error: string | null;
}

// Interface para o contexto de autenticação
interface AuthContextType {
  authState: AuthState; // Adicionado para compatibilidade com o código existente
  user: User | null; // Mantido para compatibilidade com código novo
  isAuthenticated: boolean; // Mantido para compatibilidade com código novo
  isLoading: boolean; // Mantido para compatibilidade com código novo
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Estado inicial
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true, // Inicia carregando para verificar se já existe um usuário
  error: null
};

// Criar o contexto de autenticação
const AuthContext = createContext<AuthContextType | null>(null);

// Hook personalizado para usar o contexto de autenticação
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

// Provider do contexto de autenticação
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Usar o estado completo para compatibilidade com código existente
  const [authState, setAuthState] = useState<AuthState>(initialState);

  // Configurar a base URL do axios - já considera que VITE_API_URL inclui /api
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  
  console.log('API URL configurada como:', API_URL);

  // Verificar se existe um usuário no localStorage ao iniciar
  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (storedUser && token) {
        try {
          const user = JSON.parse(storedUser);
          setAuthState({
            user,
            isAuthenticated: true,
            loading: false,
            error: null
          });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          // Se houver erro ao parsear o JSON
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

  // Função de login
  const login = async (credentials: LoginCredentials): Promise<void> => {
    // Atualizar estado para indicar carregamento
    setAuthState({
      ...authState,
      loading: true,
      error: null
    });
    
    try {
      // Como VITE_API_URL já inclui /api, usamos o endpoint diretamente
      const loginUrl = `${API_URL}/login`;
      console.log(`Tentando login em: ${loginUrl}`);
      
      const response = await axios.post<{token: string; user: User}>(loginUrl, credentials, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: false,
      });

      const { token, user } = response.data;

      // Salvar dados no localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Atualizar o estado
      setAuthState({
        user,
        isAuthenticated: true,
        loading: false,
        error: null
      });
      
      console.log('Login bem-sucedido:', user);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      
      let errorMessage = 'Erro ao fazer login.';
      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiError>;
        errorMessage = axiosError.response?.data?.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Atualizar estado com o erro
      setAuthState({
        ...initialState,
        loading: false,
        error: errorMessage
      });
      
      // Re-throw para que o componente de login possa tratar o erro
      throw error;
    }
  };

  // Função de logout
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

  // Valor do contexto - mantendo compatibilidade com ambos os formatos
  const value: AuthContextType = {
    // Formato antigo
    authState,
    
    // Formato novo - expondo propriedades individuais
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.loading,
    
    // Funções
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;