// src/components/ContentModal.tsx
import React from 'react';
import { type ContentItem, ContentType } from '../types/content.types';
import { contentService } from '../services/content.service';
import { X } from 'lucide-react';

interface ContentModalProps {
  content: ContentItem;
  onClose: () => void;
}

const ContentModal: React.FC<ContentModalProps> = ({ content, onClose }) => {
  // Formatação de data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Função para renderizar o conteúdo baseado no tipo
  const renderContent = () => {
    switch (content.type as ContentType) {
      case ContentType.PHOTO:
        if (content.filePath) {
          const imageUrl = contentService.getFileUrl(content.filePath);
          return (
            <div className="mt-4">
              <img 
                src={imageUrl} 
                alt={content.title} 
                className="max-w-full rounded-md max-h-96 mx-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.appendChild(
                    document.createTextNode('Erro ao carregar imagem')
                  );
                }}
              />
            </div>
          );
        }
        return <p className="text-gray-500 mt-4">Imagem não disponível</p>;
        
      case ContentType.VIDEO:
        if (content.filePath) {
          const videoUrl = contentService.getFileUrl(content.filePath);
          return (
            <div className="mt-4">
              <video 
                src={videoUrl} 
                controls 
                className="max-w-full rounded-md max-h-96 mx-auto"
              >
                Seu navegador não suporta o elemento de vídeo.
              </video>
            </div>
          );
        }
        return <p className="text-gray-500 mt-4">Vídeo não disponível</p>;
        
      case ContentType.TEXT:
      case ContentType.TITLE:
        return (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: content.textContent || '' }}
            />
          </div>
        );
        
      default:
        return <p className="text-gray-500 mt-4">Conteúdo não disponível</p>;
    }
  };

  // Obter badge do tipo
  const getTypeBadge = () => {
    const type = content.type as ContentType;
    
    const classes = {
      [ContentType.PHOTO]: 'bg-purple-100 text-purple-800',
      [ContentType.VIDEO]: 'bg-green-100 text-green-800',
      [ContentType.TEXT]: 'bg-blue-100 text-blue-800',
      [ContentType.TITLE]: 'bg-yellow-100 text-yellow-800',
    };
    
    const labels = {
      [ContentType.PHOTO]: 'Foto',
      [ContentType.VIDEO]: 'Vídeo',
      [ContentType.TEXT]: 'Texto',
      [ContentType.TITLE]: 'Título',
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes[type]}`}>
        {labels[type]}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Cabeçalho */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-1">{content.title}</h2>
              <div className="flex items-center space-x-2">
                {getTypeBadge()}
                <span className="text-sm text-gray-500">
                  Criado em {formatDate(content.createdAt)}
                </span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Descrição */}
          {content.description && (
            <div className="mb-4">
              <p className="text-gray-700">{content.description}</p>
            </div>
          )}
          
          {/* Conteúdo Principal */}
          {renderContent()}
          
          {/* Metadados */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Setor</p>
                <p className="font-medium">{content.sector}</p>
              </div>
              <div>
                <p className="text-gray-500">Criado por</p>
                <p className="font-medium">{content.creator?.name || 'Desconhecido'}</p>
              </div>
              {content.updatedBy && content.updater && (
                <>
                  <div>
                    <p className="text-gray-500">Última atualização</p>
                    <p className="font-medium">{formatDate(content.updatedAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Atualizado por</p>
                    <p className="font-medium">{content.updater?.name || 'Desconhecido'}</p>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Rodapé */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentModal;