// src/types/auth.types.ts
// src/types/auth.types.ts
// src/types/auth.types.ts
// src/types/auth.types.ts
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { UserRole, UserSector } from './common.types';

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

export interface LoginResponse {
  token: string;
  user: User;
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

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}