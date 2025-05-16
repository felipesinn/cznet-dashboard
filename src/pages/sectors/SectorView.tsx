import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  Layers,
  Plus,
  FileText,
  Type,
  Upload,
  Book,
  Headphones,
  Search,
  Settings,
  Zap,
  Filter,
  Clock,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import ResponsiveLayout from "../../components/layout/ResponsiveLayout";
import ContentCard from "../../components/ContentCard";
import ContentViewer from "../../components/ContentViewer";
import type { ContentItem, SectorType } from "../../types/content.types";
import api from "../../services/api";

// Componente de card para tutoriais populares
const TutorialCard: React.FC<{
  tutorial: ContentItem;
  priority: number;
  onView: (content: ContentItem) => void;
}> = ({ tutorial, priority, onView }) => {
  // Determinar cor de fundo com base no tipo ou categoria
  const getBgGradient = () => {
    switch (priority % 4) {
      case 0:
        return "from-blue-500 to-blue-700";
      case 1:
        return "from-purple-500 to-purple-700";
      case 2:
        return "from-green-500 to-green-700";
      case 3:
        return "from-orange-500 to-orange-700";
      default:
        return "from-red-500 to-red-700";
    }
  };

  // Formatar data de atualização
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div
        className={`bg-gradient-to-r ${getBgGradient()} p-3 text-white flex justify-between items-center`}
      >
        <div className="flex items-center">
          <div className="w-8 h-8 bg-white text-gray-800 rounded-full flex items-center justify-center font-bold mr-2">
            {priority}
          </div>
          <h3 className="font-semibold truncate">{tutorial.title}</h3>
        </div>
      </div>
      <div className="p-4">
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {tutorial.description || "Tutorial de suporte técnico"}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 flex items-center">
            <Clock size={14} className="mr-1" />
            Atualizado em {formatDate(tutorial.updatedAt || tutorial.createdAt)}
          </span>
          <button
            onClick={() => onView(tutorial)}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
          >
            Ver Tutorial
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente de card para procedimentos
const ProcedimentoCard: React.FC<{
  procedimento: ContentItem;
  onView: (content: ContentItem) => void;
}> = ({ procedimento, onView }) => {
  // Determinar cor de cabeçalho com base no tipo
  const getHeaderColor = () => {
    const type = procedimento.type;
    switch (type) {
      case "text":
        return "bg-blue-100 text-blue-800";
      case "title":
        return "bg-green-100 text-green-800";
      case "photo":
        return "bg-purple-100 text-purple-800";
      case "video":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Contar número de passos (simulação)
  const getStepsCount = () => {
    if (procedimento.complexity) return procedimento.complexity;
    const text = procedimento.textContent || "";
    return Math.max(3, Math.min(20, Math.floor(text.length / 50)));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div
        className={`p-3 ${getHeaderColor()} flex justify-between items-center`}
      >
        <h3 className="font-medium text-sm truncate">{procedimento.title}</h3>
      </div>
      <div className="p-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">
            {getStepsCount()} passos numerados
          </span>
          <button
            onClick={() => onView(procedimento)}
            className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition-colors"
          >
            Abrir
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente de confirmação de exclusão
const DeleteConfirmation: React.FC<{
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
}> = ({ onConfirm, onCancel, title }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-md max-w-md w-full p-6">
        <div className="flex items-center mb-4 text-red-600">
          <AlertTriangle size={24} className="mr-2" />
          <h2 className="text-xl font-semibold">Confirmar Exclusão</h2>
        </div>
        
        <p className="mb-6 text-gray-700">
          Tem certeza que deseja excluir <span className="font-medium">"{title}"</span>? 
          Esta ação não pode ser desfeita.
        </p>
        
        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Sim, Excluir
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente do Setor de Suporte
const SuporteSection: React.FC<{
  contents: ContentItem[];
  loading: boolean;
  error: string | null;
  canEdit: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  onAddContent: () => void;
  onEditContent: (content: ContentItem) => void;
  onDeleteContent: (content: ContentItem) => void;
  onViewContent: (content: ContentItem) => void;
}> = ({ 
  contents, 
  loading, 
  error, 
  canEdit, 
  isSuperAdmin,
  isAdmin,
  onAddContent, 
  onEditContent,
  onDeleteContent,
  onViewContent 
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [contentFilter, setContentFilter] = useState<string>("all");
  const [viewingStructured, setViewingStructured] = useState<ContentItem | null>(null);

  // Filtrar conteúdo
  const getFilteredContent = () => {
    let filtered = contents;

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
            return (
              text.includes("tutorial") ||
              text.includes("guia") ||
              text.includes("como")
            );
          case "configuracoes":
            return (
              text.includes("config") ||
              text.includes("setup") ||
              text.includes("ajuste")
            );
          case "procedimentos":
            return (
              text.includes("proced") ||
              text.includes("passo") ||
              text.includes("instrução")
            );
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  // Separar por tipo
  const filteredContent = getFilteredContent();

  // Identificar tutoriais (por categoria ou keywords no título)
  const tutorials = filteredContent
    .filter((item) => {
      // Considerar qualquer conteúdo de texto novo como tutorial
      if (item.type === "text" && !item.category) return true;

      // Restante da lógica...
      if (item.category === "tutorial") return true;
      return (
        item.title.toLowerCase().includes("tutorial") ||
        item.title.toLowerCase().includes("guia") ||
        item.title.toLowerCase().includes("como")
      );
    })
    .sort((a, b) => {
      // Ordenar por prioridade, se disponível, ou por visualizações
      if (a.priority && b.priority) return a.priority - b.priority;
      if (a.views && b.views) return b.views - a.views;
      return 0;
    });

  // Identificar procedimentos (por categoria ou keywords no título)
  const procedimentos = filteredContent.filter((item) => {
    if (item.category === "procedure") return true;
    if (item.complexity) return true; // Se tem complexidade, provavelmente é um procedimento
    return (
      item.title.toLowerCase().includes("procedimento") ||
      item.title.toLowerCase().includes("processo") ||
      item.title.toLowerCase().includes("protocolo")
    );
  });

  // Visualizar conteúdo de forma estruturada
  // Encontrar conteúdos que não são tutoriais nem procedimentos
  const otherContent = filteredContent.filter(
    item => !tutorials.includes(item) && !procedimentos.includes(item)
  );

  return (
    <>
      <div className="p-6">
        {/* Cabeçalho com barra de pesquisa */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Headphones size={24} className="text-red-600 mr-2" />
            Central de Suporte
          </h1>

          <div className="w-full md:w-1/3 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar na documentação..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="mb-2 flex items-center">
            <Filter size={16} className="text-gray-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-700">Filtros</h3>
          </div>

          <div className="flex flex-wrap gap-2">
            <div>
              <h4 className="text-xs text-gray-500 mb-1">Categoria</h4>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setCategoryFilter("all")}
                  className={`px-3 py-1 text-sm rounded-full ${
                    categoryFilter === "all"
                      ? "bg-red-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setCategoryFilter("tutoriais")}
                  className={`px-3 py-1 text-sm rounded-full ${
                    categoryFilter === "tutoriais"
                      ? "bg-red-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Tutoriais
                </button>
                <button
                  onClick={() => setCategoryFilter("configuracoes")}
                  className={`px-3 py-1 text-sm rounded-full ${
                    categoryFilter === "configuracoes"
                      ? "bg-red-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Configurações
                </button>
                <button
                  onClick={() => setCategoryFilter("procedimentos")}
                  className={`px-3 py-1 text-sm rounded-full ${
                    categoryFilter === "procedimentos"
                      ? "bg-red-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Procedimentos
                </button>
              </div>
            </div>

            <div className="ml-4">
              <h4 className="text-xs text-gray-500 mb-1">Tipo de Conteúdo</h4>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setContentFilter("all")}
                  className={`px-3 py-1 text-sm rounded-full ${
                    contentFilter === "all"
                      ? "bg-red-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setContentFilter("text")}
                  className={`px-3 py-1 text-sm rounded-full ${
                    contentFilter === "text"
                      ? "bg-red-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Textos
                </button>
                <button
                  onClick={() => setContentFilter("title")}
                  className={`px-3 py-1 text-sm rounded-full ${
                    contentFilter === "title"
                      ? "bg-red-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Títulos
                </button>
                <button
                  onClick={() => setContentFilter("photo")}
                  className={`px-3 py-1 text-sm rounded-full ${
                    contentFilter === "photo"
                      ? "bg-red-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Fotos
                </button>
                <button
                  onClick={() => setContentFilter("video")}
                  className={`px-3 py-1 text-sm rounded-full ${
                    contentFilter === "video"
                      ? "bg-red-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Vídeos
                </button>
              </div>
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
            <svg
              className="animate-spin h-8 w-8 text-red-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        ) : (
          <>
            {/* Exibição de todas as categorias de conteúdo */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <Book size={20} className="text-red-600 mr-2" />
                  Todo Conteúdo ({filteredContent.length})
                </h2>
                {canEdit && (
                  <button
                    onClick={onAddContent}
                    className="flex items-center text-red-600 hover:text-red-700"
                  >
                    <Plus size={18} className="mr-1" />
                    <span className="text-sm">Adicionar</span>
                  </button>
                )}
              </div>

              {filteredContent.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredContent.map((content, index) => (
                    <TutorialCard
                      key={content.id}
                      tutorial={content}
                      priority={content.priority || index + 1}
                      onView={() => onViewContent(content)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <p className="text-gray-500 mb-4">
                    Nenhum conteúdo encontrado.
                  </p>
                  {canEdit && (
                    <button
                      onClick={onAddContent}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Adicionar Conteúdo
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Seção de Tutoriais Populares */}
            {tutorials.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <Book size={20} className="text-red-600 mr-2" />
                    Tutoriais Populares
                  </h2>

                  {canEdit && (
                    <button
                      onClick={onAddContent}
                      className="flex items-center text-red-600 hover:text-red-700"
                    >
                      <Plus size={18} className="mr-1" />
                      <span className="text-sm">Adicionar</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tutorials.slice(0, 6).map((tutorial, index) => (
                    <TutorialCard
                      key={tutorial.id}
                      tutorial={tutorial}
                      priority={tutorial.priority || index + 1}
                      onView={() => onViewContent(tutorial)}
                    />
                  ))}
                </div>

                {tutorials.length > 6 && (
                  <div className="mt-4 text-right">
                    <button className="text-red-600 hover:text-red-700 flex items-center ml-auto">
                      <span>Ver mais tutoriais</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Seção de Procedimentos Operacionais */}
            {procedimentos.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <FileText size={20} className="text-red-600 mr-2" />
                    Procedimentos Operacionais
                  </h2>

                  {canEdit && (
                    <button
                      onClick={onAddContent}
                      className="flex items-center text-red-600 hover:text-red-700"
                    >
                      <Plus size={18} className="mr-1" />
                      <span className="text-sm">Adicionar</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {procedimentos.slice(0, 8).map((procedimento) => (
                    <ProcedimentoCard
                      key={procedimento.id}
                      procedimento={procedimento}
                      onView={() => onViewContent(procedimento)}
                    />
                  ))}
                </div>

                {procedimentos.length > 8 && (
                  <div className="mt-4 text-right">
                    <button className="text-red-600 hover:text-red-700 flex items-center ml-auto">
                      <span>Ver mais procedimentos</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Outros conteúdos */}
            {otherContent.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <FileText size={20} className="text-red-600 mr-2" />
                    Outros Conteúdos
                  </h2>

                  {canEdit && (
                    <button
                      onClick={onAddContent}
                      className="flex items-center text-red-600 hover:text-red-700"
                    >
                      <Plus size={18} className="mr-1" />
                      <span className="text-sm">Adicionar</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {otherContent.map((content, index) => (
                    <TutorialCard
                      key={content.id}
                      tutorial={content}
                      priority={index + 1}
                      onView={() => onViewContent(content)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Outras ferramentas */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <Settings size={20} className="text-red-600 mr-2" />
                  Ferramentas e Recursos
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-3">
                      <Zap size={20} />
                    </div>
                    <h3 className="font-medium">Diagnóstico Rápido</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Ferramentas para identificação e solução rápida de problemas
                    comuns.
                  </p>
                  <button className="text-blue-600 text-sm hover:text-blue-700 flex items-center">
                    <span>Acessar</span>
                    <ChevronRight size={14} className="ml-1" />
                  </button>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 mr-3">
                      <FileText size={20} />
                    </div>
                    <h3 className="font-medium">Templates de Atendimento</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Modelos de respostas para os tipos de atendimento mais
                    comuns.
                  </p>
                  <button className="text-green-600 text-sm hover:text-green-700 flex items-center">
                    <span>Acessar</span>
                    <ChevronRight size={14} className="ml-1" />
                  </button>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mr-3">
                      <Search size={20} />
                    </div>
                    <h3 className="font-medium">Base de Conhecimento</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Acesse a biblioteca completa de soluções e documentações.
                  </p>
                  <button className="text-purple-600 text-sm hover:text-purple-700 flex items-center">
                    <span>Acessar</span>
                    <ChevronRight size={14} className="ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal para visualização estruturada */}
      {viewingStructured && (
        <ContentViewer
          content={viewingStructured}
          onClose={() => setViewingStructured(null)}
          onEdit={canEdit ? onEditContent : undefined}
          onDelete={canEdit ? onDeleteContent : undefined}
          isAdmin={isAdmin}
          isSuperAdmin={isSuperAdmin}
        />
      )}
    </>
  );
};

// Componente principal que gerencia todos os setores
const SectorView: React.FC = () => {
  const { sector } = useParams<{ sector: string }>();
  const { authState } = useAuth();
  const { user } = authState;

  // Estados
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [viewingContent, setViewingContent] = useState<ContentItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<ContentItem | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Verificar permissões
  const isSuperAdmin = user?.role === "super_admin";
  const isAdmin = isSuperAdmin || (user?.role === "admin" && user?.sector === sector);
  const canEdit = isAdmin;

  // Obter o setor atual
  const currentSector = sector || user?.sector || "suporte";

  // Função para carregar conteúdo
  const loadContent = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let url = "/content";

      // Filtrar por setor
      if (currentSector) {
        url += `/sector/${currentSector}`;
      }

      // Filtrar por tipo se não for 'all'
      if (activeTab !== "all") {
        url = `/content/type/${activeTab}`;
        if (currentSector) {
          url += `?sector=${currentSector}`;
        }
      }

      console.log("Carregando conteúdo de:", url);
      const response = await api.get(url);
      console.log(`Carregados ${response.data.length} itens`);
      setContents(response.data);
    } catch (err) {
      console.error("Erro ao carregar conteúdo:", err);
      setError("Não foi possível carregar o conteúdo. Por favor, tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentSector]);

  // Carregar conteúdo ao montar o componente ou quando as dependências mudarem
  useEffect(() => {
    loadContent();
  }, [loadContent, refreshTrigger]);

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
    setContentToDelete(content);
    setShowDeleteConfirm(true);
  };

  // Confirmar exclusão
  const confirmDelete = async () => {
    if (!contentToDelete) return;
    
    try {
      await api.delete(`/content/${contentToDelete.id}`);
      
      // Atualizar o estado para remover o item excluído
      setContents(prev => prev.filter(content => String(content.id) !== String(contentToDelete.id)));
      
      // Fechar o modal
      setShowDeleteConfirm(false);
      setContentToDelete(null);
      setViewingContent(null);
      
      // Notificar o usuário
      alert("Conteúdo excluído com sucesso!");
    } catch (err) {
      console.error("Erro ao excluir conteúdo:", err);
      alert("Não foi possível excluir o conteúdo.");
    }
  };

  // Formulário de envio
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFormSubmit = async (data: any) => {
    try {
      console.log("Recebido no handleFormSubmit:", data);
      
      // Preparar o FormData
      let formData;
      
      if (data instanceof FormData) {
        formData = data;
      } else {
        formData = new FormData();
        for (const key in data) {
          if (key === "file" && data[key]) {
            formData.append("file", data[key]);
          } else if (data[key] !== undefined && data[key] !== null) {
            formData.append(key, data[key]);
          }
        }
        
        if (!formData.get("sector")) {
          formData.append("sector", currentSector as string);
        }
      }
      
      // Determinar endpoint e método
      const endpoint = editingContent ? `/content/${editingContent.id}` : "/content";
      const method = editingContent ? "put" : "post";
      console.log(`Enviando para: ${api.defaults.baseURL}${endpoint} via ${method}`);
      
      // Fazer a requisição
      const response = await api[method](endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      console.log("Resposta da API (Status):", response.status);
      
      if (response.status === 201 || response.status === 200) {
        // Forçar recarregamento dos dados
        setRefreshTrigger(prev => prev + 1);
        
        // Fechar o formulário
        setShowForm(false);
        setEditingContent(null);
        
        // Notificar o usuário
        alert(editingContent ? "Conteúdo atualizado com sucesso!" : "Conteúdo criado com sucesso!");
      } else {
        throw new Error(`Resposta inesperada: ${response.status}`);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Erro ao salvar conteúdo:", err);
      alert(`Erro ao salvar conteúdo: ${err.response?.data?.message || err.message || "Erro desconhecido"}`);
    }
  };

  // Renderização condicional por setor
  const renderSectorContent = () => {
    // Setor de Suporte usa o novo design
    if (currentSector === "suporte") {
      return (
        <SuporteSection
          contents={contents}
          loading={loading}
          error={error}
          canEdit={canEdit}
          isAdmin={isAdmin}
          isSuperAdmin={isSuperAdmin}
          onAddContent={handleAddContent}
          onEditContent={handleEditContent}
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          onViewContent={handleViewContent} onDeleteContent={function (_content: ContentItem): void {
            throw new Error("Function not implemented.");
          } }        />
      );
    }

    // Outros setores usam o design original
    return (
      <div className="p-6">
        {/* Abas de conteúdo */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-wrap border-b">
            <button
              className={`mr-4 py-2 px-1 font-medium ${
                activeTab === "all"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("all")}
            >
              <div className="flex items-center">
                <Layers size={18} className="mr-1" />
                <span>Todos</span>
              </div>
            </button>
            <button
              className={`mr-4 py-2 px-1 font-medium ${
                activeTab === "photo"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("photo")}
            >
              <div className="flex items-center">
                <Upload size={18} className="mr-1" />
                <span>Fotos</span>
              </div>
            </button>
            <button
              className={`mr-4 py-2 px-1 font-medium ${
                activeTab === "video"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("video")}
            >
              <div className="flex items-center">
                <Upload size={18} className="mr-1" />
                <span>Vídeos</span>
              </div>
            </button>
            <button
              className={`mr-4 py-2 px-1 font-medium ${
                activeTab === "text"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("text")}
            >
              <div className="flex items-center">
                <FileText size={18} className="mr-1" />
                <span>Textos</span>
              </div>
            </button>
            <button
              className={`mr-4 py-2 px-1 font-medium ${
                activeTab === "title"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("title")}
            >
              <div className="flex items-center">
                <Type size={18} className="mr-1" />
                <span>Títulos</span>
              </div>
            </button>
            <button
              className={`mr-4 py-2 px-1 font-medium ${
                activeTab === "tutorial"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("tutorial")}
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
            <svg
              className="animate-spin h-8 w-8 text-red-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        ) : (
          <>
            {/* Lista de conteúdo */}
            {contents.filter(content => activeTab === "all" || content.type === activeTab).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {contents.filter(content => activeTab === "all" || content.type === activeTab).map((content) => (
                  <ContentCard
                        key={content.id}
                        onDelete={canEdit ? (id: string) => initiateDelete(contents.find(content => content.id === id)!) : undefined}
                        onView={handleViewContent}
                        onEdit={canEdit ? handleEditContent : undefined}
                        canEdit={canEdit} content={content}                  />
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
    );
  };

  return (
    <ResponsiveLayout currentSector={currentSector as SectorType}>
      {renderSectorContent()}

      {/* Modal de visualização padrão (para setores não-suporte) */}
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

      {/* Modal de confirmação de exclusão */}
      {showDeleteConfirm && contentToDelete && (
        <DeleteConfirmation
          title={contentToDelete.title}
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setContentToDelete(null);
          }}
        />
      )}
    </ResponsiveLayout>
  );
};

export default SectorView;