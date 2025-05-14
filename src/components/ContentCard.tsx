import React from 'react';
import { FileText, Upload, Type, Image } from 'lucide-react';
import { type ContentItem, ContentType } from '../types/content.types';

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

  // Obter ícone com base no tipo
  const getIcon = () => {
    switch (content.type) {
      case ContentType.PHOTO:
        return <Image size={40} className="text-purple-400" />;
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

  // Classes CSS para o badge do tipo
  const getBadgeClasses = () => {
    switch (content.type) {
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

  // Nome formatado do tipo
  const getTypeName = () => {
    switch (content.type) {
      case ContentType.PHOTO:
        return 'Foto';
      case ContentType.VIDEO:
        return 'Vídeo';
      case ContentType.TEXT:
        return 'Texto';
      case ContentType.TITLE:
        return 'Título';
      default:
        return content.type;
    }
  };

  // Renderizar thumbnail/preview
  const renderPreview = () => {
    // Se for foto e tiver caminho do arquivo, mostrar preview
    if (content.type === ContentType.PHOTO && content.filePath) {
      return (
        <div className="h-32 bg-gray-100 rounded overflow-hidden">
          <img 
            src={`/api/uploads/${content.filePath}`}
            alt={content.title} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = 'Erro ao carregar imagem';
            }}
          />
        </div>
      );
    } 
    
    // Para outros tipos, mostrar ícone
    return (
      <div className="mt-4 h-32 bg-gray-100 rounded flex items-center justify-center">
        {getIcon()}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeClasses()}`}>
            {getTypeName()}
          </span>
          <span className="text-xs text-gray-500">{formatDate(content.createdAt)}</span>
        </div>
        
        <h3 className="mt-2 text-lg font-medium text-gray-900 truncate">{content.title}</h3>
        
        {renderPreview()}
        
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
                  onClick={() => {
                    if (window.confirm('Tem certeza que deseja excluir este conteúdo?')) {
                      onDelete(content.id);
                    }
                  }}
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