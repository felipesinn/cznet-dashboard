import React, { useState, useRef } from 'react';
import { X, Plus, Image, Save, Trash2 } from 'lucide-react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ContentItem } from '../../types/content.types';
import api from '../../services/api';

interface ContentEditorProps {
  content: ContentItem;
  onClose: () => void;
  onContentUpdated: (updatedContent: ContentItem) => void;
}

const ContentEditor: React.FC<ContentEditorProps> = ({ content, onClose, onContentUpdated }) => {
  const [currentContent, setCurrentContent] = useState<ContentItem>(content);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [textSections, setTextSections] = useState<string[]>(
    content.textContent ? [content.textContent] : ['']
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manipular a adição de imagens
  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files);
      setImages([...images, ...newImages]);
      
      // Criar URLs para preview
      const newPreviewUrls = newImages.map(file => URL.createObjectURL(file));
      setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls]);
    }
  };

  // Remover uma imagem
  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    
    // Limpar URL de preview
    URL.revokeObjectURL(imagePreviewUrls[index]);
    const newPreviewUrls = [...imagePreviewUrls];
    newPreviewUrls.splice(index, 1);
    setImagePreviewUrls(newPreviewUrls);
  };

  // Adicionar nova seção de texto
  const addTextSection = () => {
    setTextSections([...textSections, '']);
  };

  // Atualizar conteúdo de texto
  const updateTextSection = (index: number, text: string) => {
    const newSections = [...textSections];
    newSections[index] = text;
    setTextSections(newSections);
  };

  // Remover seção de texto
  const removeTextSection = (index: number) => {
    const newSections = [...textSections];
    newSections.splice(index, 1);
    setTextSections(newSections);
  };

  // Enviar o formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Combinar as seções de texto em um único conteúdo formatado
      const formattedTextContent = textSections.join('\n\n---\n\n'); // Separador de seções
      
      // Criar FormData para envio de arquivos
      const formData = new FormData();
      formData.append('title', currentContent.title);
      formData.append('description', currentContent.description || '');
      formData.append('textContent', formattedTextContent);
      formData.append('type', currentContent.type);
      formData.append('sector', currentContent.sector);
      
      // Adicionar todas as imagens
      images.forEach((image) => {
        formData.append(`images`, image);
      });
      
      // Enviar para a API
      const response = await api.put(`/content/${content.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Notificar o componente pai sobre a atualização
      onContentUpdated(response.data);
      onClose();
      
    } catch (error) {
      console.error('Erro ao atualizar conteúdo:', error);
      alert('Não foi possível atualizar o conteúdo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 pb-2 border-b">
            <h2 className="text-xl font-semibold text-gray-800">
              Editar: {currentContent.title}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            {/* Campos principais */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
              <input
                type="text"
                value={currentContent.title}
                onChange={(e) => setCurrentContent({...currentContent, title: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea
                value={currentContent.description || ''}
                onChange={(e) => setCurrentContent({...currentContent, description: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={2}
              />
            </div>
            
            {/* Seções de texto existentes */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Conteúdo de Texto</label>
                <button 
                  type="button" 
                  onClick={addTextSection}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                >
                  <Plus size={16} className="mr-1" />
                  Adicionar Seção
                </button>
              </div>
              
              {textSections.map((section, index) => (
                <div key={index} className="mb-3 p-3 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-600">
                      Seção {index + 1}
                    </label>
                    
                    {textSections.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeTextSection(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <textarea
                    value={section}
                    onChange={(e) => updateTextSection(index, e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={4}
                  />
                </div>
              ))}
            </div>
            
            {/* Upload de imagens */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Imagens</label>
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                >
                  <Plus size={16} className="mr-1" />
                  Adicionar Imagem
                </button>
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageAdd}
                className="hidden"
                accept="image/*"
                multiple
              />
              
              {/* Imagens existentes no servidor */}
              {currentContent.filePath && (
                <div className="mb-3">
                  <p className="text-sm text-gray-500 mb-2">Imagens existentes:</p>
                  <div className="flex flex-wrap gap-2">
                    <div className="relative">
                      <img 
                        src={`/api/uploads/${currentContent.filePath}`}
                        alt="Imagem existente"
                        className="w-24 h-24 object-cover rounded border border-gray-300"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Previews de novas imagens */}
              {imagePreviewUrls.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm text-gray-500 mb-2">Novas imagens:</p>
                  <div className="flex flex-wrap gap-2">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-24 h-24 object-cover rounded border border-gray-300"
                        />
                        <button 
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Área de upload */}
              <div 
                className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="space-y-1 text-center">
                  <Image className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-blue-600">Clique para fazer upload</span> ou arraste e solte
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF até 10MB
                  </p>
                </div>
              </div>
            </div>
            
            {/* Botões de ação */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={18} className="mr-1" />
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContentEditor;