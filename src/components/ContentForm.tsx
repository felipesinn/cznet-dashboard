import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { type ContentItem, ContentType, type SectorType } from '../types/content.types';

interface ContentFormProps {
  initialData?: ContentItem;
  userSector: SectorType;
  isSuperAdmin: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

const ContentForm: React.FC<ContentFormProps> = ({
  initialData,
  userSector,
  isSuperAdmin,
  onSubmit,
  onCancel
}) => {
  // Estado do formulário
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: ContentType.TEXT,
    sector: userSector,
    textContent: '',
  });
  
  // Estado para arquivo selecionado
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // Efeito para resetar o formulário quando os dados iniciais mudarem
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        type: (initialData.type as string) || ContentType.TEXT,
        sector: initialData.sector as SectorType || userSector,
        textContent: initialData.textContent || '',
      });
      
      // Se houver arquivo, criar preview
      if (initialData.filePath) {
        setPreviewUrl(`/api/uploads/${initialData.filePath}`);
      } else {
        setPreviewUrl(null);
      }
    } else {
      setFormData({
        title: '',
        description: '',
        type: ContentType.TEXT,
        sector: userSector,
        textContent: '',
      });
      setPreviewUrl(null);
    }
    
    setSelectedFile(null);
    setError(null);
    setDebugInfo(null);
  }, [initialData, userSector]);

  // Função para lidar com a seleção de arquivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      console.log("Arquivo selecionado:", file.name, file.type, file.size);
      setDebugInfo(`Arquivo: ${file.name}, Tipo: ${file.type}, Tamanho: ${file.size} bytes`);
    }
    
    setSelectedFile(file);
    
    // Criar URL de preview para imagens
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Limpar URL quando o componente for desmontado
      return () => URL.revokeObjectURL(url);
    } else if (file && file.type.startsWith('video/')) {
      // Para vídeos, não mostrar preview
      setPreviewUrl(null);
    } else {
      setPreviewUrl(null);
    }
  };

  // Função para lidar com a submissão do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      // Verificar se os campos obrigatórios estão preenchidos
      if (!formData.title) {
        throw new Error('O título é obrigatório');
      }
      
      // Verificar o tipo de conteúdo
      if ((formData.type === ContentType.TEXT || formData.type === ContentType.TITLE) && !formData.textContent) {
        throw new Error(`O conteúdo de texto é obrigatório para o tipo ${formData.type}`);
      }
      
      // Para foto/vídeo, verificar se há arquivo (apenas na criação)
      if (!initialData && ((formData.type as ContentType) === ContentType.PHOTO || (formData.type as ContentType) === ContentType.VIDEO) && !selectedFile) {
        throw new Error(`É necessário selecionar um arquivo para o tipo ${formData.type}`);
      }
      
      // Criar FormData diretamente aqui em vez de passar o objeto simples
      const formDataObj = new FormData();
      
      // Adicionar campos básicos
      formDataObj.append('title', formData.title);
      formDataObj.append('type', formData.type);
      formDataObj.append('sector', formData.sector);
      
      // Adicionar campos opcionais
      if (formData.description) {
        formDataObj.append('description', formData.description);
      }
      
      if (formData.textContent) {
        formDataObj.append('textContent', formData.textContent);
      }
      
      // Adicionar arquivo se existir
      if (selectedFile) {
        formDataObj.append('file', selectedFile);
        console.log("Arquivo adicionado ao FormData:", selectedFile.name);
      }
      
      console.log("Enviando FormData com campos:", 
        Array.from(formDataObj.entries()).map(([key]) => key).join(", ")
      );
      
      // Enviar FormData
      await onSubmit(formDataObj);
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Ocorreu um erro ao salvar o conteúdo');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para atualizar os campos do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {initialData ? 'Editar Conteúdo' : 'Adicionar Novo Conteúdo'}
        </h2>
        <button 
          onClick={onCancel}
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
      
      {debugInfo && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4 text-sm">
          <strong>Debug:</strong> {debugInfo}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Título */}
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Título *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
        </div>
        
        {/* Descrição */}
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={2}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        
        {/* Tipo */}
        <div className="mb-4">
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo *
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
            disabled={!!initialData} // Não permitir mudar o tipo na edição
          >
            <option value={ContentType.TEXT}>Texto</option>
            <option value={ContentType.TITLE}>Título</option>
            <option value={ContentType.PHOTO}>Foto</option>
            <option value={ContentType.VIDEO}>Vídeo</option>
          </select>
        </div>
        
        {/* Setor (apenas super_admin pode mudar) */}
        <div className="mb-4">
          <label htmlFor="sector" className="block text-sm font-medium text-gray-700 mb-1">
            Setor *
          </label>
          <select
            id="sector"
            name="sector"
            value={formData.sector}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
            disabled={!isSuperAdmin} // Apenas super_admin pode mudar o setor
          >
            <option value="suporte">Suporte</option>
            <option value="tecnico">Técnico</option>
            <option value="noc">NOC</option>
            <option value="comercial">Comercial</option>
            <option value="adm">ADM</option>
          </select>
        </div>
        
        {/* Conteúdo de Texto (para tipos TEXT e TITLE) */}
        {(formData.type === ContentType.TEXT || formData.type === ContentType.TITLE) && (
          <div className="mb-4">
            <label htmlFor="textContent" className="block text-sm font-medium text-gray-700 mb-1">
              Conteúdo de Texto *
            </label>
            <textarea
              id="textContent"
              name="textContent"
              value={formData.textContent}
              onChange={handleChange}
              rows={8}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>
        )}
        
        {/* Upload de arquivo (para tipos PHOTO e VIDEO) */}
        {((formData.type as ContentType) === ContentType.PHOTO || (formData.type as ContentType) === ContentType.VIDEO) && (
          <div className="mb-4">
            <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
              {initialData ? 'Substituir Arquivo' : 'Arquivo *'}
            </label>
            
            {previewUrl && formData.type === ContentType.PHOTO.toString() ? (
              <div className="mb-2">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="max-h-40 rounded-md"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPreviewUrl(null);
                    setSelectedFile(null);
                  }}
                  className="mt-2 text-red-600 hover:text-red-700"
                >
                  Remover imagem
                </button>
              </div>
            ) : (
              <input
                type="file"
                id="file"
                onChange={handleFileChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                accept={formData.type === ContentType.PHOTO.toString() ? 'image/*' : 'video/*'}
                required={!initialData} // Obrigatório apenas na criação
              />
            )}
            
            {/* Mensagem sobre arquivo atual */}
            {initialData && initialData.filePath && !previewUrl && (
              <p className="text-sm text-gray-500 mt-1">
                {selectedFile ? 'O arquivo atual será substituído.' : 'Mantenha vazio para manter o arquivo atual.'}
              </p>
            )}
          </div>
        )}
        
        {/* Botões de ação */}
        <div className="flex justify-end space-x-2 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
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
              'Salvar'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContentForm;