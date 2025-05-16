import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  User,
  Eye,
  Plus
} from 'lucide-react';
import type { ContentItem } from '../../types/content.types';
import api from '../../services/api';

// Interface para props do componente
interface WikiArticleListProps {
  categoryId: string;
  sectorId: string;
  onArticleClick: (article: ContentItem) => void;
  onBackClick: () => void;
  onAddContent?: () => void;
  canEdit: boolean;
}

// Componente principal para lista de artigos
const WikiArticleList: React.FC<WikiArticleListProps> = ({
  categoryId,
  sectorId,
  onArticleClick,
  onBackClick,
  onAddContent,
  canEdit
}) => {
  const [articles, setArticles] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Função para carregar artigos
  const loadArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Aqui usaríamos uma rota específica para buscar artigos por categoria e setor
      // Como isso pode não existir ainda, vamos adaptar para usar as rotas existentes
      const response = await api.get(`/content/sector/${sectorId}`);
      
      // Filtrar conteúdo para a categoria especificada
      const filteredArticles = response.data.filter((content: ContentItem) => {
        // Verificar se o conteúdo pertence à categoria
        // Isso dependeria de como você está identificando categorias
        const title = content.title.toLowerCase();
        const description = (content.description || '').toLowerCase();
        
        // Se o conteúdo tem categoria explícita
        if (content.category && content.category.toLowerCase() === categoryId) {
          return true;
        }
        
        // Tentar detectar por palavras-chave no título ou descrição
        const keywords = categoryId.split('-');
        return keywords.some(keyword => 
          title.includes(keyword) || description.includes(keyword)
        );
      });
      
      setArticles(filteredArticles);
    } catch (err) {
      console.error('Erro ao carregar artigos:', err);
      setError('Não foi possível carregar os artigos. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [categoryId, sectorId]);
  
  // Carregar artigos ao montar o componente
  useEffect(() => {
    loadArticles();
  }, [loadArticles]);
  
  // Formatação de data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };
  
  // Formatar título da categoria para exibição
  const formatCategoryTitle = () => {
    return categoryId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        2. LISTAGEM DE ARTIGOS DA CATEGORIA {formatCategoryTitle().toUpperCase()}
      </h1>
      
      {/* Botão de voltar */}
      <button
        onClick={onBackClick}
        className="mb-6 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center"
      >
        <ArrowLeft size={18} className="mr-2" />
        Voltar para Categorias
      </button>
      
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
          {/* Lista de artigos */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm breadcrumbs mb-4">
              <span>Página inicial</span> &gt; <span>Docs</span> &gt; <span>{formatCategoryTitle()}</span>
            </div>
            
            <h2 className="text-xl font-bold mb-2">{formatCategoryTitle().toUpperCase()}</h2>
            <p className="text-sm text-gray-600 mb-6">
              Manuais, métodos e acesso ao {formatCategoryTitle()} (suporte a técnico de campo)
            </p>
            
            {articles.length > 0 ? (
              <div className="space-y-2">
                {articles.map((article) => (
                  <div 
                    key={article.id}
                    onClick={() => onArticleClick(article)}
                    className="p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                  >
                    <div>
                      <h3 className="text-blue-600 font-medium hover:underline">{article.title}</h3>
                      
                      <div className="flex text-xs text-gray-500 mt-1 space-x-4">
                        <span className="flex items-center">
                          <Clock size={12} className="mr-1" />
                          {formatDate(article.updatedAt || article.createdAt)}
                        </span>
                        
                        {article.creator && (
                          <span className="flex items-center">
                            <User size={12} className="mr-1" />
                            {article.creator.name}
                          </span>
                        )}
                        
                        {article.views && (
                          <span className="flex items-center">
                            <Eye size={12} className="mr-1" />
                            {article.views} visualizações
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhum artigo encontrado nesta categoria.</p>
              </div>
            )}
            
            {/* Botão para adicionar conteúdo (apenas para admin) */}
            {canEdit && (
              <div className="mt-6">
                <button
                  onClick={onAddContent}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                >
                  <Plus size={18} className="mr-2" />
                  Adicionar Artigo
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default WikiArticleList;