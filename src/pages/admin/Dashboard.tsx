import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Menu, Upload, FileText, Type, Layers, Headphones, LogOut, Search, Users, Database } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// Interface para tipagem do avatar do usuário
interface UserWithAvatar {
  name?: string;
  role?: string;
  sector?: string;
  avatar?: string | null;
  email: string;
  [key: string]: unknown;
}

// Interface para props do componente (mesmo que estejam vazias)
type DashboardProps = object

// Setores disponíveis
enum Sector {
  SUPORTE = 'suporte',
  TECNICO = 'tecnico',
  NOC = 'noc',
  COMERCIAL = 'comercial',
  ADM = 'adm'
}

// Componente com props definidas
const Dashboard: React.FC<DashboardProps> = (_props) => {
  const navigate = useNavigate();
  const { authState, logout } = useAuth();
  // Corrigido: use tipagem apropriada para o usuário com avatar
  const user = authState.user as UserWithAvatar | null;
  
  // Verificar se o usuário é super_admin
  const isSuperAdmin = user?.role === 'super_admin';
  // Obter o setor atual do usuário (padrão para 'suporte' se não definido)
  const userSector = user?.sector || 'suporte';
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const navigateToSector = (sector: string) => {
    // Se não for superadmin, só pode acessar seu próprio setor
    if (!isSuperAdmin && sector !== userSector) {
      return;
    }
    navigate(`/${sector}`);
  };
  
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold mr-2">
                CZ
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                {isSuperAdmin ? "CZNet Dashboard Master" : `CZNet Dashboard ${user?.sector || ''}`}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="p-2 rounded-full hover:bg-gray-200">
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
              </div>
              <div className="flex items-center space-x-2">
                {/* Usar avatar do usuário ou mostrar iniciais */}
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium">
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <span className="font-medium text-gray-700">{user?.name || 'Admin CZNet'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="bg-white border-r border-gray-200 w-64 flex-shrink-0">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-red-500 mb-2 bg-gray-200 flex items-center justify-center">
                {user?.avatar && typeof user.avatar === 'string' ? (
                  <img 
                    src={user.avatar} 
                    alt={user?.name || 'Avatar'} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <span className="text-2xl font-semibold text-gray-700">
                    {user?.name?.charAt(0) || 'A'}
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-gray-800 text-center">{user?.name || 'Admin CZNet'}</h3>
              <span className="text-xs text-gray-500">
                {user?.role === 'super_admin' ? 'Master Admin' : user?.role === 'admin' ? `Admin ${user.sector}` : user?.role || 'Usuário'}
              </span>
            </div>
          </div>

          <nav className="mt-4 px-2 space-y-1">
            {/* Apenas mostrar o setor do usuário, exceto para superadmin */}
            {isSuperAdmin ? (
              // Mostrar todos os setores para o superadmin
              <>
                <button 
                  onClick={() => navigateToSector(Sector.SUPORTE)}
                  className={`flex items-center w-full justify-start space-x-3 p-3 rounded-lg ${
                    userSector === Sector.SUPORTE ? 'bg-red-100 text-red-600' : 'hover:bg-gray-200 transition-colors'
                  }`}
                >
                  <Headphones size={20} />
                  <span>Suporte</span>
                </button>
                
                <button 
                  onClick={() => navigateToSector(Sector.TECNICO)}
                  className={`flex items-center w-full justify-start space-x-3 p-3 rounded-lg ${
                    userSector === Sector.TECNICO ? 'bg-red-100 text-red-600' : 'hover:bg-gray-200 transition-colors'
                  }`}
                >
                  <Upload size={20} />
                  <span>Técnico</span>
                </button>
                
                <button 
                  onClick={() => navigateToSector(Sector.NOC)}
                  className={`flex items-center w-full justify-start space-x-3 p-3 rounded-lg ${
                    userSector === Sector.NOC ? 'bg-red-100 text-red-600' : 'hover:bg-gray-200 transition-colors'
                  }`}
                >
                  <Bell size={20} />
                  <span>NOC</span>
                </button>
                
                <button 
                  onClick={() => navigateToSector(Sector.COMERCIAL)}
                  className={`flex items-center w-full justify-start space-x-3 p-3 rounded-lg ${
                    userSector === Sector.COMERCIAL ? 'bg-red-100 text-red-600' : 'hover:bg-gray-200 transition-colors'
                  }`}
                >
                  <Menu size={20} />
                  <span>Comercial</span>
                </button>
                
                <button 
                  onClick={() => navigateToSector(Sector.ADM)}
                  className={`flex items-center w-full justify-start space-x-3 p-3 rounded-lg ${
                    userSector === Sector.ADM ? 'bg-red-100 text-red-600' : 'hover:bg-gray-200 transition-colors'
                  }`}
                >
                  <Search size={20} />
                  <span>ADM</span>
                </button>
              </>
            ) : (
              // Mostrar apenas o setor do usuário para outros usuários
              <button 
                onClick={() => navigateToSector(userSector)}
                className="flex items-center w-full justify-start space-x-3 p-3 rounded-lg bg-red-100 text-red-600"
              >
                {userSector === Sector.SUPORTE && <Headphones size={20} />}
                {userSector === Sector.TECNICO && <Upload size={20} />}
                {userSector === Sector.NOC && <Bell size={20} />}
                {userSector === Sector.COMERCIAL && <Menu size={20} />}
                {userSector === Sector.ADM && <Search size={20} />}
                <span>{userSector.charAt(0).toUpperCase() + userSector.slice(1)}</span>
              </button>
            )}
            
            {/* Ferramentas exclusivas para super_admin ou admins */}
            {(isSuperAdmin || user?.role === 'admin') && (
              <>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Ferramentas Admin
                  </h3>
                </div>
                
                {isSuperAdmin && (
                  <button 
                    onClick={() => navigate('/admin/users')}
                    className="flex items-center w-full justify-start space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Users size={20} />
                    <span>Gerenciar Usuários</span>
                  </button>
                )}
                
                <button 
                  className="flex items-center w-full justify-start space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Database size={20} />
                  <span>Gerenciar Conteúdo</span>
                </button>
              </>
            )}
            
            <button 
              onClick={handleLogout}
              className="flex items-center w-full justify-start space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors text-red-600 mt-8"
            >
              <LogOut size={20} />
              <span>Sair</span>
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {isSuperAdmin 
                  ? "Dashboard Principal" 
                  : user?.role === 'admin' 
                    ? `Dashboard ${user.sector}` 
                    : `Visualização ${user?.sector || 'do Sistema'}`}
              </h2>
              <p className="text-gray-600 mt-1">
                {isSuperAdmin 
                  ? "Visão geral de todos os setores" 
                  : user?.role === 'admin' 
                    ? `Gerencie o conteúdo do setor ${user.sector}` 
                    : `Visualização do conteúdo do setor ${user?.sector || ''}`}
              </p>
            </div>

            {/* Content Tabs */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
              <div className="flex flex-wrap border-b">
                <button className="mr-4 py-2 px-1 font-medium text-red-600 border-b-2 border-red-600">
                  <div className="flex items-center">
                    <Layers size={18} className="mr-1" />
                    <span>Todos</span>
                  </div>
                </button>
                <button className="mr-4 py-2 px-1 font-medium text-gray-500 hover:text-gray-700">
                  <div className="flex items-center">
                    <Upload size={18} className="mr-1" />
                    <span>Fotos</span>
                  </div>
                </button>
                <button className="mr-4 py-2 px-1 font-medium text-gray-500 hover:text-gray-700">
                  <div className="flex items-center">
                    <Upload size={18} className="mr-1" />
                    <span>Vídeos</span>
                  </div>
                </button>
                <button className="mr-4 py-2 px-1 font-medium text-gray-500 hover:text-gray-700">
                  <div className="flex items-center">
                    <FileText size={18} className="mr-1" />
                    <span>Textos</span>
                  </div>
                </button>
                <button className="mr-4 py-2 px-1 font-medium text-gray-500 hover:text-gray-700">
                  <div className="flex items-center">
                    <Type size={18} className="mr-1" />
                    <span>Títulos</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Add Content Button - apenas para superadmin ou admin do setor */}
            {(isSuperAdmin || user?.role === 'admin') && (
              <div className="mb-6">
                <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors">
                  Adicionar Conteúdo
                </button>
              </div>
            )}

            {/* Content Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Texto
                    </span>
                    <span className="text-xs text-gray-500">15/01/2023</span>
                  </div>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">Como resetar o roteador</h3>
                  <div className="mt-4 h-32 bg-gray-100 rounded flex items-center justify-center">
                    <FileText size={40} className="text-gray-400" />
                  </div>
                  <div className="mt-4 flex justify-between">
                    <button className="text-red-600 hover:text-red-700 font-medium text-sm">
                      Ver detalhes
                    </button>
                    
                    {/* Opção de editar apenas para admin e superadmin */}
                    {(isSuperAdmin || user?.role === 'admin') && (
                      <button className="text-gray-500 hover:text-gray-700 font-medium text-sm">
                        Editar
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Foto
                    </span>
                    <span className="text-xs text-gray-500">20/02/2023</span>
                  </div>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">Configuração de rede WiFi</h3>
                  <div className="mt-4 h-32 bg-gray-100 rounded flex items-center justify-center">
                    <Upload size={40} className="text-gray-400" />
                  </div>
                  <div className="mt-4 flex justify-between">
                    <button className="text-red-600 hover:text-red-700 font-medium text-sm">
                      Ver detalhes
                    </button>
                    
                    {/* Opção de editar apenas para admin e superadmin */}
                    {(isSuperAdmin || user?.role === 'admin') && (
                      <button className="text-gray-500 hover:text-gray-700 font-medium text-sm">
                        Editar
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Vídeo
                    </span>
                    <span className="text-xs text-gray-500">10/03/2023</span>
                  </div>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">Tutorial troca de senha</h3>
                  <div className="mt-4 h-32 bg-gray-100 rounded flex items-center justify-center">
                    <Upload size={40} className="text-gray-400" />
                  </div>
                  <div className="mt-4 flex justify-between">
                    <button className="text-red-600 hover:text-red-700 font-medium text-sm">
                      Ver detalhes
                    </button>
                    
                    {/* Opção de editar apenas para admin e superadmin */}
                    {(isSuperAdmin || user?.role === 'admin') && (
                      <button className="text-gray-500 hover:text-gray-700 font-medium text-sm">
                        Editar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;