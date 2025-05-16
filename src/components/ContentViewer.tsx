import React, { useState, useCallback, useMemo } from 'react';
import { X, Clock, User, Eye, ChevronLeft, ChevronRight, Edit, Trash2, ZoomIn, ZoomOut, RotateCw, Plus } from 'lucide-react';
import { type ContentItem, ContentCategory } from '../types/content.types';

// Interfaces relacionadas às adições de conteúdo
interface ContentAddition {
  id: string;
  title?: string;
  content: string;
  filePath?: string;
  createdAt: string;
  createdByName?: string;
}

interface StepsData {
  additions?: ContentAddition[];
  [key: string]: unknown;
}

// Props para componente principal
interface ContentViewerProps {
  content: ContentItem;
  onClose: () => void;
  onEdit?: (content: ContentItem) => void;
  onDelete?: (content: ContentItem) => void;
  onAddContent?: (content: ContentItem) => void;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
}

// Hook personalizado para gerenciar visualização de imagens
const useImageViewer = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageZoom, setImageZoom] = useState<number>(1);
  const [imageRotation, setImageRotation] = useState<number>(0);
  
  const openImage = useCallback((url: string) => {
    setImagePreview(url);
    setImageZoom(1);
    setImageRotation(0);
  }, []);
  
  const closeImage = useCallback(() => {
    setImagePreview(null);
  }, []);
  
  const zoomIn = useCallback(() => {
    setImageZoom(prev => Math.min(prev + 0.2, 3));
  }, []);
  
  const zoomOut = useCallback(() => {
    setImageZoom(prev => Math.max(prev - 0.2, 0.5));
  }, []);
  
  const rotate = useCallback(() => {
    setImageRotation(prev => (prev + 90) % 360);
  }, []);
  
  return {
    imagePreview,
    imageZoom,
    imageRotation,
    openImage,
    closeImage,
    zoomIn,
    zoomOut,
    rotate
  };
};

// Componente para o modal de imagens ampliadas
const ImageModal: React.FC<{
  imageUrl: string;
  zoom: number;
  rotation: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRotate: () => void;
  onClose: () => void;
}> = ({ imageUrl, zoom, rotation, onZoomIn, onZoomOut, onRotate, onClose }) => (
  <div 
    className="fixed inset-0 bg-black bg-opacity-90 flex flex-col z-[60]"
    role="dialog"
    aria-modal="true"
    aria-label="Visualização ampliada de imagem"
  >
    <div className="absolute top-4 right-4 flex space-x-2">
      <button
        onClick={onZoomIn}
        className="p-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
        title="Aumentar zoom"
        aria-label="Aumentar zoom"
      >
        <ZoomIn size={20} />
      </button>
      <button
        onClick={onZoomOut}
        className="p-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
        title="Diminuir zoom"
        aria-label="Diminuir zoom"
      >
        <ZoomOut size={20} />
      </button>
      <button
        onClick={onRotate}
        className="p-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
        title="Rotacionar"
        aria-label="Rotacionar imagem"
      >
        <RotateCw size={20} />
      </button>
      <button
        onClick={onClose}
        className="p-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
        title="Fechar"
        aria-label="Fechar visualização"
      >
        <X size={20} />
      </button>
    </div>
    
    <div 
      className="flex-1 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <img
        src={imageUrl}
        alt="Visualização ampliada"
        className="max-h-full max-w-full object-contain transition-transform duration-200"
        style={{ 
          transform: `scale(${zoom}) rotate(${rotation}deg)`,
          cursor: 'zoom-out'
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (zoom >= 2) {
            onZoomOut();
          } else {
            onClose();
          }
        }}
      />
    </div>
  </div>
);

