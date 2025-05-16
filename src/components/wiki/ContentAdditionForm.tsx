// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useState } from 'react';
import { type ContentItem } from '../../types/content.types';
import { X, Plus } from 'lucide-react';

interface ContentAdditionFormProps {
  article: ContentItem;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
}

const ContentAdditionForm: React.FC<ContentAdditionFormProps> = ({
  article,
  onClose,
  onSubmit
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Manipular envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação
    if (!content.trim()) {
      setError('O conteúdo é obrigatório');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Criar FormData
      const formData = new FormData();
      
      // Dados básicos
      formData.append('articleId', String(article.id));
      formData.append('title', title);
      formData.append('content', content);
      
      // Adicionar arquivo se existir
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      
      // Enviar dados
      await onSubmit(formData);
      
      // Fechar modal após sucesso
      onClose();
    } catch (err) {
      console.error('Erro ao adicionar conteúdo:', err);
      setError('Ocorreu um erro ao adicionar o conteúdo. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Manipular seleção de arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  return (
    <div 
      className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 pb-2 border-b">
            <h2 className="text-xl font-semibold text-gray-800">
              Adicionar Conteúdo ao Artigo
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* Título da adição */}
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Título da Adição (opcional)
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Novo método para consulta ONU"
              />
            </div>
            
            {/* Conteúdo da adição */}
            <div className="mb-4">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Conteúdo*
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite aqui o conteúdo adicional..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Formate o texto utilizando linhas em branco para separar parágrafos. 
                Para listas numeradas, use "1. Item", "2. Item", etc.
              </p>
            </div>
            
            {/* Upload de arquivo */}
            <div className="mb-6">
              <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
                Imagem ou Arquivo (opcional)
              </label>
              <input
                type="file"
                id="file"
                onChange={handleFileChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {selectedFile && (
                <p className="text-sm text-green-600 mt-1">
                  Arquivo selecionado: {selectedFile.name}
                </p>
              )}
            </div>
            
            {/* Informação sobre preservação do conteúdo original */}
            <div className="bg-blue-50 p-4 rounded-md mb-6">
              <p className="text-sm text-blue-700">
                <strong>Nota:</strong> O conteúdo original do artigo será preservado. 
                Sua adição aparecerá como um novo bloco abaixo do conteúdo original.
              </p>
            </div>
            
            {/* Botões de ação */}
            <div className="flex justify-end space-x-2">
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
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adicionando...
                  </>
                ) : (
                  <>
                    <Plus size={18} className="mr-1" />
                    Adicionar Conteúdo
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

export default ContentAdditionForm;