import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Headphones, Upload, FileText, Type, Layers, LogOut, Bell, Menu, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// Interface para tipagem do usuário com avatar
interface UserWithAvatar {
  name?: string;
  role?: string;
  sector?: string;
  avatar?: string | null;
  email: string;
  [key: string]: unknown;
}

// Interface para os itens de conteúdo
interface ContentItem {
  id: string;
  title: string;
  type: 'photo' | 'video' | 'text' | 'title';
  createdAt: string;
}

// Simulação de dados para conteúdo
const mockContent: ContentItem[] = [
  { id: '1', title: 'Como resetar o roteador', type: 'text', createdAt: '2023-01-15' },
  { id: '2', title: 'Configuração de rede WiFi', type: 'photo', createdAt: '2023-02-20' },
  { id: '3', title: 'Tutorial troca de senha', type: 'video', createdAt: '2023-03-10' },
  { id: '4', title: 'FAQ - Perguntas Frequentes', type: 'title', createdAt: '2023-04-05' },
];

const SuporteView: React.FC = () => {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [content] = useState<ContentItem[]>(mockContent);
  
  // Garantir que user tenha a tipagem correta
  const user = authState.user as UserWithAvatar | null;
  const isAdmin = user?.role === 'super_admin' || (user?.role === 'admin' && user.sector === 'suporte');
  const canEdit = isAdmin;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredContent = activeTab === 'all' 
    ? content 
    : content.filter(item => item.type === activeTab);
    
  const navigateToDashboard = () => {
    navigate('/admin/dashboard');
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
              <h1 className="text-xl font-bold text-gray-900">CZNet Suporte</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="p-2 rounded-full hover:bg-gray-200">
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <span className="font-medium text-gray-700">{user?.name}</span>
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
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-gray-800 text-center">{user?.name || 'Usuário'}</h3>
              <span className="text-xs text-gray-500">{user?.role || 'Padrão'}</span>
            </div>
          </div>

          <nav className="mt-4 px-2 space-y-1">
            {user?.role === 'admin' && (
              <button 
                onClick={navigateToDashboard}
                className="flex items-center w-full justify-start space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Search size={20} />
                <span>Dashboard Admin</span>
              </button>
            )}
            <button 
              className="flex items-center w-full justify-start space-x-3 p-3 rounded-lg bg-red-100 text-red-600"
            >
              <Headphones size={20} />
              <span>Suporte</span>
            </button>
            <button className="flex items-center w-full justify-start space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors">
              <Upload size={20} />
              <span>Técnico</span>
            </button>
            <button className="flex items-center w-full justify-start space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors">
              <Bell size={20} />
              <span>NOC</span>
            </button>
            <button className="flex items-center w-full justify-start space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors">
              <Menu size={20} />
              <span>Comercial</span>
            </button>
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
            {/* Content Tabs */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
              <div className="flex flex-wrap border-b">
                <button
                  className={`mr-4 py-2 px-1 font-medium ${
                    activeTab === 'all'
                      ? 'text-red-600 border-b-2 border-red-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('all')}
                >
                  <div className="flex items-center">
                    <Layers size={18} className="mr-1" />
                    <span>Todos</span>
                  </div>
                </button>
                <button
                  className={`mr-4 py-2 px-1 font-medium ${
                    activeTab === 'photo'
                      ? 'text-red-600 border-b-2 border-red-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('photo')}
                >
                  <div className="flex items-center">
                    <Upload size={18} className="mr-1" />
                    <span>Fotos</span>
                  </div>
                </button>
                <button
                  className={`mr-4 py-2 px-1 font-medium ${
                    activeTab === 'video'
                      ? 'text-red-600 border-b-2 border-red-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('video')}
                >
                  <div className="flex items-center">
                    <Upload size={18} className="mr-1" />
                    <span>Vídeos</span>
                  </div>
                </button>
                <button
                  className={`mr-4 py-2 px-1 font-medium ${
                    activeTab === 'text'
                      ? 'text-red-600 border-b-2 border-red-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('text')}
                >
                  <div className="flex items-center">
                    <FileText size={18} className="mr-1" />
                    <span>Textos</span>
                  </div>
                </button>
                <button
                  className={`mr-4 py-2 px-1 font-medium ${
                    activeTab === 'title'
                      ? 'text-red-600 border-b-2 border-red-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('title')}
                >
                  <div className="flex items-center">
                    <Type size={18} className="mr-1" />
                    <span>Títulos</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Botão para adicionar conteúdo (apenas para admin) */}
            {canEdit && (
              <div className="mb-6">
                <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors">
                  Adicionar Conteúdo
                </button>
              </div>
            )}

            {/* Lista de conteúdo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContent.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                        ${item.type === 'photo' ? 'bg-purple-100 text-purple-800' : ''}
                        ${item.type === 'video' ? 'bg-green-100 text-green-800' : ''}
                        ${item.type === 'text' ? 'bg-blue-100 text-blue-800' : ''}
                        ${item.type === 'title' ? 'bg-yellow-100 text-yellow-800' : ''}
                      `}>
                        {item.type === 'photo' && 'Foto'}
                        {item.type === 'video' && 'Vídeo'}
                        {item.type === 'text' && 'Texto'}
                        {item.type === 'title' && 'Título'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">{item.title}</h3>
                    
                    {/* Aqui viria uma prévia do conteúdo baseado no tipo */}
                    <div className="mt-4 h-32 bg-gray-100 rounded flex items-center justify-center">
                      {item.type === 'photo' && (
                        <Upload size={40} className="text-gray-400" />
                      )}
                      {item.type === 'video' && (
                        <Upload size={40} className="text-gray-400" />
                      )}
                      {item.type === 'text' && (
                        <FileText size={40} className="text-gray-400" />
                      )}
                      {item.type === 'title' && (
                        <Type size={40} className="text-gray-400" />
                      )}
                    </div>
                    
                    <div className="mt-4 flex justify-between">
                      <button className="text-red-600 hover:text-red-700 font-medium text-sm">
                        Ver detalhes
                      </button>
                      
                      {canEdit && (
                        <button className="text-gray-500 hover:text-gray-700 font-medium text-sm">
                          Editar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Mensagem quando não há conteúdo */}
            {filteredContent.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  Nenhum conteúdo encontrado para esta categoria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuporteView;