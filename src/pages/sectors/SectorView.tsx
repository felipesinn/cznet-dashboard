// src/pages/sectors/SectorView.tsx
import React, { useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Filter, AlertTriangle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import ResponsiveLayout from "../../components/layout/ResponsiveLayout";
import ContentViewer from "../../components/ContentViewer";
import ContentForm from "../../components/ContentForm";
import { type ContentItem, ContentType } from "../../types/content.types";
import type { SectorType } from "../../types/common.types";
import { useContent } from "../../hooks/useContent";
import { usePermissions } from "../../hooks/usePermissions";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import SearchBar from "../../components/ui/SearchBar";
import FilterButtons from "../../components/ui/FilterButtons";
import Spinner from "../../components/ui/Spinner";
import TutorialSection from "../../components/sections/TutorialSection";
import ProcedureSection from "../../components/sections/ProcedureSection";
import ToolsSection from "../../components/sections/ToolsSection";
import { contentService } from "../../services/content.service";


import { triggerReload, removeElementById } from '../../utils/ui.utils';


export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "default" | "danger";
  error?: string | null; // Added error prop
  isLoading?: boolean; // Added isLoading prop
}

const SectorView: React.FC = () => {
  const { sector } = useParams<{ sector: string }>();
  const { user } = useAuth().authState;
  const { isSuperAdmin, isAdmin, canEditContent } = usePermissions();
  
  // Estados
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeTab, setActiveTab] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [contentFilter, setContentFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [viewingContent, setViewingContent] = useState<ContentItem | null>(null);
  const [contentToDelete, setContentToDelete] = useState<ContentItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState<"success" | "error">("success");
  
  // Obter o setor atual
  const currentSector = sector || user?.sector || "suporte";
  
  // Carregar conteúdo
  const { contents, loading, error, refresh } = useContent(
    currentSector as SectorType,
    activeTab !== 'all' ? activeTab : undefined
  );

  // Verificar permissões
  const canEdit = canEditContent(currentSector as SectorType);
  
  // Função para mostrar notificações
  const showNotificationMessage = useCallback((message: string, type: "success" | "error" = "success") => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    
    // Auto-esconder após 3 segundos
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  }, []);
  
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

  // Iniciar o processo de exclusão
  const initiateDelete = (content: ContentItem) => {
    console.log("Iniciando exclusão do conteúdo:", content);
    setContentToDelete(content);
    setShowDeleteConfirm(true);
    setDeleteError(null);
  };

  // src/pages/sectors/SectorView.tsx

// Importe os utilitários

