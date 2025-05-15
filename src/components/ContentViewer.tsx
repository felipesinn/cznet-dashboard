import React, { useState } from 'react';
import { X, Clock, User, Eye, ChevronLeft, ChevronRight, Edit, Trash2, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { type ContentItem, ContentCategory } from '../types/content.types';

interface ContentViewerProps {
  content: ContentItem;
  onClose: () => void;
  onEdit?: (content: ContentItem) => void;
  onDelete?: (content: ContentItem) => void;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
}

const ContentViewer: React.FC<ContentViewerProps> = ({ 
  content, 
  onClose, 
  onEdit, 
  onDelete,
  isAdmin = false,
  isSuperAdmin = false 
}) => {
  // Estados para visualização de imagens
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageZoom, setImageZoom] = useState<number>(1);
  const [imageRotation, setImageRotation] = useState<number>(0);

  // Obter autor do documento, se disponível
  const getAuthorName = () => {
    if (content.creator && content.creator.name) {
      return content.creator.name;
    }
    return "Equipe CZNet";
  };

  // Obter número de visualizações, com padrão simulado
  const getViewCount = () => {
    if (content.views) return content.views;
    return Math.floor(Math.random() * 500) + 50;
  };
  
  // Abrir visualização de imagem em tamanho ampliado
  const handleOpenImage = (url: string) => {
    setImagePreview(url);
    setImageZoom(1);
    setImageRotation(0);
  };
  
  // Fechar visualização de imagem
  const handleCloseImage = () => {
    setImagePreview(null);
  };
  
  // Controles de zoom e rotação
  const handleZoomIn = () => {
    setImageZoom(prev => Math.min(prev + 0.2, 3));
  };
  
  const handleZoomOut = () => {
    setImageZoom(prev => Math.max(prev - 0.2, 0.5));
  };
  
  const handleRotateImage = () => {
    setImageRotation(prev => (prev + 90) % 360);
  };
  
  // Função para renderizar conteúdo rico com seções
  const renderRichContent = () => {
    // Se o conteúdo tiver seções marcadas com separadores
    if (content.textContent && content.textContent.includes('\n\n---\n\n')) {
      const sections = content.textContent.split('\n\n---\n\n');
      
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
    }
    
    // Renderização estruturada padrão
    return renderStructuredContent();
  };
  
  // Função para renderizar imagens do conteúdo
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
                  onClick={() => handleOpenImage(`/api/uploads/${typeof image === 'string' ? image : image.path}`)}
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
            onClick={() => handleOpenImage(`/api/uploads/${content.filePath}`)}
          />
        </div>
      );
    }
    
    return null;
  };
  
  // Função para converter texto plano em conteúdo estruturado
  const renderStructuredContent = () => {
    // Na implementação real, você teria um parser adequado ou armazenaria
    // o conteúdo já estruturado no banco de dados
    
    // Aqui estamos simulando uma estrutura baseada no conteúdo
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
      // Esta é uma implementação simples - uma real seria mais robusta
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
      // Se não tem estrutura, criamos uma estrutura simulada baseada no conteúdo
      // Na implementação real, os autores poderiam formatar diretamente
      const paragraphs = text.split('\n\n');
      
      // Tentar criar uma estrutura lógica baseada nos parágrafos
      const sections = [];
      
      if (paragraphs.length <= 1) {
        // Texto muito curto, talvez apenas um parágrafo
        sections.push({
          id: "1",
          title: "Conteúdo",
          content: text
        });
      } else {
        // Mais estruturado, tentar criar seções lógicas
        if (paragraphs.length >= 4) {
          // Suficiente para criar uma estrutura completa
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
          
          // Dividir o conteúdo do meio em subseções
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
          // Estrutura mais simples
          paragraphs.forEach((para, idx) => {
            sections.push({
              id: String(idx + 1),
              title: idx === 0 ? "Introdução" : 
                     idx === paragraphs.length - 1 ? "Conclusão" : `Parte ${idx}`,
              content: para
            });
          });
        }
      }

      // Renderizar as seções estruturadas
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

  // Formatar a data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Obter badge do tipo de conteúdo
  const getTypeBadge = () => {
    let bgColor = 'bg-blue-100 text-blue-800';
    let label = 'Documento';
    
    // Por tipo
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
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor}`}>
        {label}
      </span>
    );
  };

  // Verificar se usuário pode editar/excluir
  const canManageContent = isAdmin || isSuperAdmin;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Cabeçalho */}
          <div className="flex justify-between items-start mb-6 pb-4 border-b">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center mr-3">
                <span className="font-bold">D</span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">{content.title}</h2>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Metadados */}
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            {getTypeBadge()}
            
            <span className="text-sm text-gray-500 flex items-center ml-2">
              <Clock size={14} className="mr-1" />
              Atualizado em {formatDate(content.updatedAt || content.createdAt)}
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
            {renderRichContent()}
          </div>
          
          {/* Botões de edição/exclusão para admin */}
          {canManageContent && (
            <div className="mt-6 bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Ações de Administrador</h3>
              <div className="flex space-x-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(content)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                  >
                    <Edit size={16} className="mr-1" />
                    Editar Conteúdo
                  </button>
                )}
                
                {onDelete && (isSuperAdmin || isAdmin) && (
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
          <div className="mt-6 pt-4 border-t flex items-center justify-between">
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded flex items-center">
                <ChevronLeft size={16} className="mr-1" />
                Anterior
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded flex items-center">
                Próximo
                <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
            
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
      
      {/* Modal para visualização ampliada da imagem */}
      {imagePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col z-[60]">
          <div className="absolute top-4 right-4 flex space-x-2">
            <button
              onClick={handleZoomIn}
              className="p-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
              title="Aumentar zoom"
            >
              <ZoomIn size={20} />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
              title="Diminuir zoom"
            >
              <ZoomOut size={20} />
            </button>
            <button
              onClick={handleRotateImage}
              className="p-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
              title="Rotacionar"
            >
              <RotateCw size={20} />
            </button>
            <button
              onClick={handleCloseImage}
              className="p-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
              title="Fechar"
            >
              <X size={20} />
            </button>
          </div>
          
          <div 
            className="flex-1 flex items-center justify-center p-4"
            onClick={handleCloseImage}
          >
            <img
              src={imagePreview}
              alt="Visualização ampliada"
              className="max-h-full max-w-full object-contain transition-transform duration-200"
              style={{ 
                transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`,
                cursor: 'zoom-out'
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (imageZoom >= 2) {
                  setImageZoom(1);
                } else {
                  handleCloseImage();
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentViewer;