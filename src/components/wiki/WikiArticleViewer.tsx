import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, Plus, ChevronLeft, ChevronRight, Edit, Trash2, Clock } from 'lucide-react';
import type { ContentItem } from '../../types/content.types';

// Interface para representar adições de conteúdo
interface ContentAddition {
  id: string;
  title?: string;
  content: string;
  filePath?: string;
  createdAt: string;
  createdByName?: string;
}

// Interface para componente principal
interface WikiArticleViewerProps {
  article: ContentItem;
  onClose: () => void;
  onBackToList: () => void;
  onEdit?: (article: ContentItem) => void;
  onDelete?: (article: ContentItem) => void;
  onAddContent?: (article: ContentItem) => void;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const WikiArticleViewer: React.FC<WikiArticleViewerProps> = ({
  article,
  onClose,
  onBackToList,
  onEdit,
  onDelete,
  onAddContent,
  isAdmin,
  isSuperAdmin
}) => {
  const [originalContent, setOriginalContent] = useState<string>('');
  const [additionalContent, setAdditionalContent] = useState<ContentAddition[]>([]);
  
  // Extrair conteúdo original e adições ao montar o componente
  useEffect(() => {
    if (article) {
      setOriginalContent(article.textContent || '');
      
      // Tentar parsear as adições de conteúdo
      if (article.steps && typeof article.steps === 'string') {
        try {
          const stepsData = JSON.parse(article.steps);
          if (stepsData && stepsData.additions && Array.isArray(stepsData.additions)) {
            setAdditionalContent(stepsData.additions);
          }
        } catch (error) {
          console.error('Erro ao processar adições de conteúdo:', error);
        }
      }
    }
  }, [article]);
  
  // Formatação de data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };
  
  // Verificar tempo de leitura aproximado
  const calculateReadingTime = (text: string) => {
    const wordsPerMinute = 200;
    const wordCount = text.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  };
  
  // Verifica se uma adição é recente (menos de 7 dias)
  const isRecentAddition = (dateString: string) => {
    if (!dateString) return false;
    
    const additionDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - additionDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 7;
  };
  
  // Renderização de conteúdo
  const renderContent = (content: string) => {
    if (!content) return null;
    
    // Verificar se o conteúdo já tem estrutura numerada (1., 1.1., etc.)
    const hasNumbering = /^\d+\.\s/m.test(content);
    
    if (hasNumbering) {
      // Se já tem estrutura, formatar como está
      return content.split('\n').map((line, index) => {
        // Detectar linha de seção principal (ex: "1. Título")
        if (/^\d+\.\s/.test(line)) {
          const [num, ...titleParts] = line.split(/\.\s/);
          const title = titleParts.join('. ');
          return (
            <div key={index} className="mb-4">
              <div className="flex items-baseline">
                <span className="font-bold mr-2 text-gray-800">{num}.</span>
                <h3 className="font-bold text-xl text-gray-800">{title}</h3>
              </div>
            </div>
          );
        }
        // Detectar linha de subseção (ex: "1.1. Subtítulo")
        else if (/^\d+\.\d+\.\s/.test(line)) {
          const [num, ...titleParts] = line.split(/\.\s/);
          const title = titleParts.join('. ');
          return (
            <div key={index} className="mb-3 ml-6">
              <div className="flex items-baseline">
                <span className="font-medium mr-2 text-gray-600">{num}.</span>
                <h4 className="font-medium text-lg text-gray-600">{title}</h4>
              </div>
            </div>
          );
        }
        // Conteúdo normal
        else {
          return (
            <p key={index} className="ml-8 text-gray-700 mb-2">
              {line}
            </p>
          );
        }
      });
    } else {
      // Se não tem estrutura, exibir como parágrafos simples
      return content.split('\n\n').map((paragraph, index) => (
        <p key={index} className="mb-3 text-gray-700">
          {paragraph}
        </p>
      ));
    }
  };
  
  // Renderizador para uma adição de conteúdo
  const renderAddition = (addition: ContentAddition, index: number) => {
    const isRecent = isRecentAddition(addition.createdAt);
    
    return (
      <div key={addition.id || index} className="bg-green-50 p-6 rounded-md border-l-4 border-green-500 relative mb-6">
        {isRecent && (
          <span className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            NOVO
          </span>
        )}
        
        {addition.title && (
          <h3 className="text-lg font-bold text-green-800 mb-4">{addition.title}</h3>
        )}
        
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: addition.content }} />
        
        {addition.filePath && (
          <div className="mt-4">
            <img
              src={`/api/uploads/${addition.filePath}`}
              alt={addition.title || `Imagem adicionada`}
              className="max-w-full h-auto rounded-md border border-gray-200"
            />
          </div>
        )}
        
        <div className="mt-4 text-sm text-green-700 flex items-center">
          <Clock size={14} className="mr-1" />
          <span>
            Adicionado em {formatDate(addition.createdAt)}
            {addition.createdByName && ` por ${addition.createdByName}`}
          </span>
        </div>
      </div>
    );
  };
  
  // Verificar permissões
  const canManageContent = isAdmin || isSuperAdmin;
  
  // Renderização principal do componente
  return (
    <div 
      className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6 pb-4 border-b">
            <div>
              <h1 className="text-xl font-bold text-indigo-700">EDIÇÃO DE ARTIGO</h1>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Fechar"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coluna da esquerda: Artigo Original */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h2 className="text-xl font-bold mb-4">Artigo Original</h2>
              
              <div className="text-sm breadcrumbs mb-4">
                <button onClick={onBackToList} className="text-blue-600 hover:underline">Página inicial</button> &gt; <span>{article.sector}</span> &gt; <span>{article.title}</span>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-1">{article.title}</h3>
              
              <div className="text-sm text-gray-500 mb-6">
                {calculateReadingTime(originalContent)} minuto(s) de leitura
              </div>
              
              <div className="prose max-w-none mb-6">
                {renderContent(originalContent)}
              </div>
              
              {article.filePath && (
                <div className="mt-4 mb-6">
                  <div className="bg-gray-100 p-4 rounded-lg text-center">
                    <p className="text-gray-500 mb-2">Imagem da tela do {article.title.split(' ')[0]}</p>
                    <img
                      src={`/api/uploads/${article.filePath}`}
                      alt={article.title}
                      className="max-w-full h-auto rounded-md mx-auto"
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Coluna da direita: Artigo com Adições */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h2 className="text-xl font-bold mb-4">Artigo Após Edição</h2>
              
              <div className="text-sm breadcrumbs mb-4">
                <button onClick={onBackToList} className="text-blue-600 hover:underline">Página inicial</button> &gt; <span>{article.sector}</span> &gt; <span>{article.title}</span>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-1">{article.title}</h3>
              
              <div className="text-sm text-gray-500 mb-4">
                {calculateReadingTime(originalContent + additionalContent.map(a => a.content).join(' '))} minuto(s) de leitura
              </div>
              
              <div className="bg-pink-100 p-4 rounded-lg mb-6">
                <div className="text-center font-bold text-pink-700">CONTEÚDO ORIGINAL PRESERVADO</div>
              </div>
              
              <div className="prose max-w-none mb-6">
                {renderContent(originalContent)}
              </div>
              
              {article.filePath && (
                <div className="mt-4 mb-6">
                  <div className="bg-gray-100 p-4 rounded-lg text-center">
                    <p className="text-gray-500 mb-2">Imagem da tela do {article.title.split(' ')[0]}</p>
                    <img
                      src={`/api/uploads/${article.filePath}`}
                      alt={article.title}
                      className="max-w-full h-auto rounded-md mx-auto"
                    />
                  </div>
                </div>
              )}
              
              {/* Separador para adições */}
              {additionalContent.length > 0 && (
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-dashed border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 bg-white text-sm text-gray-500">NOVO CONTEÚDO ADICIONADO ABAIXO</span>
                  </div>
                </div>
              )}
              
              {/* Adições de conteúdo */}
              <div>
                {additionalContent.map((addition, index) => renderAddition(addition, index))}
              </div>
            </div>
          </div>
          
          {/* Botões de ação */}
          <div className="mt-6 pt-4 border-t flex justify-between items-center">
            <div className="flex space-x-2">
              <button 
                onClick={onBackToList}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded flex items-center"
              >
                <ArrowLeft size={16} className="mr-1" />
                Voltar para Lista
              </button>
              
              {/* Botões de navegação entre artigos */}
              <button 
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded flex items-center"
              >
                <ChevronLeft size={16} className="mr-1" />
                Anterior
              </button>
              <button 
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded flex items-center"
              >
                Próximo
                <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
            
            {/* Botões de ação para admin */}
            {canManageContent && (
              <div className="flex space-x-2">
                {onAddContent && (
                  <button
                    onClick={() => onAddContent(article)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                  >
                    <Plus size={16} className="mr-1" />
                    Adicionar Conteúdo
                  </button>
                )}
                
                {onEdit && (
                  <button
                    onClick={() => onEdit(article)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                  >
                    <Edit size={16} className="mr-1" />
                    Editar Artigo
                  </button>
                )}
                
                {onDelete && (isSuperAdmin || isAdmin) && (
                  <button
                    onClick={() => onDelete(article)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                  >
                    <Trash2 size={16} className="mr-1" />
                    Excluir
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WikiArticleViewer;