// Modificação na função confirmDelete
const confirmDelete = async () => {
  if (!contentToDelete) return;
  
  setIsDeleting(true);
  setDeleteError(null);
  
  try {
    console.log("Iniciando exclusão do conteúdo ID:", contentToDelete.id);
    
    // 1. Primeiramente, tente remover via DOM para feedback visual imediato
    removeElementById(contentToDelete.id);
    
    // 2. Chama o serviço para excluir no backend
    const success = await contentService.deleteContent(contentToDelete.id);
    
    if (success) {
      // 3. Atualiza estado local imediatamente
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getFilteredContent((prev: any[]) => 
        prev.filter(item => String(item.id) !== String(contentToDelete.id))
      );
      
      // 4. Fecha os modais
      setShowDeleteConfirm(false);
      setContentToDelete(null);
      
      // 5. Se o conteúdo estiver sendo visualizado, fecha o visualizador
      if (viewingContent && String(viewingContent.id) === String(contentToDelete.id)) {
        setViewingContent(null);
      }
      
      // 6. Força refresh da lista
      refresh();
      
      showNotificationMessage("Conteúdo excluído com sucesso!", "success");
    } else {
      setDeleteError("Não foi possível excluir o conteúdo. Tente novamente.");
      
      // Se necessário, use esta solução extrema apenas em último caso
      // triggerReload();
    }
  } catch (error) {
    console.error("Erro ao excluir:", error);
    setDeleteError("Ocorreu um erro ao excluir o conteúdo. Tente novamente.");
    showNotificationMessage("Erro ao excluir conteúdo", "error");
  } finally {
    setIsDeleting(false);
  }
};

  // Submeter formulário
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFormSubmit = async (data: any) => {
    try {
      if (editingContent) {
        await contentService.updateContent(String(editingContent.id), data);
        showNotificationMessage("Conteúdo atualizado com sucesso!");
      } else {
        await contentService.createContent({
          ...data,
          sector: currentSector as SectorType
        });
        showNotificationMessage("Conteúdo criado com sucesso!");
      }
      
      // Fechar formulário e atualizar lista
      setShowForm(false);
      setEditingContent(null);
      refresh();
    } catch (err) {
      console.error("Erro ao salvar conteúdo:", err);
      showNotificationMessage(`Erro ao salvar conteúdo: ${err instanceof Error ? err.message : "Erro desconhecido"}`, "error");
    }
  };

  // Filtrar conteúdo
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getFilteredContent = (p0?: (prev: any[]) => any[]) => {
    let filtered = contents;

    if (typeof p0 === "function") {
      filtered = p0(filtered);
    }

    // Filtrar por pesquisa
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(term) || 
        (item.description || '').toLowerCase().includes(term)
      );
    }

    // Filtrar por tipo de conteúdo
    if (contentFilter !== "all") {
      filtered = filtered.filter((item) => item.type === contentFilter);
    }

    // Filtrar por categoria
    if (categoryFilter !== "all") {
      filtered = filtered.filter((item) => {
        // Se tiver campo category explícito
        if (item.category) {
          return item.category.toString().toLowerCase() === categoryFilter;
        }

        // Inferir do título
        const text = `${item.title} ${item.description || ""}`.toLowerCase();

        switch (categoryFilter) {
          case "tutoriais":
            return text.includes("tutorial") || text.includes("guia") || text.includes("como");
          case "configuracoes":
            return text.includes("config") || text.includes("setup") || text.includes("ajuste");
          case "procedimentos":
            return text.includes("proced") || text.includes("passo") || text.includes("instrução");
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  // Conteúdo filtrado
  const filteredContent = getFilteredContent();
  
  // Identificar tutoriais
  const tutorials = filteredContent
    .filter(item => {
      if (item.type === ContentType.TEXT && !item.category) return true;
      if (item.category === "tutorial") return true;
      return item.title.toLowerCase().includes("tutorial") || 
             item.title.toLowerCase().includes("guia") || 
             item.title.toLowerCase().includes("como");
    })
    .sort((a, b) => {
      if (a.priority && b.priority) return a.priority - b.priority;
      if (a.views && b.views) return b.views - a.views;
      return 0;
    });

  // Identificar procedimentos
  const procedimentos = filteredContent.filter(item => {
    if (item.category === "procedure") return true;
    if (item.complexity) return true;
    return item.title.toLowerCase().includes("procedimento") || 
           item.title.toLowerCase().includes("processo") || 
           item.title.toLowerCase().includes("protocolo");
  });

  // Outros conteúdos
  const otherContent = filteredContent.filter(
    item => !tutorials.includes(item) && !procedimentos.includes(item)
  );

  // Opções para filtros
  const categoryOptions = [
    { id: "all", label: "Todos" },
    { id: "tutoriais", label: "Tutoriais" },
    { id: "configuracoes", label: "Configurações" },
    { id: "procedimentos", label: "Procedimentos" },
  ];

  const contentTypeOptions = [
    { id: "all", label: "Todos" },
    { id: "text", label: "Textos" },
    { id: "title", label: "Títulos" },
    { id: "photo", label: "Fotos" },
    { id: "video", label: "Vídeos" },
  ];

  // Renderizar conteúdo do setor de suporte
  const renderSuporteContent = () => (
    <div className="p-6">
      {/* Notificação flutuante */}
      {showNotification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
          notificationType === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          <div className="flex items-center">
            {notificationType === "success" ? (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <AlertTriangle className="w-5 h-5 mr-2" />
            )}
            <p>{notificationMessage}</p>
          </div>
        </div>
      )}

      {/* Cabeçalho com barra de pesquisa */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Central de Suporte</h1>
        <SearchBar 
          placeholder="Buscar na documentação..."
          value={searchTerm}
          onChange={setSearchTerm}
          className="w-full md:w-1/3"
        />
      </div>

      {/* Filtros */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="mb-2 flex items-center">
          <Filter size={16} className="text-gray-500 mr-2" />
          <h3 className="text-sm font-medium text-gray-700">Filtros</h3>
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterButtons
            title="Categoria"
            options={categoryOptions}
            selectedId={categoryFilter}
            onChange={setCategoryFilter}
          />

          <div className="ml-4">
            <FilterButtons
              title="Tipo de Conteúdo"
              options={contentTypeOptions}
              selectedId={contentFilter}
              onChange={setContentFilter}
            />
          </div>
        </div>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Carregando */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Todo o conteúdo */}
          <TutorialSection
            tutorials={filteredContent}
            title={`Todo Conteúdo (${filteredContent.length})`}
            showAddButton={canEdit}
            onAddContent={handleAddContent}
            onViewContent={handleViewContent}
          />
          
          {/* Tutoriais Populares */}
          {tutorials.length > 0 && (
            <TutorialSection
              tutorials={tutorials}
              title="Tutoriais Populares"
              showAddButton={canEdit}
              onAddContent={handleAddContent}
              onViewContent={handleViewContent}
            />
          )}
          
          {/* Procedimentos Operacionais */}
          {procedimentos.length > 0 && (
            <ProcedureSection
              procedures={procedimentos}
              title="Procedimentos Operacionais"
              showAddButton={canEdit}
              onAddContent={handleAddContent}
              onViewContent={handleViewContent}
            />
          )}
          
          {/* Outros conteúdos */}
          {otherContent.length > 0 && (
            <TutorialSection
              tutorials={otherContent}
              title="Outros Conteúdos"
              showAddButton={canEdit}
              onAddContent={handleAddContent}
              onViewContent={handleViewContent}
            />
          )}
          
          {/* Ferramentas e Recursos */}
          <ToolsSection />
        </>
      )}
    </div>
  );

  return (
    <ResponsiveLayout currentSector={currentSector as SectorType}>
      {/* Conteúdo do setor */}
      {renderSuporteContent()}

      {/* Modal de visualização de conteúdo */}
      {viewingContent && (
        <ContentViewer
          content={viewingContent}
          onClose={() => setViewingContent(null)}
          onEdit={canEdit ? handleEditContent : undefined}
          onDelete={canEdit ? initiateDelete : undefined}
          isAdmin={isAdmin}
          isSuperAdmin={isSuperAdmin}
        />
      )}

      {/* Formulário de conteúdo */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <ContentForm
              initialData={editingContent || undefined}
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

      {/* Diálogo de confirmação de exclusão MELHORADO */}
      {contentToDelete && (
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Confirmar Exclusão"
          message={`Tem certeza que deseja excluir "${contentToDelete.title}"? Esta ação não pode ser desfeita.`}
          confirmLabel={isDeleting ? "Excluindo..." : "Sim, Excluir"}
          cancelLabel="Cancelar"
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setContentToDelete(null);
            setDeleteError(null);
          }}
          variant="danger"
          isLoading={isDeleting}
          error={deleteError}
        />
      )}
    </ResponsiveLayout>
  );
};

export default SectorView;