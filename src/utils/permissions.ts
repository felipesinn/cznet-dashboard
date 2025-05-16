// src/utils/permissions.ts
// src/utils/permissions.ts
import type { UserRole, UserSector } from '../types/common.types';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  sector: UserSector;
  avatar?: string;
  isActive?: boolean;
};

/**
 * Verifica se um usuário tem permissão para editar conteúdo
 */
export const canEditContent = (
  user: User | null,
  contentSector?: UserSector
): boolean => {
  if (!user) return false;
  
  // Super admin pode editar qualquer coisa
  if (user.role === 'super_admin') return true;
  
  // Admin pode editar conteúdo do seu setor
  if (user.role === 'admin' && contentSector === user.sector) return true;
  
  return false;
};

/**
 * Verifica se o usuário pode acessar um setor específico
 */
export const canAccessSector = (
  user: User | null,
  sector: UserSector
): boolean => {
  if (!user) return false;
  
  // Super admin pode acessar qualquer setor
  if (user.role === 'super_admin') return true;
  
  // Outros usuários só podem acessar seu próprio setor
  return user.sector === sector;
};

/**
 * Verifica se o usuário tem um determinado papel
 */
export const hasRole = (
  user: User | null,
  allowedRoles: UserRole[]
): boolean => {
  if (!user || !user.role) return false;
  return allowedRoles.includes(user.role);
};