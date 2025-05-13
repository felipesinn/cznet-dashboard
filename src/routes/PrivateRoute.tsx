import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  allowedSectors?: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  allowedRoles = [], 
  allowedSectors = [] 
}) => {
  const { authState } = useAuth();
  const { user, isAuthenticated } = authState;
  
  console.log("PrivateRoute - Verificando permissões para:", { 
    isAuthenticated, 
    userRole: user?.role,
    userSector: user?.sector,
    allowedRoles,
    allowedSectors
  });

  // Se não estiver autenticado, redirecionar para o login
  if (!isAuthenticated) {
    console.log("Usuário não autenticado, redirecionando para login");
    return <Navigate to="/login" replace />;
  }

  // Se o usuário não tiver um papel definido
  if (!user) {
    console.log("Objeto de usuário vazio, redirecionando para login");
    return <Navigate to="/login" replace />;
  }

  // Super Admin tem acesso a tudo
  if (user.role === 'super_admin') {
    console.log("Super Admin tem acesso total");
    return <>{children}</>;
  }

  // MODIFICAÇÃO: Definir um setor padrão se não estiver definido
  const userSector = user.sector || 'suporte';
  
  // Verificar permissões de papel se especificado
  if (allowedRoles.length > 0) {
    const hasAllowedRole = user.role && allowedRoles.includes(user.role);
    console.log("Verificando roles:", { hasAllowedRole, userRole: user.role, allowedRoles });
    
    if (!hasAllowedRole) {
      // Redirecionar com base no papel do usuário
      console.log("Usuário sem permissão de role, redirecionando para seu setor");
      return <Navigate to={`/${userSector}`} replace />;
    }
  }

  // Verificar permissões de setor se especificado
  if (allowedSectors.length > 0) {
    // MODIFICAÇÃO: Verificar contra o setor padrão se não estiver definido
    const hasAllowedSector = allowedSectors.includes(userSector);
    console.log("Verificando sectors:", { hasAllowedSector, userSector, allowedSectors });
    
    if (!hasAllowedSector) {
      // Redirecionar para o setor do usuário ou para não autorizado
      console.log("Usuário sem permissão de setor, redirecionando para seu setor");
      return <Navigate to={`/${userSector}`} replace />;
    }
  }

  // Se passou por todas as verificações, renderiza o componente filho
  console.log("Permissão concedida, renderizando componente protegido");
  return <>{children}</>;
};

export default PrivateRoute;