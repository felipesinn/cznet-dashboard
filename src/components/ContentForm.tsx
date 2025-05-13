// src/components/ContentForm.tsx
import React, { useState, useEffect } from 'react';
import { type ContentItem, ContentType, type SectorType, type CreateContentData, type UpdateContentData } from '../types/content.types';
import { X } from 'lucide-react';

interface ContentFormProps {
  initialData?: ContentItem;
  userSector: SectorType;
  isSuperAdmin: boolean;
  onSubmit: (data: CreateContentData | UpdateContentData) => Promise<void>;
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
  const [formData, setFormData] = useState<CreateContentData | UpdateContentData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    type: initialData?.type as ContentType || ContentType.TEXT,
    sector: initialData?.sector as SectorType || userSector,
    textContent: initialData?.textContent || '',
  });

  // Estado para arquivo selecionado
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Efeito para resetar o formulário quando os dados iniciais mudarem
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description || '',
        type: initialData.type as ContentType,
        sector: initialData.sector as SectorType,
        textContent: initialData.textContent || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        type: ContentType.TEXT,
        sector: userSector,
        textContent: '',
      });
    }
    
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
  }, [initialData, userSector]);

  // Função para lidar com a seleção de arquivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    
    // Criar URL de preview para imagens
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Limpar URL quando o componente for desmontado
      return () => URL.revokeObjectURL(url);
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
      
      // Para edição, não é necessário fornecer todos os campos
      if (!initialData && 'type' in formData && !formData.type) {
        throw new Error('O tipo é obrigatório');
      }
      
      if (!initialData && !formData.sector) {
        throw new Error('O setor é obrigatório');
      }
      
      // Verificar o tipo de conteúdo
      if ('type' in formData && (formData.type === ContentType.TEXT || formData.type === ContentType.TITLE) && !formData.textContent) {
        throw new Error(`O conteúdo de texto é obrigatório para o tipo ${formData.type}`);
      }
      
      // Para foto/vídeo, verificar se há arquivo (apenas na criação)
      if (!initialData && 'type' in formData && (formData.type === ContentType.PHOTO || formData.type === ContentType.VIDEO) && !selectedFile) {
        throw new Error(`É necessário selecionar um arquivo para o tipo ${formData.type}`);
      }
      
      // Preparar dados para envio
      const dataToSubmit: CreateContentData | UpdateContentData = {
        ...formData,
        file: selectedFile || undefined,
      };
      
      // Enviar dados
      await onSubmit(dataToSubmit);
    } catch (error) {
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
            value={'type' in formData ? formData.type : ContentType.TEXT}
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
        {('type' in formData && (formData.type === ContentType.TEXT || formData.type === ContentType.TITLE)) && (
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
        {('type' in formData && (formData.type === ContentType.PHOTO || formData.type === ContentType.VIDEO)) && (
          <div className="mb-4">
            <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
              {initialData ? 'Substituir Arquivo' : 'Arquivo *'}
            </label>
            <input
              type="file"
              id="file"
              name="file"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              accept={formData.type === ContentType.PHOTO ? 'image/*' : 'video/*'}
              required={!initialData} // Obrigatório apenas na criação
            />
            
            {/* Preview para imagens */}
            {previewUrl && formData.type === ContentType.PHOTO && (
              <div className="mt-2">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="max-h-40 rounded-md"
                />
              </div>
            )}
            
            {/* Mensagem sobre arquivo atual */}
            {initialData && initialData.filePath && (
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