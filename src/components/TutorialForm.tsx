// src/components/TutorialViewer.tsx
import React, { useState } from 'react';
import { BookOpen, X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import type { ContentItem } from '../types/content.types';

interface TutorialViewerProps {
  tutorial: ContentItem;
  onClose: () => void;
  onEdit?: () => void;
}

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  image?: string;
}

const TutorialViewer: React.FC<TutorialViewerProps> = ({ 
  tutorial, 
  onClose,
  onEdit
}) => {
  const [isImageOpen, setIsImageOpen] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  
  // Extrair os passos do tutorial
  // Na implementação real, isso viria dos mediaItems ou outra estrutura
  const steps: TutorialStep[] = tutorial.mediaItems?.map((item: { id: string; title: string; description?: string; content?: string; }) => ({
    id: item.id,
    title: item.title,
    description: item.description || '',
    image: item.content || undefined
  })) || [];
  
  // Ordenar os passos pelo campo order
  steps.sort((a, b) => {
    const orderA = (tutorial.mediaItems?.find((item: { id: string; }) => item.id === a.id)?.order || 0);
    const orderB = (tutorial.mediaItems?.find((item: { id: string; }) => item.id === b.id)?.order || 0);
    return orderA - orderB;
  });
  
  // Função para abrir uma imagem no modal
  const openImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsImageOpen(true);
    setZoom(1);
    setRotation(0);
  };
  
  // Função para fechar o modal de imagem
  const closeImage = () => {
    setIsImageOpen(false);
    setSelectedImage(null);
  };
  
  // Função para aumentar o zoom
  const zoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };
  
  // Função para diminuir o zoom
  const zoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };
  
  // Função para rotacionar a imagem
  const rotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Cabeçalho */}
          <div className="flex justify-between items-start mb-6 pb-4 border-b">
            <div className="flex items-center">
              <BookOpen size={24} className="text-blue-500 mr-2" />
              <h2 className="text-2xl font-semibold text-gray-800">{tutorial.title}</h2>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Descrição */}
          {tutorial.description && (
            <div className="mb-6">
              <p className="text-gray-700">{tutorial.description}</p>
            </div>
          )}
          
          {/* Passos do Tutorial */}
          <div className="space-y-6">
            {steps.length > 0 ? (
              steps.map((step, index) => (
                <div 
                  key={step.id}
                  className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <h3 className="text-xl font-medium text-gray-800 mb-3">
                    {step.title || `Passo ${index + 1}`}
                  </h3>
                  
                  {/* Descrição do passo */}
                  {step.description && (
                    <div 
                      className="prose max-w-none mb-4 text-gray-700"
                      dangerouslySetInnerHTML={{ __html: step.description }}
                    />
                  )}
                  
                  {/* Imagem do passo */}
                  {step.image && (
                    <div className="mt-4">
                      <img
                        src={step.image}
                        alt={step.title}
                        className="max-w-full h-auto rounded-md shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => openImage(step.image!)}
                      />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                Este tutorial não possui passos definidos.
              </div>
            )}
          </div>
          
          {/* Botões de ação */}
          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
            {onEdit && (
              <button
                onClick={onEdit}
                className="mr-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Editar Tutorial
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
      
      {/* Modal para visualização ampliada de imagens */}
      {isImageOpen && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col justify-center items-center z-[60]">
          <div className="absolute top-4 right-4 flex space-x-2">
            <button
              onClick={zoomIn}
              className="p-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
              title="Aumentar zoom"
            >
              <ZoomIn size={20} />
            </button>
            <button
              onClick={zoomOut}
              className="p-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
              title="Diminuir zoom"
            >
              <ZoomOut size={20} />
            </button>
            <button
              onClick={rotate}
              className="p-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
              title="Rotacionar"
            >
              <RotateCw size={20} />
            </button>
            <button
              onClick={closeImage}
              className="p-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
              title="Fechar"
            >
              <X size={20} />
            </button>
          </div>
          
          <div 
            className="w-full h-full flex items-center justify-center p-4 overflow-auto"
            onClick={closeImage}
          >
            <img
              src={selectedImage}
              alt="Imagem ampliada"
              className="max-h-full max-w-full object-contain transition-transform duration-200"
              style={{ 
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                cursor: 'zoom-out'
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (zoom >= 2) {
                  setZoom(1);
                } else {
                  closeImage();
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorialViewer;