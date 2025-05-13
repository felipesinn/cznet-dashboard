// src/pages/sectors/SectorViewUpdated.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Headphones, Upload, Bell, Menu, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { ContentItem, ContentType, CreateContentData, UpdateContentData } from '../../types/content.types';
import type { SectorType } from '../../types/auth.types';
import { contentService } from '../../services/content.service';

// Ícones para cada setor
const SectorIcons = {
  suporte: <Headphones size={20} />,
  tecnico: <Upload size={20} />,
  noc: <Bell size={20} />,
  comercial: <Menu size={20} />,
  adm: <Search size={20} />
};

// Nomes formatados para cada setor
const SectorNames = {
  suporte: 'Suporte',
  tecnico: 'Técnico',
  noc: 'NOC',
  comercial: 'Comercial',
  adm: 'ADM'
};

const SectorViewUpdated: React.FC = () => {
  const { sector } = useParams<{ sector: SectorType }>();
  const navigate = useNavigate();
  const { authState, logout } = useAuth();
  const user = authState.user;
  
  // Estados para gerenciar conteúdo
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // Estados para formulários e modais
  const [, setShowContentForm] = useState<boolean>(false);
  const [showTutorialForm, setShowTutorialForm] = useState<boolean>(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [viewingContent, setViewingContent] = useState<ContentItem | null>(null);
  const [viewingTutorial, setViewingTutorial] = useState<ContentItem | null>(null);
  
  // Estado para seleção de tipo de conteúdo
  const [showContentTypeSelector, setShowContentTypeSelector] = useState<boolean>(false);
  
  // Verificar permissões
  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = isSuperAdmin || (user?.role === 'admin' && user?.sector === sector);
  const canEdit = isAdmin;
  
  // Obter o setor atual
  const currentSector = sector || user?.sector || 'suporte';
  
  // Verificar se o usuário tem acesso a este setor
  useEffect(() => {
    if (user && !isSuperAdmin && user.sector !== currentSector) {
      // Redirecionar para o setor do usuário se ele não tiver acesso
      navigate(`/${user.sector}`);
    }
  }, [user, currentSector, isSuperAdmin, navigate]);
  
  // Carregar conteúdo ao montar o componente ou quando o setor/tab mudar
  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let contentList: ContentItem[];
        
          contentList = await contentService.getContentBySector(currentSector);
          contentList = await contentService.getContentBySector(currentSector as SectorType);
        } else if (activeTab === 'tutorial') {
          // Buscar especificamente tutoriais
          contentList = await contentService.getContentByType('tutorial' as ContentType, currentSector as SectorType);
        } else {
          contentList = await contentService.getContentByType(activeTab as ContentType, currentSector as SectorType);
        }
        
        setContents(contentList);
      } catch (err) {
        console.error('Erro ao carregar conteúdo:', err);
        setError('Não foi possível carregar o conteúdo. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    loadContent();
  }, [activeTab, currentSector]);
  
  // Filtrar conteúdo com base na aba selecionada
  const filteredContent = contents;
  
  // Função para lidar com navegação entre setores
  const navigateToSector = (sectorPath: string) => {
    if (isSuperAdmin || sectorPath === user?.sector) {
      navigate(`/${sectorPath}`);
    }
  };
  
  // Função para lidar com logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Função para visualizar conteúdo
  const handleViewContent = (content: ContentItem) => {
    // Se for um tutorial, use o visualizador de tutorial
    if (content.type === 'tutorial') {
      setViewingTutorial(content);
    } else {
      // Caso contrário, use o visualizador de conteúdo padrão
      setViewingContent(content);
    }
  };
  
  // Função para abrir formulário de edição
  const handleEditContent = (content: ContentItem) => {
    setEditingContent(content);
    
    // Abrir o formulário apropriado com base no tipo de conteúdo
    if (content.type === 'tutorial') {
      setShowTutorialForm(true);
    } else {
      setShowContentForm(true);
    }
  };
  
  // Função para excluir conteúdo
  const handleDeleteContent = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este conteúdo? Esta ação não pode ser desfeita.')) {
      try {
        await contentService.deleteContent(id);
        // Atualizar lista após exclusão
        setContents(prevContents => prevContents.filter(content => content.id !== id));
      } catch (err) {
        console.error('Erro ao excluir conteúdo:', err);
        alert('Não foi possível excluir o conteúdo. Tente novamente mais tarde.');
      }
    }
  };
  
  // Função para selecionar o tipo de conteúdo a ser adicionado
  const handleAddContent = () => {
    setEditingContent(null);
    setShowContentTypeSelector(true);
  };
  
  // Função para criar conteúdo regular
  const createRegularContent = () => {
    setShowContentTypeSelector(false);
    setShowContentForm(true);
  };
  
  // Função para criar tutorial
  const createTutorial = () => {
    setShowContentTypeSelector(false);
    setShowTutorialForm(true);
  };
  
  // Função para fechar o seletor de tipo de conteúdo
  const handleCloseTypeSelector = () => {
    setShowContentTypeSelector(false);
  };
  
  // Função para fechar o formulário de conteúdo
  const handleCloseContentForm = () => {
    setShowContentForm(false);
    setEditingContent(null);
  };
  
  // Função para fechar o formulário de tutorial
  const handleCloseTutorialForm = () => {
    setShowTutorialForm(false);
    setEditingContent(null);
  };
  
  // Função para lidar com submissão do formulário de conteúdo
  const handleContentFormSubmit = async (data: CreateContentData | UpdateContentData) => {
    try {
      if (editingContent) {
        // Atualizar conteúdo existente
        const updatedContent = await contentService.updateContent(editingContent.id, data);
        
        // Atualizar lista após edição
        setContents(prevContents => 
          prevContents.map(content => 
            content.id === updatedContent.id ? updatedContent : content
          )
        );
      } else {
        // Criar novo conteúdo
        const newContent = await contentService.createContent(data as CreateContentData);
        
        // Adicionar à lista
        setContents(prevContents => [newContent, ...prevContents]);
      }
      
      // Fechar formulário
      setShowContentForm(false);
      setEditingContent(null);
    } catch (err) {
      console.error('Erro ao salvar conteúdo:', err);
      alert('Não foi possível salvar o conteúdo. Tente novamente mais tarde.');
    }
  };
  
  // Função para lidar com submissão do formulário de tutorial
  const handleTutorialFormSubmit = async (data: any) => {
    try {
      // Preparar dados do tutorial para salvamento
      const tutorialData: CreateContentData | UpdateContentData = {
        title: data.title,
        description: data.description,
        type: 'tutorial',
        sector: data.sector,
        // Armazenar os passos como mediaItems
        mediaItems: data.steps.map((step: any, index: number) => ({
          id: step.id,
          type: 'tutorial_step',
          title: step.title,
          description: step.description,
          content: step.image || '',
          order: index
        })),
        tags: data.tags || [],
        category: data.category || 'Tutorial'
      };
      
      if (editingContent) {
        // Atualizar tutorial existente
        const updatedContent = await contentService.updateContent(editingContent.id, tutorialData);
        
        // Atualizar lista após edição
        setContents(prevContents => 
          prevContents.map(content => 
            content.id === updatedContent.id ? updatedContent : content
          )
        );
      } else {
        // Criar novo tutorial
        const newContent = await contentService.createContent(tutorialData as CreateContentData);
        
        // Adicionar à lista
        setContents(prevContents => [newContent, ...prevContents]);
      }
      
      // Fechar formulário
      setShowTutorialForm(false);
      setEditingContent(null);
    } catch (err) {
      console.error('Erro ao salvar tutorial:', err);
      alert('Não foi possível salvar o tutorial. Tente novamente mais tarde.');
    }
  };
  
  // Navegação para o dashboard (apenas para admin)
  const navigateToDashboard = () => {
    if (isAdmin || isSuperAdmin) {
      navigate('/admin/dashboard');
    }
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
                CZNet {SectorNames[currentSector as SectorType] || 'Portal'}
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
                <span className="text-2xl font-semibold text-gray-700">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 text-center">{user?.name || 'Usuário'}</h3>
              <span className="text-xs text-gray-500">{user?.role || 'Usuário'}</span>
            </div>
          </div>

          <nav className="mt-4 px-2 space-y-1">
            {/* Dashboard (apenas para admin) */}
            {isAdmin && (
              <button 
                onClick={navigateToDashboard}
                className="flex items-center w-full justify-start space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Search size={20} />
                <span>Dashboard Admin</span>
              </button>
            )}
            
            {/* Setores - mostrar todos para super admin, apenas o próprio para outros */}
            {isSuperAdmin ? (
              // Todos os setores para super admin
              <>
                <button 
                  onClick={() => navigateToSector('suporte')}
                  className={`flex items-center w-full justify-start space-x-3 p-3 rounded-lg ${
                    currentSector === 'suporte' ? 'bg-red-100 text-red-600' : 'hover:bg-gray-200 transition-colors'
                  }`}
                >
                  <Headphones size={20} />
                  <span>Suporte</span>
                </button>
                
                <button 
                  onClick={() => navigateToSector('tecnico')}
                  className={`flex items-center w-full justify-start space-x-3 p-3 rounded-lg ${
                    currentSector === 'tecnico' ? 'bg-red-100 text-red-600' : 'hover:bg-gray-200 transition-colors'
                  }`}
                >
                  <Upload size={20} />
                  <span>Técnico</span>
                </button>
                
                <button 
                  onClick={() => navigateToSector('noc')}
                  className={`flex items-center w-full justify-start space-x-3 p-3 rounded-lg ${
                    currentSector === 'noc' ? 'bg-red-100 text-red-600' : 'hover:bg-gray-200 transition-colors'
                  }`}
                >
                  <Bell size={20} />
                  <span>NOC</span>
                </button>
                
                <button 
                  onClick={() => navigateToSector('comercial')}
                  className={`flex items-center w-full justify-start space-x-3 p-3 rounded-lg ${
                    currentSector === 'comercial' ? 'bg-red-100 text-red-600' : 'hover:bg-gray-200 transition-colors'
                  }`}
                >
                  <Menu size={20} />
                  <span>Comercial</span>
                </button>
                
                <button 
                  onClick={() => navigateToSector('adm')}
                  className={`flex items-center w-full justify-start space-x-3 p-3 rounded-lg ${
                    currentSector === 'adm' ? 'bg-red-100 text-red-600' : 'hover:bg-gray-200 transition-colors'
                  }`}
                >
                  <Search size={20} />
                  <span>ADM</span>
                </button>
              </>
            ) : (
              // Apenas o próprio setor para outros usuários
              <button 
                className="flex items-center w-full justify-start space-x-3 p-3 rounded-lg bg-red-100 text-red-600"
              >
                {SectorIcons[currentSector as SectorType] || <Search size={20} />}
                <span>{SectorNames[currentSector as SectorType] || currentSector}</span>
              </button>
            )}
            
            {/* Botão de logout */}
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
                
                {/* Nova aba para Tutoriais */}
                <button
                  className={`mr-4 py-2 px-1 font-medium ${
                    activeTab === 'tutorial'
                      ? 'text-red-600 border-b-2 border-red-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('tutorial')}
                >
                  <div className="flex items-center">
                    <BookOpen size={18} className="mr-1" />
                    <span>Tutoriais</span>
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
                <button 
                  onClick={handleAddContent}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center"
                >
                  <Plus size={18} className="mr-1" />
                  Adicionar Conteúdo
                </button>
              </div>
            )}

            {/* Mensagem de erro */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <svg className="animate-spin h-8 w-8 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}

            {/* Lista de conteúdo */}
            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContent.map((content) => (
                  <ContentCard
                    key={content.id}
                    content={content}
                    onView={handleViewContent}
                    onEdit={canEdit ? handleEditContent : undefined}
                    onDelete={canEdit ? handleDeleteContent : undefined}
                    canEdit={canEdit}
                  />
                ))}
              </div>
            )}
            
            {/* Mensagem quando não há conteúdo */}
            {!loading && filteredContent.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  Nenhum conteúdo encontrado para esta categoria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Seletor de tipo de conteúdo */}
      {showContentTypeSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Selecione o tipo de conteúdo</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={createRegularContent}
                className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center"
              >
                <FileText size={36} className="mb-2 text-blue-500" />
                <span className="font-medium">Conteúdo Regular</span>
                <span className="text-xs text-gray-500 text-center mt-1">
                  Texto, imagem, vídeo
                </span>
              </button>
              
              <button
                onClick={createTutorial}
                className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center"
              >
                <BookOpen size={36} className="mb-2 text-green-500" />
                <span className="font-medium">Tutorial / Manual</span>
                <span className="text-xs text-gray-500 text-center mt-1">
                  Guia passo a passo
                </span>
              </button>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleCloseTypeSelector}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de visualização de conteúdo regular */}
      {viewingContent && (
        <ContentModal 
          content={viewingContent} 
          onClose={() => setViewingContent(null)}
        />
      )}
      
      {/* Modal de visualização de tutorial */}
      {viewingTutorial && (
        <TutorialViewer
          tutorial={viewingTutorial}
          userSector={currentSector as SectorType}
          isSuperAdmin={isSuperAdmin}
          onClose={() => setViewingTutorial(null)}
          onEdit={canEdit ? () => handleEditContent(viewingTutorial) : undefined}
        />
      )}

      {/* Formulário de conteúdo regular */}
      {showContentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full">
            <ContentForm
              initialData={editingContent || undefined}
              userSector={currentSector as SectorType}
              isSuperAdmin={isSuperAdmin}
              onSubmit={handleContentFormSubmit}
              onCancel={handleCloseContentForm}
            />
          </div>
        </div>
      )}
      
      {/* Formulário de tutorial */}
      {showTutorialForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full">
            <TutorialForm
              initialTutorial={editingContent}
              userSector={currentSector as SectorType}
              isSuperAdmin={isSuperAdmin}
              onSubmit={handleTutorialFormSubmit}
              onCancel={handleCloseTutorialForm}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SectorViewUpdated;