// Componente para exibir uma adição de conteúdo
const ContentAdditionCard: React.FC<{
  addition: ContentAddition;
  onImageClick: (url: string) => void;
  isRecent: boolean;
}> = ({ addition, onImageClick, isRecent }) => (
  <div className="bg-green-50 p-6 rounded-md border-l-4 border-green-500 relative">
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
          className="max-w-full h-auto rounded-md border border-gray-200 cursor-pointer hover:opacity-90"
          onClick={() => onImageClick(`/api/uploads/${addition.filePath}`)}
        />
      </div>
    )}
    
    <div className="mt-4 text-sm text-green-700 flex items-center">
      <Clock size={14} className="mr-1" />
      <span>
        Adicionado em {new Date(addition.createdAt).toLocaleDateString('pt-BR')}
        {addition.createdByName && ` por ${addition.createdByName}`}
      </span>
    </div>
  </div>
);

// Componente de tipo/badge
const ContentTypeBadge: React.FC<{ content: ContentItem }> = ({ content }) => {
  const getBadgeInfo = () => {
    let bgColor = 'bg-blue-100 text-blue-800';
    let label = 'Documento';
    
    if (content.category === ContentCategory.TUTORIAL || 
        content.title.toLowerCase().includes('tutorial') || 
        content.title.toLowerCase().includes('guia')) {
      bgColor = 'bg-blue-100 text-blue-800';
      label = 'Tutorial';
    } else if (content.category === ContentCategory.PROCEDURE || 
               content.title.toLowerCase().includes('procedimento') || 
               content.title.toLowerCase().includes('processo')) {
      bgColor = 'bg-green-100 text-green-800';
      label = 'Procedimento';
    } else if (content.category === ContentCategory.CONFIGURATION || 
               content.title.toLowerCase().includes('configuração') || 
               content.title.toLowerCase().includes('config')) {
      bgColor = 'bg-purple-100 text-purple-800';
      label = 'Configuração';
    }
    
    return { bgColor, label };
  };

  const { bgColor, label } = getBadgeInfo();
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor}`}>
      {label}
    </span>
  );
};

// Componente principal
const ContentViewer: React.FC<ContentViewerProps> = ({ 
  content, 
  onClose, 
  onEdit, 
  onDelete,
  onAddContent,
  isAdmin = false,
  isSuperAdmin = false 
}) => {
  // Hooks personalizados
  const {
    imagePreview,
    imageZoom,
    imageRotation,
    openImage,
    closeImage,
    zoomIn,
    zoomOut,
    rotate
  } = useImageViewer();

  // Utils e formatadores
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };
  
  const getAuthorName = () => {
    if (content.creator && content.creator.name) {
      return content.creator.name;
    }
    return "Equipe CZNet";
  };

  const getViewCount = () => {
    if (content.views) return content.views;
    return Math.floor(Math.random() * 500) + 50;
  };
  
  // Verifica se uma adição é recente (menos de 7 dias)
  const isRecentAddition = useCallback((dateString: string) => {
    if (!dateString) return false;
    
    const additionDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - additionDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 7;
  }, []);
  
  // Processamento das adições de conteúdo
  const contentAdditions = useMemo(() => {
    // Verificar se o conteúdo tem o campo steps
    if (!content.steps || 
        (typeof content.steps === 'string' && content.steps?.trim() === '')) {
      return [];
    }
    
    try {
      let stepsData: StepsData | string | boolean | null = content.steps;
      
      // Se steps for uma string, converter para objeto
      if (typeof stepsData === 'string') {
        stepsData = JSON.parse(stepsData);
      }
      
      // Se tiver o formato esperado com array de adições
      if (stepsData && 
          typeof stepsData === 'object' && 
          'additions' in stepsData && 
          Array.isArray(stepsData.additions)) {
        return stepsData.additions;
      }
      
      return [];
    } catch (error) {
      console.error('Erro ao processar adições de conteúdo:', error);
      return [];
    }
  }, [content.steps]);
  
  // Renderizadores de conteúdo
  const renderImages = () => {
    // Se tivermos múltiplas imagens
    if (content.images && Array.isArray(content.images) && content.images.length > 0) {
      return (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Imagens</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {content.images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={`/api/uploads/${typeof image === 'string' ? image : image.path}`}
                  alt={`Imagem ${index + 1}`}
                  className="w-full h-48 object-cover rounded-md border border-gray-200 cursor-pointer hover:opacity-90"
                  onClick={() => openImage(`/api/uploads/${typeof image === 'string' ? image : image.path}`)}
                />
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    // Exibir a imagem principal, se existir
    if (content.filePath) {
      return (
        <div className="mt-6">
          <img
            src={`/api/uploads/${content.filePath}`}
            alt={content.title}
            className="max-w-full h-auto rounded-md border border-gray-200 cursor-pointer hover:opacity-90"
            onClick={() => openImage(`/api/uploads/${content.filePath}`)}
          />
        </div>
      );
    }
    
    return null;
  };
  
  const renderMainContent = () => {
    // Se temos adições de conteúdo, usar o formato com adições
    if (contentAdditions.length > 0) {
      return renderStepsContent();
    }
    
    // Usar o renderizador de conteúdo rico padrão
    if (content.textContent && content.textContent.includes('\n\n---\n\n')) {
      return renderSectionedContent();
    }
    
    // Renderização estruturada padrão
    return renderStructuredContent();
  };
  
  const renderStepsContent = () => {
    return (
      <div className="space-y-8">
        {/* Conteúdo original */}
        <div className="bg-white rounded-md">
          <div className="prose max-w-none">
            {content.textContent && (
              <div dangerouslySetInnerHTML={{ __html: content.textContent }} />
            )}
          </div>
        </div>
        
        {/* Separador para adições */}
        {contentAdditions.length > 0 && (
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-sm text-gray-500">Conteúdo Adicionado</span>
            </div>
          </div>
        )}
        
        {/* Adições de conteúdo */}
        <div className="space-y-6">
          {contentAdditions.map((addition, index) => (
            <ContentAdditionCard
              key={addition.id || index}
              addition={addition}
              onImageClick={openImage}
              isRecent={isRecentAddition(addition.createdAt)}
            />
          ))}
        </div>
      </div>
    );
  };
  
  const renderSectionedContent = () => {
    const sections = content.textContent!.split('\n\n---\n\n');
    
    return (
      <div className="space-y-6">
        {sections.map((section, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-md">
            <div className="prose max-w-none">
              {section.split('\n').map((line, lineIndex) => (
                <p key={lineIndex}>{line}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  const renderStructuredContent = () => {
    const text = content.textContent || '';
    if (!text) {
      return (
        <div className="text-center py-12 text-gray-500">
          <p>Conteúdo não disponível</p>
        </div>
      );
    }
    
    // Detectar se já há alguma estrutura no texto
    const hasStructure = /^\d+\.(\d+\.?)?\s/m.test(text);
    
    if (hasStructure) {
      // Se já tem estrutura, formatamos melhor
      const lines = text.split('\n');
      return (
        <div className="space-y-4">
          {lines.map((line, index) => {
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
                <p key={index} className="ml-8 text-gray-700">
                  {line}
                </p>
              );
            }
          })}
        </div>
      );
    } else {
      // Se não tem estrutura, criamos uma estrutura lógica
      const paragraphs = text.split('\n\n');
      const sections = [];
      
      if (paragraphs.length <= 1) {
        sections.push({
          id: "1",
          title: "Conteúdo",
          content: text
        });
      } else if (paragraphs.length >= 4) {
        // Estrutura completa
        sections.push({
          id: "1",
          title: "Introdução",
          content: paragraphs[0]
        });
        
        sections.push({
          id: "2",
          title: "Procedimento",
          content: ""
        });
        
        // Subseções do meio
        const middleParagraphs = paragraphs.slice(1, paragraphs.length - 1);
        middleParagraphs.forEach((para, idx) => {
          sections.push({
            id: `2.${idx + 1}`,
            title: `Etapa ${idx + 1}`,
            content: para
          });
        });
        
        sections.push({
          id: "3",
          title: "Conclusão",
          content: paragraphs[paragraphs.length - 1]
        });
      } else {
        // Estrutura simples
        paragraphs.forEach((para, idx) => {
          sections.push({
            id: String(idx + 1),
            title: idx === 0 ? "Introdução" : 
                   idx === paragraphs.length - 1 ? "Conclusão" : `Parte ${idx}`,
            content: para
          });
        });
      }

      return (
        <div className="space-y-4">
          {sections.map(section => (
            <div key={section.id} className="mb-4">
              <div className="flex items-start">
                <span className={`font-bold mr-2 ${section.id.includes('.') ? 'text-gray-600' : 'text-gray-800'}`}>
                  {section.id}
                </span>
                <h3 className={`font-semibold ${section.id.includes('.') ? 'text-gray-600 text-md' : 'text-gray-800 text-lg'}`}>
                  {section.title}
                </h3>
              </div>
              {section.content && (
                <div className="ml-6 mt-1 text-gray-700">
                  <p>{section.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }
  };

  // Controle de permissões
  const canManageContent = isAdmin || isSuperAdmin;

  return (
    <div 
      className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="content-title"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Cabeçalho */}
          <div className="flex justify-between items-start mb-6 pb-4 border-b">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center mr-3">
                <span className="font-bold">D</span>
              </div>
              <h2 id="content-title" className="text-2xl font-semibold text-gray-800">{content.title}</h2>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Fechar"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Metadados */}
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            <ContentTypeBadge content={content} />
            
            <span className="text-sm text-gray-500 flex items-center ml-2">
              <Clock size={14} className="mr-1" />
              <time dateTime={content.updatedAt || content.createdAt}>
                Atualizado em {formatDate(content.updatedAt || content.createdAt)}
              </time>
            </span>
            
            <span className="text-sm text-gray-500 flex items-center ml-2">
              <User size={14} className="mr-1" />
              Autor: {getAuthorName()}
            </span>
            
            <span className="text-sm text-gray-500 flex items-center ml-2">
              <Eye size={14} className="mr-1" />
              Visualizações: {getViewCount()}
            </span>
          </div>
          
          {/* Descrição */}
          {content.description && (
            <div className="mb-6 bg-gray-50 p-4 border-l-4 border-red-500 rounded">
              <p className="text-gray-700">{content.description}</p>
            </div>
          )}
          
          {/* Imagens */}
          {renderImages()}
          
          {/* Conteúdo estruturado */}
          <div className="bg-white rounded-lg mt-6">
            {renderMainContent()}
          </div>
          
          {/* Botões de ação para admin */}
          {canManageContent && (
            <div className="mt-6 bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Ações de Administrador</h3>
              <div className="flex flex-wrap gap-2">
                {/* Botão Adicionar Conteúdo - Novo! */}
                {onAddContent && (
                  <button
                    onClick={() => onAddContent(content)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                    aria-label="Adicionar conteúdo"
                  >
                    <Plus size={16} className="mr-1" />
                    Adicionar Conteúdo
                  </button>
                )}
                
                {onEdit && (
                  <button
                    onClick={() => onEdit(content)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                    aria-label="Editar conteúdo"
                  >
                    <Edit size={16} className="mr-1" />
                    Editar Conteúdo
                  </button>
                )}
                
                {onDelete && (isSuperAdmin || isAdmin) && (
                  <button
                    onClick={() => onDelete(content)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                    aria-label="Excluir conteúdo"
                  >
                    <Trash2 size={16} className="mr-1" />
                    Excluir
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Rodapé */}
          <div className="mt-6 pt-4 border-t flex items-center justify-between">
            <div className="flex space-x-2">
              <button 
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded flex items-center"
                aria-label="Conteúdo anterior"
              >
                <ChevronLeft size={16} className="mr-1" />
                Anterior
              </button>
              <button 
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded flex items-center"
                aria-label="Próximo conteúdo"
              >
                Próximo
                <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
            
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              aria-label="Fechar visualização"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
      
      {/* Modal para visualização ampliada da imagem */}
      {imagePreview && (
        <ImageModal
          imageUrl={imagePreview}
          zoom={imageZoom}
          rotation={imageRotation}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onRotate={rotate}
          onClose={closeImage}
        />
      )}
    </div>
  );
};

export default ContentViewer;