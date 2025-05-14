// src/types/auth.types.ts

// Certifique-se de que estas exportações estejam no topo do arquivo
export type UserRole = 'super_admin' | 'admin' | 'user';
export type UserSector = 'suporte' | 'tecnico' | 'noc' | 'comercial' | 'adm';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  sector: UserSector;
  avatar?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ApiError {
  message: string;
  status?: number;
}

// Se você tiver alguma interface para conteúdo aqui, mova-a para content.types.ts
export interface ContentItem {
  id: string;
  title: string;
  description?: string;
  type: string;
  sector: string;
  filePath?: string;
  textContent?: string;
  createdAt: string;
  // Outros campos necessários
}
export interface CreateContentData {
  title: string;
  description?: string;
  type: string;
  sector: string;
  textContent?: string;
  file?: File;
}

export type SectorType = 'suporte' | 'tecnico' | 'noc' | 'comercial' | 'adm';