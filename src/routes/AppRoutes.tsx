import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Login from "../pages/auth/Login";
import NotFound from "../pages/NotFound/NotFound";
import SectorView from "../pages/sectors/SectorView";
import Dashboard from "../pages/admin/Dashboard";
import UserManagement from "../pages/admin/UserManagement";
import UserRegistration from "../pages/admin/UserRegistration";
import { useAuth } from "../contexts/AuthContext";
import type { SectorType } from "../types/common.types";

const AppRoutes: React.FC = () => {
  const { authState } = useAuth();
  const { loading } = authState;

  // Setores disponíveis na aplicação
  const sectors: SectorType[] = ['suporte', 'tecnico', 'noc', 'comercial', 'adm'];

  // Mostrar loader enquanto verifica autenticação
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={<Login />} />

      {/* Redirecionar raiz para login ou setor do usuário */}
      <Route path="/" element={
        authState.isAuthenticated ? 
          <Navigate to={`/${authState.user?.sector || 'suporte'}`} /> : 
          <Navigate to="/login" />
      } />

      {/* Rotas de setores - Cada setor só é acessível para usuários daquele setor ou super_admin */}
      {sectors.map(sector => (
        <Route 
          key={sector}
          path={`/${sector}`} 
          element={
            <PrivateRoute allowedSectors={[sector]}>
              <SectorView />
            </PrivateRoute>
          } 
        />
      ))}

      {/* Rotas de administração */}
      <Route
        path="/admin/dashboard"
        element={
          <PrivateRoute allowedRoles={["super_admin", "admin"]}>
            <Dashboard />
          </PrivateRoute>
        }
      />
      
      {/* Gerenciamento de usuários - apenas super_admin */}
      <Route
        path="/admin/users"
        element={
          <PrivateRoute allowedRoles={["super_admin"]}>
            <UserManagement />
          </PrivateRoute>
        }
      />

      {/* Registro de usuários - super_admin e admin */}
      <Route
        path="/admin/users/register"
        element={
          <PrivateRoute allowedRoles={["super_admin", "admin"]}>
            <UserRegistration />
          </PrivateRoute>
        }
      />

      {/* Fallback para rota não encontrada */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;