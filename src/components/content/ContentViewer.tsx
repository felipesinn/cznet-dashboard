import React, { useState, useEffect } from 'react';
import { X, Clock, User, Eye, Edit, Trash2, Plus, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { type ContentItem } from '../../types/content.types';
import { formatDate } from '../../utils/formatters';
import { useImageViewer } from '../../hooks/useImageViewer';
import { Badge } from '../ui/Badge';

// Interface para adições de conteúdo
interface ContentAddition {
  id: string;
  title?: string;
  content: string;
  filePath?: string;
  createdAt: string;
  createdByName?: string;
}

// Interface para props do componente
interface ContentViewerProps {
  content: ContentItem;
  onClose: () => void;
  onEdit?: (content: ContentItem) => void;
  onDelete?: (content: ContentItem) => void;
  onAddContent?: (content: ContentItem) => void;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
}

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
  >
    <div className="absolute top-4 right-4 flex space-x-2">
      <button
        onClick={onZoomIn}
        className="p-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
        title="Aumentar zoom"
      >
        <ZoomIn size={20} />
      </button>
      <button
        onClick={onZoomOut}
        className="p-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
        title="Diminuir zoom"
      >
        <ZoomOut size={20} />
      </button>
      <button
        onClick={onRotate}
        className="p-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
        title="Rotacionar"
      >
        <RotateCw size={20} />
      </button>
      <button
        onClick={onClose}
        className="p-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
        title="Fechar"
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
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  </div>
);

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
  // Estados para armazenar conteúdo original e adições
  const [originalContent, setOriginalContent] = useState<string>('');
  const [additionalContent, setAdditionalContent] = useState<ContentAddition[]>([]);
  
  // Usar hook personalizado para visualização de imagens
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

  // Extrair conteúdo original e adições ao montar o componente
  useEffect(() => {
    if (content) {
      setOriginalContent(content.textContent || '');
      
      // Tentar parsear as adições de conteúdo
      if (content.steps) {
        try {
          let stepsData;
          
          // Converter string para objeto se necessário
          if (typeof content.steps === 'string') {
            stepsData = JSON.parse(content.steps);
          } else {
            stepsData = content.steps;
          }
          
          if (stepsData && stepsData.additions && Array.isArray(stepsData.additions)) {
            setAdditionalContent(stepsData.additions);
          }
        } catch (error) {
          console.error('Erro ao processar adições de conteúdo:', error);
          setAdditionalContent([]);
        }
      }
    }
  }, [content]);
  
  // Verificar se uma adição é recente (menos de 7 dias)
  const isRecentAddition = (dateString: string) => {
    if (!dateString) return false;
    
    const additionDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - additionDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 7;
  };
  
  // Verificar tempo de leitura aproximado
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const calculateReadingTime = (text: string) => {
    const wordsPerMinute = 200;
    const wordCount = text.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  };
  
  // Renderizar o conteúdo estruturado
  const renderStructuredContent = (contentText: string) => {
    if (!contentText) return null;
    
    // Verificar se o conteúdo já tem estrutura numerada (1., 1.1., etc.)
    const hasNumbering = /^\d+\.\s/m.test(contentText);
    
    if (hasNumbering) {
      // Se já tem estrutura, formatar como está
      return contentText.split('\n').map((line, index) => {
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
      return contentText.split('\n\n').map((paragraph, index) => (
        <p key={index} className="mb-3 text-gray-700">
          {paragraph}
        </p>
      ));
    }
  };
  
  // Renderizar uma adição de conteúdo
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
        
        <div className="prose max-w-none">
          {renderStructuredContent(addition.content)}
        </div>
        
        {addition.filePath && (
          <div className="mt-4">
            <img
              src={`/api/uploads/${addition.filePath}`}
              alt={addition.title || 'Imagem adicionada'}
              className="max-w-full h-auto rounded-md border border-gray-200 cursor-pointer"
              onClick={() => openImage(`/api/uploads/${addition.filePath}`)}
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
  
  // Renderizar imagens
  const renderImages = () => {
    // Se tivermos múltiplas imagens
    if (content.images && Array.isArray(content.images) && content.images.length > 0) {
      return (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Imagens</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {content.images.map((image, index) => {
              const imgPath = typeof image === 'string' ? image : image.path || '';
              return (
                <div key={index} className="relative">
                  <img
                    src={`/api/uploads/${imgPath}`}
                    alt={`Imagem ${index + 1}`}
                    className="w-full h-48 object-cover rounded-md border border-gray-200 cursor-pointer hover:opacity-90"
                    onClick={() => openImage(`/api/uploads/${imgPath}`)}
                  />
                </div>
              );
            })}
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
  
  // Verificar permissões
  const canManageContent = isAdmin || isSuperAdmin;

  return (
    <div 
      className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Cabeçalho */}
          <div className="flex justify-between items-start mb-6 pb-4 border-b">
            <div className="pr-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">{content.title}</h2>
              
              <div className="flex flex-wrap gap-2 items-center">
                <Badge 
                  variant={content.category === 'tutorial' ? 'blue' : content.category === 'procedure' ? 'green' : 'gray'}
                  label={content.category || 'Documento'}
                  size="md"
                />
                
                <span className="text-sm text-gray-500 flex items-center">
                  <Clock size={14} className="mr-1" />
                  <time dateTime={content.updatedAt || content.createdAt}>
                    Atualizado em {formatDate(content.updatedAt || content.createdAt)}
                  </time>
                </span>
                
                <span className="text-sm text-gray-500 flex items-center">
                  <User size={14} className="mr-1" />
                  {content.creator?.name || 'Autor desconhecido'}
                </span>
                
                <span className="text-sm text-gray-500 flex items-center">
                  <Eye size={14} className="mr-1" />
                  {content.views || Math.floor(Math.random() * 500)} visualizações
                </span>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Fechar"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Descrição */}
          {content.description && (
            <div className="mb-6 bg-gray-50 p-4 border-l-4 border-blue-500 rounded">
              <p className="text-gray-700">{content.description}</p>
            </div>
          )}
          
          {/* Conteúdo original */}
          <div className="prose max-w-none mb-6">
            {renderStructuredContent(originalContent)}
          </div>
          
          {/* Imagens */}
          {renderImages()}
          
          {/* Separador para adições */}
          {additionalContent.length > 0 && (
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
            {additionalContent.map((addition, index) => renderAddition(addition, index))}
          </div>
          
          {/* Botões de ação para admin */}
          {canManageContent && (
            <div className="mt-6 pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Ações de Administrador</h3>
              <div className="flex flex-wrap gap-2">
                {onAddContent && (
                  <button
                    onClick={() => onAddContent(content)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                  >
                    <Plus size={16} className="mr-1" />
                    Adicionar Conteúdo
                  </button>
                )}
                
                {onEdit && (
                  <button
                    onClick={() => onEdit(content)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                  >
                    <Edit size={16} className="mr-1" />
                    Editar Conteúdo
                  </button>
                )}
                
                {onDelete && (
                  <button
                    onClick={() => onDelete(content)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                  >
                    <Trash2 size={16} className="mr-1" />
                    Excluir
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Rodapé */}
          <div className="mt-6 pt-4 border-t flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
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