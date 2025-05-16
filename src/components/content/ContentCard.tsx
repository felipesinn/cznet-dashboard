import React from 'react';
import { FileText, Upload, Type, Image, Edit, Trash2 } from 'lucide-react';
import { type ContentItem, ContentType } from '../../types/content.types';
import { formatDate } from '../../utils/formatters';
import { Badge } from '../ui/Badge';

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
      <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
        {getIcon()}
      </div>
    );
  };

  // Obter badge para exibir o tipo
  const { variant, label } = (() => {
    if (content.category === 'tutorial') {
      return { variant: 'blue', label: 'Tutorial' };
    } else if (content.category === 'procedure') {
      return { variant: 'green', label: 'Procedimento' };
    } else if (content.category === 'configuration') {
      return { variant: 'purple', label: 'Configuração' };
    } else {
      switch (content.type) {
        case ContentType.PHOTO:
          return { variant: 'purple', label: 'Foto' };
        case ContentType.VIDEO:
          return { variant: 'green', label: 'Vídeo' };
        case ContentType.TEXT:
          return { variant: 'blue', label: 'Texto' };
        case ContentType.TITLE:
          return { variant: 'yellow', label: 'Título' };
        default:
          return { variant: 'gray', label: 'Documento' };
      }
    }
  })();

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge variant={variant} label={label} />
          <span className="text-xs text-gray-500">{formatDate(content.createdAt)}</span>
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2 truncate">{content.title}</h3>
        
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
                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
                >
                  <Edit size={14} className="mr-1" />
                  Editar
                </button>
              )}
              
              {onDelete && (
                <button 
                  onClick={() => {
                    if (window.confirm('Tem certeza que deseja excluir este conteúdo?')) {
                      onDelete(String(content.id));
                    }
                  }}
                  className="text-red-500 hover:text-red-700 text-sm flex items-center"
                >
                  <Trash2 size={14} className="mr-1" />
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