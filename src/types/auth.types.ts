// src/types/auth.types.ts

/**
 * Tipos de permissões de usuário
 * super_admin: Acesso total a todos os setores e funcionalidades
 * admin: Administrador de um setor específico
 * user: Usuário comum com permissões de visualização
 */
export type UserRole = 'super_admin' | 'admin' | 'user';

/**
 * Setores da empresa
 */
export type UserSector = 'suporte' | 'tecnico' | 'noc' | 'adm' | 'comercial';

/**
 * Interface que representa um usuário no sistema
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  sector: UserSector;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
  isActive?: boolean;
}

/**
 * Estado de autenticação na aplicação
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error?: string | null;
}

/**
 * Credenciais para login
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Resposta da API após autenticação bem-sucedida
 */
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    sector?: string;
    avatar?: string;
    [key: string]: unknown;
  };
}

/**
 * Dados para registro de novo usuário
 */
export interface RegisterUserData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  sector: UserSector;
}

/**
 * Dados para atualização de usuário
 */
export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  sector?: UserSector;
  avatar?: string;
  isActive?: boolean;
}
export interface ContentItem {
  mediaItems: never[];
  createdAt(createdAt: unknown): import("react").ReactNode;
  filePath: boolean;
  id: string;
  title: string;
  description?: string;
  type: string;
  sector: string;
  textContent?: string;
  file?: File;
}
export interface CreateContentData {
  title: string;
  description?: string;
  type: string;
  sector: string;
  textContent?: string;
  file?: File;
}
export type SectorType = 'example1' | 'example2'; // Replace with actual type definition
