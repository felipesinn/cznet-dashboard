import React, { useState, useRef } from 'react';
import { X, Image, Save, ArrowLeft } from 'lucide-react';
import type { ContentItem } from '../../types/content.types';
import api from '../../services/api';

interface ContentAddEditorProps {
  content: ContentItem;
  onClose: () => void;
  onContentUpdated: (updatedContent: ContentItem) => void;
}

const ContentAddEditor: React.FC<ContentAddEditorProps> = ({ content, onClose, onContentUpdated }) => {
  // Estado para a nova adição apenas (não editamos o conteúdo original)
  const [additionTitle, setAdditionTitle] = useState('');
  const [additionContent, setAdditionContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manipular a seleção de arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Criar URL para preview se for imagem
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    }
  };

  // Limpar arquivo selecionado
  const clearFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Enviar o formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    // Validação básica
    if (!additionContent.trim()) {
      setError('O conteúdo da adição não pode estar vazio');
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Preparar a estrutura de adição para o formato Steps
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let stepsData: { additions: any[] } = { additions: [] };
      
      // Verificar se já existe um steps no content
      if (content.steps) {
        // Converter string para objeto se necessário
        if (typeof content.steps === 'string') {
          try {
            stepsData = JSON.parse(content.steps);
          } catch (error) {
            console.error('Erro ao parsear steps:', error);
            stepsData = { additions: [] };
          }
        } else if (typeof content.steps === 'object') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          stepsData = content.steps as any;
          if (!stepsData.additions) {
            stepsData.additions = [];
          }
        }
      }
      
      // Adicionar a nova adição ao array de adições
      stepsData.additions.push({
        id: `addition-${new Date().getTime()}`,
        title: additionTitle,
        content: additionContent,
        createdAt: new Date().toISOString(),
        createdByName: 'Usuário Atual' // Em produção, usar o nome do usuário logado
      });
      
      // Criar FormData para envio
      const formData = new FormData();
      formData.append('steps', JSON.stringify(stepsData));
      
      // Adicionar arquivo se existir
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      
      // Enviar para a API
      const response = await api.put(`/content/${content.id}/additions`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Notificar o componente pai sobre a atualização
      onContentUpdated(response.data);
      onClose();
      
    } catch (error) {
      console.error('Erro ao adicionar conteúdo:', error);
      setError('Não foi possível adicionar o conteúdo.');
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
              Adicionar Conteúdo a: {content.title}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* Conteúdo original (não editável) */}
            <div className="mb-6">
              <h3 className="text-base font-medium text-gray-700 mb-2">Conteúdo Original</h3>
              <div className="p-4 bg-gray-50 rounded-md max-h-60 overflow-y-auto">
                <div className="prose max-w-none text-gray-500">
                  {content.textContent ? (
                    <div dangerouslySetInnerHTML={{ __html: content.textContent }} />
                  ) : (
                    <p>Sem conteúdo de texto</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Divisor visual */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white text-sm text-gray-500">Adicionar Novo Conteúdo</span>
              </div>
            </div>
            
            {/* Título da adição */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título da Adição
              </label>
              <input
                type="text"
                value={additionTitle}
                onChange={(e) => setAdditionTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 1.1.1. Deletando ONU no U2000"
              />
            </div>
            
            {/* Conteúdo da adição */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conteúdo a Adicionar *
              </label>
              <textarea
                value={additionContent}
                onChange={(e) => setAdditionContent(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={8}
                placeholder="Adicione o novo conteúdo aqui. Ele aparecerá abaixo do conteúdo original."
                required
              />
            </div>
            
            {/* Upload de imagem */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adicionar Imagem (opcional)
              </label>
              
              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-40 rounded-md border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={clearFile}
                    className="absolute top-2 right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50"
                >
                  <Image className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-blue-600">Clique para fazer upload</span> ou arraste e solte
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF até 10MB
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                </div>
              )}
            </div>
            
            {/* Botões de ação */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center"
                disabled={isSubmitting}
              >
                <ArrowLeft size={16} className="mr-1" />
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
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
                    Salvar Adição
                  </>
                )}
              </button>
            </div>
            
            {/* Mensagem explicativa */}
            <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md">
              <p className="text-sm">
                <strong>Importante:</strong> Esta adição será exibida abaixo do conteúdo original, 
                preservando a documentação existente. Use este método para adicionar informações 
                complementares, atualizações ou correções.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContentAddEditor;