// src/hooks/usePermissions.ts
import { useAuth } from '../contexts/AuthContext';
import type { SectorType, UserRole } from '../types/common.types';
import { canEditContent, canAccessSector, hasRole } from '../utils/permissions';

export const usePermissions = () => {
  const { authState } = useAuth();
  const { user } = authState;

  return {
    // Verifica se o usuário está autenticado
    isAuthenticated: authState.isAuthenticated,
    
    // Verifica se o usuário é super admin
    isSuperAdmin: user?.role === 'super_admin',
    
    // Verifica se o usuário é admin (de qualquer setor)
    isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
    
    // Verifica se o usuário pode editar conteúdo de um setor
    canEditContent: (contentSector?: SectorType) => canEditContent(user, contentSector),
    
    // Verifica se o usuário pode acessar um setor
    canAccessSector: (sector: SectorType) => canAccessSector(user, sector),
    
    // Verifica se o usuário tem um dos papéis permitidos
    hasRole: (allowedRoles: UserRole[]) => hasRole(user, allowedRoles),
    
    // Retorna o setor atual do usuário
    currentSector: user?.sector || 'suporte',
    
    // O usuário atual
    user
  };
};