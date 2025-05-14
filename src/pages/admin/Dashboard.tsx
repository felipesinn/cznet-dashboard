import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Database, 
  ArrowRight 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ResponsiveLayout from '../../components/layout/ResponsiveLayout';
import api from '../../services/api';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { user } = authState;
  
  // Estados
  const [stats, setStats] = useState({
    users: 0,
    content: {
      total: 0,
      byType: {},
      bySector: {}
    }
  });
  const [loading, setLoading] = useState(true);
  
  // Verificar permissões
  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = isSuperAdmin || user?.role === 'admin';
  
  // Carregar estatísticas
  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      
      try {
        // Em um sistema real, estas seriam chamadas de API
        // Para simplificar, estamos mockando os dados
        
        // Estatísticas de usuários (apenas para super_admin)
        let userStats = 0;
        if (isSuperAdmin) {
          try {
            const usersResponse = await api.get('/users');
            userStats = usersResponse.data.length;
          } catch (err) {
            console.error('Erro ao carregar estatísticas de usuários:', err);
            userStats = 0;
          }
        }
        
        // Estatísticas de conteúdo
        const contentStats = {
          total: 0,
          byType: {},
          bySector: {}
        };
        
        try {
          // Para admin, filtrar pelo setor
          const url = isSuperAdmin ? '/content' : `/content/sector/${user?.sector}`;
          const contentResponse = await api.get(url);
          
          contentStats.total = contentResponse.data.length;
          
          // Agrupar por tipo
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          contentStats.byType = contentResponse.data.reduce((acc: any, content: any) => {
            acc[content.type] = (acc[content.type] || 0) + 1;
            return acc;
          }, {});
          
          // Agrupar por setor (apenas para super_admin)
          if (isSuperAdmin) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            contentStats.bySector = contentResponse.data.reduce((acc: any, content: any) => {
              acc[content.sector] = (acc[content.sector] || 0) + 1;
              return acc;
            }, {});
          }
        } catch (err) {
          console.error('Erro ao carregar estatísticas de conteúdo:', err);
        }
        
        setStats({
          users: userStats,
          content: contentStats
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadStats();
  }, [isSuperAdmin, user?.sector]);

  // Redirecionar se não for admin
  if (!isAdmin) {
    navigate(`/${user?.sector || ''}`);
    return null;
  }

  return (
    <ResponsiveLayout title="Dashboard Administrativo">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          {isSuperAdmin ? 'Dashboard Master' : `Dashboard ${user?.sector}`}
        </h1>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <svg className="animate-spin h-8 w-8 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card de usuários (apenas para super_admin) */}
            {isSuperAdmin && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Usuários</h3>
                  <Users className="text-blue-500" size={24} />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-4">{stats.users}</p>
                <button
                  onClick={() => navigate('/admin/users')}
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <span>Gerenciar Usuários</span>
                  <ArrowRight size={16} className="ml-1" />
                </button>
              </div>
            )}

            {/* Card de conteúdo */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Conteúdo</h3>
                <Database className="text-green-500" size={24} />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-4">{stats.content.total}</p>
              <button
                onClick={() => navigate(`/${user?.sector}`)}
                className="flex items-center text-green-600 hover:text-green-800"
              >
                <span>Gerenciar Conteúdo</span>
                <ArrowRight size={16} className="ml-1" />
              </button>
            </div>

            {/* Card de conteúdo por tipo */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Conteúdo por Tipo</h3>
              </div>
              <div className="space-y-2">
                {Object.entries(stats.content.byType).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="text-gray-700 capitalize">{type}</span>
                    <span className="font-semibold">{count as number}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card de conteúdo por setor (apenas para super_admin) */}
            {isSuperAdmin && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Conteúdo por Setor</h3>
                </div>
                <div className="space-y-2">
                  {Object.entries(stats.content.bySector).map(([sector, count]) => (
                    <div key={sector} className="flex justify-between items-center">
                      <span className="text-gray-700 capitalize">{sector}</span>
                      <span className="font-semibold">{count as number}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ações rápidas */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => navigate(`/${user?.sector}`)}
              className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center"
            >
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <Database size={20} className="text-red-600" />
              </div>
              <div className="text-left">
                <h3 className="font-medium">Gerenciar Conteúdo</h3>
                <p className="text-sm text-gray-500">
                  {isSuperAdmin ? 'Ver todos os setores' : `Setor ${user?.sector}`}
                </p>
              </div>
            </button>

            {isSuperAdmin && (
              <button
                onClick={() => navigate('/admin/users')}
                className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <Users size={20} className="text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium">Gerenciar Usuários</h3>
                  <p className="text-sm text-gray-500">
                    Criar, editar e excluir usuários
                  </p>
                </div>
              </button>
            )}

            <button
              onClick={() => navigate('/admin/users/register')}
              className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center"
            >
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <Users size={20} className="text-green-600" />
              </div>
              <div className="text-left">
                <h3 className="font-medium">Registrar Usuário</h3>
                <p className="text-sm text-gray-500">
                  {isSuperAdmin ? 'Criar usuário em qualquer setor' : `Criar usuário no setor ${user?.sector}`}
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default Dashboard;