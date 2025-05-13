// src/routes/AppRoutes.tsx
import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Login from "../pages/login/Login";
import NotFound from "../pages/NotFound/NotFound";
import SectorView from "../pages/sectors/SectorView";
import Dashboard from "../pages/admin/Dashboard";
import UserManagement from "../pages/admin/UserManagement";
import UserRegistration from "../pages/admin/UserRegistration";
import TutorialEditor from "../components/tutorials/TutorialEditor";
import ResponsiveLayout from "../components/layout/ResponsiveLayout";
import { useAuth } from "../contexts/AuthContext";
import type { SectorType } from "../types/content.types";

const AppRoutes: React.FC = () => {
  const { authState } = useAuth();
  const { loading } = authState;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <svg className="animate-spin h-8 w-8 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={<Login />} />

      {/* Redirecionar raiz para login */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Rotas de setores */}
      <Route 
        path="/suporte" 
        element={
          <PrivateRoute allowedSectors={["suporte"]}>
            <SectorView />
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/tecnico" 
        element={
          <PrivateRoute allowedSectors={["tecnico"]}>
            <SectorView />
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/noc" 
        element={
          <PrivateRoute allowedSectors={["noc"]}>
            <SectorView />
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/comercial" 
        element={
          <PrivateRoute allowedSectors={["comercial"]}>
            <SectorView />
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/adm" 
        element={
          <PrivateRoute allowedSectors={["adm"]}>
            <SectorView />
          </PrivateRoute>
        } 
      />

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
            <ResponsiveLayout title="Registrar Novo Usuário">
              <UserRegistration />
            </ResponsiveLayout>
          </PrivateRoute>
        }
      />
      
      {/* Criação/Edição de Tutoriais - super_admin e admin */}
      <Route
        path="/admin/tutorials/create"
        element={
          <PrivateRoute allowedRoles={["super_admin", "admin"]}>
            <ResponsiveLayout title="Criar Tutorial">
              <div className="p-4">
                <TutorialEditor
                  userSector={authState.user?.sector as SectorType || 'suporte' as SectorType}
                  isSuperAdmin={authState.user?.role === 'super_admin'}
                  onSubmit={async () => {
                    // Implementar função real para enviar à API
                    alert('Salvando tutorial...');
                    return Promise.resolve();
                  }}
                  onCancel={() => window.history.back()}
                />
              </div>
            </ResponsiveLayout>
          </PrivateRoute>
        }
      />
      
      <Route
        path="/admin/tutorials/edit/:id"
        element={
          <PrivateRoute allowedRoles={["super_admin", "admin"]}>
            <ResponsiveLayout title="Editar Tutorial">
              <div className="p-4">
                <TutorialEditor
                  userSector={authState.user?.sector as SectorType || 'suporte' as SectorType}
                  isSuperAdmin={authState.user?.role === 'super_admin'}
                  onSubmit={async () => {
                    // Implementar função real para enviar à API
                    alert('Atualizando tutorial...');
                    return Promise.resolve();
                  }}
                  onCancel={() => window.history.back()}
                />
              </div>
            </ResponsiveLayout>
          </PrivateRoute>
        }
      />

      {/* Fallback para rota não encontrada */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;