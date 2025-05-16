import { useAuth } from '../contexts/AuthContext';
import type { SectorType, UserRole } from '../types/common.types';

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
    canEditContent: (contentSector?: SectorType) => {
      if (!user) return false;
      
      // Super admin pode editar qualquer coisa
      if (user.role === 'super_admin') return true;
      
      // Admin pode editar conteúdo do seu setor
      if (user.role === 'admin' && contentSector === user.sector) return true;
      
      return false;
    },
    
    // Verifica se o usuário pode acessar um setor
    canAccessSector: (sector: SectorType) => {
      if (!user) return false;
      
      // Super admin pode acessar qualquer setor
      if (user.role === 'super_admin') return true;
      
      // Outros usuários só podem acessar seu próprio setor
      return user.sector === sector;
    },
    
    // Verifica se o usuário tem um dos papéis permitidos
    hasRole: (allowedRoles: UserRole[]) => {
      if (!user || !user.role) return false;
      return allowedRoles.includes(user.role);
    },
    
    // Retorna o setor atual do usuário
    currentSector: user?.sector || 'suporte',
    
    // O usuário atual
    user
  };
};

export default usePermissions;