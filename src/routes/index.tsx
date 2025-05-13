import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Login from "../pages/login/Login";
import NotFound from "../pages/NotFound/NotFound";
import SuporteView from "../pages/sectors/SuporteView";
import Dashboard from "../pages/admin/Dashboard"; // Verifique se o caminho está correto
import { useAuth } from "../contexts/AuthContext";

const AppRoutes: React.FC = () => {
  const { authState } = useAuth();
  const { loading } = authState;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Carregando...
      </div>
    );
  }

  console.log(
      "Rotas carregadas, verificando componentes Dashboard:",
      Dashboard ? "Disponível" : "Não disponível"
  );

  return (
    <Routes>
      {/* Log para debug */}
      <Route path="/check" element={<div>Rota de verificação</div>} />

      {/* Rotas públicas */}
      <Route path="/login" element={<Login />} />

      {/* Definir rota padrão */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Rota para Dashboard Admin */}
      <Route
        path="/admin/dashboard"
        element={
          <PrivateRoute allowedRoles={["super_admin", "admin"]}>
            <Dashboard />
          </PrivateRoute>
        }
      />

      {/* Criar rota adicional para testes diretos */}
      <Route path="/dashboard-test" element={<Dashboard {...{}} />} />

      {/* Rota para setor Suporte */}
      <Route
        path="/suporte"
        element={
          <PrivateRoute allowedSectors={["suporte"]}>
            <SuporteView />
          </PrivateRoute>
        }
      />

      {/* Fallback para rota não encontrada */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
