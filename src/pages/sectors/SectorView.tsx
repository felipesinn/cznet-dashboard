import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Layers, 
  Plus, 
  FileText, 
  Type, 
  Upload,
  Book
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ResponsiveLayout from '../../components/layout/ResponsiveLayout';
import ContentCard from '../../components/ContentCard';
import ContentModal from '../../components/ContentModal';
import ContentForm from '../../components/ContentForm';
import type { ContentItem, SectorType } from '../../types/content.types';
import api from '../../services/api';

const SectorView: React.FC = () => {
  const { sector } = useParams<{ sector: string }>();
  const { authState } = useAuth();
  const { user } = authState;
  
  // Estados
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [viewingContent, setViewingContent] = useState<ContentItem | null>(null);
  
  // Verificar permissões
  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = isSuperAdmin || (user?.role === 'admin' && user?.sector === sector);
  const canEdit = isAdmin;
  
  // Obter o setor atual
  const currentSector = sector || user?.sector || 'suporte';

  // Carregar conteúdo
  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let url = '/content';
        
        // Filtrar por setor
        if (currentSector) {
          url += `/sector/${currentSector}`;
        }
        
        // Filtrar por tipo se não for 'all'
        if (activeTab !== 'all') {
          url = `/content/type/${activeTab}`;
          if (currentSector) {
            url += `?sector=${currentSector}`;
          }
        }
        
        const response = await api.get(url);
        setContents(response.data);
      } catch (err) {
        console.error('Erro ao carregar conteúdo:', err);
        setError('Não foi possível carregar o conteúdo. Por favor, tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    loadContent();
  }, [activeTab, currentSector]);

  // Filtrar conteúdo
  const filteredContent = contents;

  // Adicionar conteúdo
  const handleAddContent = () => {
    setEditingContent(null);
    setShowForm(true);
  };

  // Editar conteúdo
  const handleEditContent = (content: ContentItem) => {
    setEditingContent(content);
    setShowForm(true);
  };

  // Visualizar conteúdo
  const handleViewContent = (content: ContentItem) => {
    setViewingContent(content);
  };

  // Excluir conteúdo
  const handleDeleteContent = async (id: string) => {
    try {
      await api.delete(`/content/${id}`);
      setContents(contents.filter(content => content.id !== id));
    } catch (err) {
      console.error('Erro ao excluir conteúdo:', err);
      alert('Não foi possível excluir o conteúdo.');
    }
  };

  // Enviar formulário
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFormSubmit = async (data: any) => {
    try {
      if (editingContent) {
        // Atualizar conteúdo existente
        const formData = new FormData();
        for (const key in data) {
          if (key === 'file' && data[key]) {
            formData.append('file', data[key]);
          } else if (data[key] !== undefined) {
            formData.append(key, data[key]);
          }
        }
        
        const response = await api.put(`/content/${editingContent.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        setContents(contents.map(content => 
          content.id === response.data.id ? response.data : content
        ));
      } else {
        // Criar novo conteúdo
        const formData = new FormData();
        for (const key in data) {
          if (key === 'file' && data[key]) {
            formData.append('file', data[key]);
          } else if (data[key] !== undefined) {
            formData.append(key, data[key]);
          }
        }
        
        // Adicionar o setor atual se não estiver definido
        if (!formData.get('sector')) {
          formData.append('sector', currentSector as string);
        }
        
        const response = await api.post('/content', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        setContents([response.data, ...contents]);
      }
      
      setShowForm(false);
      setEditingContent(null);
    } catch (err) {
      console.error('Erro ao salvar conteúdo:', err);
      alert('Não foi possível salvar o conteúdo.');
    }
  };

  return (
    <ResponsiveLayout currentSector={currentSector as SectorType}>
      <div className="p-6">
        {/* Abas de conteúdo */}
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
            <button
              className={`mr-4 py-2 px-1 font-medium ${
                activeTab === 'tutorial'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('tutorial')}
            >
              <div className="flex items-center">
                <Book size={18} className="mr-1" />
                <span>Tutoriais</span>
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
              <Plus size={18} className="mr-2" />
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

        {/* Carregando */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <svg className="animate-spin h-8 w-8 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <>
            {/* Lista de conteúdo */}
            {filteredContent.length > 0 ? (
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
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  Nenhum conteúdo encontrado para esta categoria.
                </p>
                {canEdit && (
                  <button
                    onClick={handleAddContent}
                    className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors inline-flex items-center"
                  >
                    <Plus size={18} className="mr-2" />
                    Adicionar Conteúdo
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de visualização */}
      {viewingContent && (
        <ContentModal
          content={viewingContent}
          onClose={() => setViewingContent(null)}
        />
      )}

      {/* Formulário de conteúdo */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <ContentForm
              initialData={editingContent}
              userSector={currentSector as SectorType}
              isSuperAdmin={isSuperAdmin}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingContent(null);
              }}
            />
          </div>
        </div>
      )}
    </ResponsiveLayout>
  );
};

export default SectorView;