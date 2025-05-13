// src/components/ContentCard.tsx
import React from 'react';
import { type ContentItem } from '../types/auth.types';
import { ContentType } from '../types/content.types';
import { contentService } from '../services/content.service';
import { FileText, Upload, Type } from 'lucide-react';

interface ContentCardProps {
  content: ContentItem;
  onView: (content: ContentItem) => void;
  onEdit?: (content: ContentItem) => void;
  onDelete?: (id: string) => void;
  canEdit: boolean;
}

const ContentCard: React.FC<ContentCardProps> = ({
  content,
  onView,
  onEdit,
  onDelete,
  canEdit
}) => {
  // Formatação de data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Função para obter o ícone com base no tipo
  const getTypeIcon = (type: ContentType) => {
    switch (type) {
      case ContentType.PHOTO:
        return <Upload size={40} className="text-purple-400" />;
      case ContentType.VIDEO:
        return <Upload size={40} className="text-green-400" />;
      case ContentType.TEXT:
        return <FileText size={40} className="text-blue-400" />;
      case ContentType.TITLE:
        return <Type size={40} className="text-yellow-400" />;
      default:
        return <FileText size={40} className="text-gray-400" />;
    }
  };

  // Função para obter a cor de fundo com base no tipo
  const getTypeBadgeClasses = (type: ContentType) => {
    switch (type) {
      case ContentType.PHOTO:
        return 'bg-purple-100 text-purple-800';
      case ContentType.VIDEO:
        return 'bg-green-100 text-green-800';
      case ContentType.TEXT:
        return 'bg-blue-100 text-blue-800';
      case ContentType.TITLE:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Função para obter o texto do tipo
  const getTypeText = (type: ContentType) => {
    switch (type) {
      case ContentType.PHOTO:
        return 'Foto';
      case ContentType.VIDEO:
        return 'Vídeo';
      case ContentType.TEXT:
        return 'Texto';
      case ContentType.TITLE:
        return 'Título';
      default:
        return type;
    }
  };

  // Renderizar o thumbnail apropriado com base no tipo
  const renderThumbnail = () => {
    if (content.type === ContentType.PHOTO && content.filePath) {
      // Carregar imagem
      const imageUrl = typeof content.filePath === 'string' ? contentService.getFileUrl(content.filePath) : '';
      return (
        <div className="h-32 bg-gray-100 rounded overflow-hidden">
          <img 
            src={imageUrl} 
            alt={content.title} 
            className="w-full h-full object-cover"
            onError={(e) => {
              // Caso a imagem não carregue, mostrar ícone
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.appendChild(
                document.createTextNode('Erro ao carregar imagem')
              );
            }}
          />
        </div>
      );
    } else if (content.type === ContentType.VIDEO && content.filePath) {
      // Para vídeos, mostrar thumbnail (poderia ser gerado pelo servidor)
      return (
        <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
          <div className="relative">
            {getTypeIcon(content.type as ContentType)}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <div className="w-0 h-0 border-t-4 border-t-transparent border-l-8 border-l-red-600 border-b-4 border-b-transparent ml-1"></div>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      // Para outros tipos, mostrar ícone
      return (
        <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
          {getTypeIcon(content.type as ContentType)}
        </div>
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeClasses(content.type as ContentType)}`}>
            {getTypeText(content.type as ContentType)}
          </span>
          <span className="text-xs text-gray-500">{formatDate(String(content.createdAt))}</span>
        </div>
        <h3 className="mt-2 text-lg font-medium text-gray-900 truncate">{content.title}</h3>
        
        {/* Thumbnail ou Preview */}
        <div className="mt-4">
          {renderThumbnail()}
        </div>
        
        {/* Ações */}
        <div className="mt-4 flex justify-between">
          <button 
            onClick={() => onView(content)}
            className="text-red-600 hover:text-red-700 font-medium text-sm"
          >
            Ver detalhes
          </button>
          
          {canEdit && (
            <div className="flex space-x-2">
              {onEdit && (
                <button 
                  onClick={() => onEdit(content)}
                  className="text-gray-500 hover:text-gray-700 font-medium text-sm"
                >
                  Editar
                </button>
              )}
              
              {onDelete && (
                <button 
                  onClick={() => onDelete(content.id)}
                  className="text-red-500 hover:text-red-700 font-medium text-sm"
                >
                  Excluir
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentCard;