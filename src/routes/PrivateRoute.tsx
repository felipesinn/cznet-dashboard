import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole, UserSector } from '../types/common.types';

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  allowedSectors?: UserSector[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  allowedRoles = [], 
  allowedSectors = [] 
}) => {
  const { authState } = useAuth();
  const { user, isAuthenticated } = authState;

  // Se não estiver autenticado, redirecionar para o login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Se o usuário não estiver definido
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Super Admin tem acesso a tudo
  if (user.role === 'super_admin') {
    return <>{children}</>;
  }

  // Setor padrão se não estiver definido
  const userSector = user.sector || 'suporte';
  
  // Verificar permissões de papel (role) se especificado
  if (allowedRoles.length > 0) {
    const hasAllowedRole = user.role && allowedRoles.includes(user.role);
    
    if (!hasAllowedRole) {
      // Redirecionar para o setor do usuário
      return <Navigate to={`/${userSector}`} replace />;
    }
  }

  // Verificar permissões de setor se especificado
  if (allowedSectors.length > 0) {
    const hasAllowedSector = allowedSectors.includes(userSector);
    
    if (!hasAllowedSector) {
      // Redirecionar para o setor do usuário
      return <Navigate to={`/${userSector}`} replace />;
    }
  }

  // Se passou por todas as verificações, renderiza o componente filho
  return <>{children}</>;
};

export default PrivateRoute;