import React, { useState, useCallback } from 'react';
import { Search, Plus } from 'lucide-react';
import  ResponsiveLayout from '../../components/layout/ResponsiveLayout';
import ContentViewer from '../../components/content/ContentViewer';
import ContentForm from '../../components/content/ContentForm';
import ContentAdditionForm from '../../components/content/ContentAdditionForm';
import SearchBar from '../../components/ui/SearchBar';
import FilterButtons from '../../components/ui/FilterButtons';
import  ConfirmDialog from '../../components/ui/ConfirmDialog';

import { usePermissions } from '../../hooks/usePermissions';
import { useSectorContent } from '../../hooks/useSectorContent';
import { type ContentItem } from '../../types/content.types';
import { type SectorType } from '../../types/common.types';
import { deleteContentSafely } from '../../utils/api.utils';
import { contentService } from '../../services/content.service';

const SectorView: React.FC = () => {
  const { canEditContent, isSuperAdmin, isAdmin, currentSector } = usePermissions();
  const { 
    contents, 
    loading, 
    error, 
    fetchContents,
    getContentsByCategory 
  } = useSectorContent(currentSector as SectorType);
  
  // Estados de UI
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [isAddingContent, setIsAddingContent] = useState(false);
  const [isAddingToArticle, setIsAddingToArticle] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  
  // Opções de filtro
  const filterOptions = [
    { id: 'all', label: 'Todos' },
    { id: 'tutorials', label: 'Tutoriais' },
    { id: 'procedures', label: 'Procedimentos' },
    { id: 'configurations', label: 'Configurações' }
  ];
  
  // Filtrar conteúdos
  const getFilteredContents = useCallback(() => {
    let filtered = [...contents];
    
    // Filtro de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(content => 
        content.title.toLowerCase().includes(term) || 
        (content.description?.toLowerCase() || '').includes(term)
      );
    }
    
    // Filtro de categoria
    if (selectedFilter !== 'all') {
      filtered = getContentsByCategory(selectedFilter);
    }
    
    return filtered;
  }, [contents, searchTerm, selectedFilter, getContentsByCategory]);
  
  // Manipuladores de eventos
  const handleViewContent = (content: ContentItem) => {
    setSelectedContent(content);
  };
  
  const handleAddContent = () => {
    setIsAddingContent(true);
    setSelectedContent(null);
  };
  
  const handleEditContent = (content: ContentItem) => {
    setSelectedContent(content);
    setIsEditingContent(true);
  };
  
  const handleAddToContent = (content: ContentItem) => {
    setSelectedContent(content);
    setIsAddingToArticle(true);
  };
  
  const handleDeleteContent = (content: ContentItem) => {
    setSelectedContent(content);
    setIsConfirmingDelete(true);
  };
  
  const confirmDelete = async () => {
    if (!selectedContent) return;
    
    try {
      const result = await deleteContentSafely(selectedContent.id);
      
      if (result.success) {
        fetchContents();
        setIsConfirmingDelete(false);
        setSelectedContent(null);
      } else {
        console.error('Erro ao excluir:', result.message);
      }
    } catch (error) {
      console.error('Erro ao excluir conteúdo:', error);
    }
  };
  
  const handleSubmitContent = async (formData: FormData) => {
    try {
      await submitContentToApi(formData, isEditingContent ? selectedContent?.id : undefined);
      fetchContents();
      setIsAddingContent(false);
      setIsEditingContent(false);
      setSelectedContent(null);
    } catch (error) {
      console.error('Erro ao salvar conteúdo:', error);
    }
  };
  
  const handleSubmitAddition = async (formData: FormData) => {
    if (!selectedContent) return;
    
    try {
      await submitAdditionToApi(selectedContent.id.toString(), formData);
      fetchContents();
      setIsAddingToArticle(false);
      setSelectedContent(null);
    } catch (error) {
      console.error('Erro ao adicionar conteúdo:', error);
    }
  };
  
 const submitContentToApi = async (formData: FormData, id?: string | number) => {
  if (id) {
    // Convert FormData to plain object for updateContent
    const updateData: Record<string, any> = {};
    formData.forEach((value, key) => {
      updateData[key] = value;
    });
    return await contentService.updateContent(id.toString(), updateData);
  } else {
    // Convert FormData to CreateContentData for createContent
    const createData: any = {};
    formData.forEach((value, key) => {
      createData[key] = value;
    });
    // Ensure required fields are present and types are correct
    const createContentData = {
  title: createData.title as string,
  type: createData.type as import('../../types/content.types').ContentType,
  sector: createData.sector as import('../../types/common.types').SectorType,
  description: createData.description as string | undefined,
  textContent: createData.textContent as string | undefined,
  // Adicionar categoria se existir
  category: createData.category as import('../../types/content.types').ContentCategory | undefined
};
    return await contentService.createContent(createContentData);
  }
};
  
  const submitAdditionToApi = async (contentId: string, formData: FormData) => {
    // Simulação de código para enviar a adição para a API
    return await fetch(`/api/content/${contentId}/additions`, {
      method: 'POST',
      body: formData
    });
  };
  
  // Obter conteúdos por categorias
  const tutorialContents = getContentsByCategory('tutorials').slice(0, 3);
  const procedureContents = getContentsByCategory('procedures').slice(0, 4);
  
  // Cores para tutoriais e procedimentos
  const tutorialColors = ['bg-blue-600', 'bg-purple-600', 'bg-green-600', 'bg-orange-500'];
  const procedureColors = [
    { bg: 'bg-blue-100', text: 'text-blue-800' },
    { bg: 'bg-green-100', text: 'text-green-800' },
    { bg: 'bg-indigo-100', text: 'text-indigo-800' },
    { bg: 'bg-amber-100', text: 'text-amber-800' }
  ];
  
  return (
    <ResponsiveLayout title={`Central de ${currentSector}`} currentSector={currentSector as SectorType}>
      <div className="p-6">
        {/* Barra de pesquisa e filtros */}
        <div className="mb-8">
          <SearchBar
            placeholder="Buscar artigos, tutoriais, procedimentos..."
            value={searchTerm}
            onChange={setSearchTerm}
            className="mb-4"
          />
          
          <FilterButtons
            title="Filtrar por tipo"
            options={filterOptions}
            selectedId={selectedFilter}
            onChange={setSelectedFilter}
          />
        </div>
        
        {/* Mensagem de erro */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {/* Conteúdo principal */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-red-600 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            {/* Tutoriais Populares */}
            {tutorialContents.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Tutoriais Populares</h2>
                  {canEditContent() && (
                    <button
                      onClick={handleAddContent}
                      className="text-red-600 hover:text-red-700 font-medium flex items-center"
                    >
                      <Plus size={18} className="mr-1" />
                      Adicionar
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tutorialContents.map((tutorial: ContentItem, index: number) => (
                    <div key={tutorial.id} className="bg-white rounded-lg shadow overflow-hidden">
                      <div className={`${tutorialColors[index % tutorialColors.length]} p-4 text-white`}>
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-800 font-bold">
                            {index + 1}
                          </div>
                          <h3 className="ml-3 font-bold">{tutorial.title}</h3>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{tutorial.description || ""}</p>
                        <div className="flex justify-between items-center">
                          <button 
                            onClick={() => handleViewContent(tutorial)}
                            className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                          >
                            Ver Tutorial
                          </button>
                          <span className="text-xs text-gray-500">
                            Atualizado em {new Date(tutorial.updatedAt || tutorial.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Procedimentos Operacionais */}
            {procedureContents.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Procedimentos Operacionais</h2>
                  {canEditContent() && (
                    <button
                      onClick={handleAddContent}
                      className="text-red-600 hover:text-red-700 font-medium flex items-center"
                    >
                      <Plus size={18} className="mr-1" />
                      Adicionar
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {procedureContents.map((procedure: ContentItem, index: number) => {
                    const color = procedureColors[index % procedureColors.length];
                    const stepsCount = procedure.complexity || Math.max(3, Math.ceil((procedure.textContent?.length || 0) / 50));
                    
                    return (
                      <div key={procedure.id} className="bg-white rounded-lg shadow overflow-hidden">
                        <div className={`${color.bg} p-2`}>
                          <h3 className={`font-medium text-sm ${color.text}`}>{procedure.title}</h3>
                        </div>
                        <div className="p-3">
                          <p className="text-gray-500 text-xs mb-2">{stepsCount} passos numerados</p>
                          <div className="flex justify-end">
                            <button 
                              onClick={() => handleViewContent(procedure)}
                              className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200"
                            >
                              Abrir
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Mensagem de conteúdo não encontrado */}
            {getFilteredContents().length === 0 && (
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <div className="flex flex-col items-center">
                  <Search size={48} className="text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum conteúdo encontrado</h3>
                  <p className="text-gray-500 mb-4">
                    Tente ajustar seus filtros ou termos de busca.
                  </p>
                  {canEditContent() && (
                    <button
                      onClick={handleAddContent}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                    >
                      <Plus size={18} className="mr-2" />
                      Adicionar Novo Conteúdo
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Modais e Diálogos */}
      {selectedContent && !isEditingContent && !isAddingToArticle && (
        <ContentViewer
          content={selectedContent}
          onClose={() => setSelectedContent(null)}
          onEdit={canEditContent(selectedContent.sector) ? handleEditContent : undefined}
          onDelete={canEditContent(selectedContent.sector) ? handleDeleteContent : undefined}
          onAddContent={canEditContent(selectedContent.sector) ? handleAddToContent : undefined}
          isAdmin={isAdmin}
          isSuperAdmin={isSuperAdmin}
        />
      )}
      
      {(isAddingContent || isEditingContent) && (
        <ContentForm
          initialData={isEditingContent && selectedContent ? selectedContent : undefined}
          userSector={currentSector as SectorType}
          isSuperAdmin={isSuperAdmin}
          onSubmit={handleSubmitContent}
          onCancel={() => {
            setIsAddingContent(false);
            setIsEditingContent(false);
            setSelectedContent(null);
          }}
        />
      )}
      
      {isAddingToArticle && selectedContent && (
        <ContentAdditionForm
          article={selectedContent}
          onClose={() => {
            setIsAddingToArticle(false);
            setSelectedContent(null);
          }}
          onSubmit={handleSubmitAddition}
        />
      )}
      
      {isConfirmingDelete && selectedContent && (
        <ConfirmDialog
          title="Confirmar Exclusão"
          message={`Tem certeza que deseja excluir "${selectedContent.title}"? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          cancelLabel="Cancelar"
          isOpen={isConfirmingDelete}
          onConfirm={confirmDelete}
          onCancel={() => {
            setIsConfirmingDelete(false);
            setSelectedContent(null);
          }}
          variant="danger"
        />
      )}
    </ResponsiveLayout>
  );
};

export default SectorView;