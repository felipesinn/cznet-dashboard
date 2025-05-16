/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  type ContentItem,
  ContentType,
  ContentCategory,
} from "../../types/content.types";
import { type SectorType } from "../../types/common.types";
import Spinner from "../ui/Spinner";

interface ContentFormProps {
  initialData?: ContentItem;
  userSector: SectorType;
  isSuperAdmin: boolean;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
}

const ContentForm: React.FC<ContentFormProps> = ({
  initialData,
  userSector,
  isSuperAdmin,
  onSubmit,
  onCancel,
}) => {
  // Estado do formulário
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    type: ContentType;
    category: string;
    sector: SectorType;
    textContent: string;
    priority: number;
    complexity: number;
  }>({
    title: "",
    description: "",
    type: ContentType.TEXT,
    category: "",
    sector: userSector,
    textContent: "",
    priority: 0,
    complexity: 0,
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
        title: initialData.title || "",
        description: initialData.description || "",
        type: initialData.type || ContentType.TEXT,
        category: initialData.category || "",
        sector: (initialData.sector as SectorType) || userSector,
        textContent: initialData.textContent || "",
        priority: initialData.priority || 0,
        complexity: initialData.complexity || 0,
      });

      // Se houver arquivo, criar preview
      if (initialData.filePath) {
        setPreviewUrl(`/api/uploads/${initialData.filePath}`);
      } else {
        setPreviewUrl(null);
      }
    } else {
      setFormData({
        title: "",
        description: "",
        type: ContentType.TEXT,
        category: "",
        sector: userSector,
        textContent: "",
        priority: 0,
        complexity: 0,
      });
      setPreviewUrl(null);
    }

    setSelectedFile(null);
    setError(null);
  }, [initialData, userSector]);

  // Função para lidar com a seleção de arquivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (file) {
      console.log("Arquivo selecionado:", file.name, file.type, file.size);
    }

    setSelectedFile(file);

    // Criar URL de preview para imagens
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Limpar URL quando o componente for desmontado
      return () => URL.revokeObjectURL(url);
    } else if (file && file.type.startsWith("video/")) {
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
      // Verificações...

      // Criar FormData
      const formDataObj = new FormData();

      // Adicionar campos básicos
      formDataObj.append("title", formData.title);
      formDataObj.append("type", formData.type);
      formDataObj.append("sector", formData.sector);

      // Adicionar campos opcionais
      if (formData.description) {
        formDataObj.append("description", formData.description);
      }

      if (formData.textContent) {
        formDataObj.append("textContent", formData.textContent);
      }

      // Adicionar arquivo se existir
      if (selectedFile) {
        formDataObj.append("file", selectedFile);
      }

      // Enviar FormData
      await onSubmit(formDataObj);
    } catch (error) {
      // Tratamento de erro...
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para atualizar os campos do formulário
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Remover imagem
  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4 pb-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">
              {initialData ? "Editar Conteúdo" : "Adicionar Novo Conteúdo"}
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
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
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
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tipo */}
              <div className="mb-4">
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
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
                  <option value={ContentType.TUTORIAL}>Tutorial</option>
                </select>
              </div>

              {/* Categoria */}
              <div className="mb-4">
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Categoria
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Selecione uma categoria</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="procedure">Procedimento</option>
                  <option value="configuration">Configuração</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Setor (apenas super_admin pode mudar) */}
              <div className="mb-4">
                <label
                  htmlFor="sector"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
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

              {/* Prioridade */}
              <div className="mb-4">
                <label
                  htmlFor="priority"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Prioridade (0-10)
                </label>
                <input
                  type="number"
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  min="0"
                  max="10"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Valores mais altos aparecem primeiro em listagens.
                </p>
              </div>
            </div>

            {/* Complexidade para procedimentos */}
            {formData.category === ContentCategory.PROCEDURE && (
              <div className="mb-4">
                <label
                  htmlFor="complexity"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Complexidade (Número de passos)
                </label>
                <input
                  type="number"
                  id="complexity"
                  name="complexity"
                  value={formData.complexity}
                  onChange={handleChange}
                  min="0"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Conteúdo de Texto (para tipos TEXT e TITLE) */}
            {(formData.type === ContentType.TEXT ||
              formData.type === ContentType.TITLE ||
              formData.type === ContentType.TUTORIAL) && (
              <div className="mb-4">
                <label
                  htmlFor="textContent"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
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
                <p className="text-xs text-gray-500 mt-1">
                  Use formatação numérica (1., 1.1., etc.) para estruturar seu
                  conteúdo.
                </p>
              </div>
            )}

            {/* Upload de arquivo (para tipos PHOTO e VIDEO) */}
            {((formData.type as ContentType) === ContentType.PHOTO ||
              (formData.type as ContentType) === ContentType.VIDEO) && (
              <div className="mb-4">
                <label
                  htmlFor="file"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {initialData ? "Substituir Arquivo" : "Arquivo *"}
                </label>

                {previewUrl && formData.type === ContentType.PHOTO ? (
                  <div className="mb-2">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-40 rounded-md"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
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
                    accept={
                      formData.type === ContentType.PHOTO
                        ? "image/*"
                        : "video/*"
                    }
                    required={!initialData} // Obrigatório apenas na criação
                  />
                )}

                {/* Mensagem sobre arquivo atual */}
                {initialData && initialData.filePath && !previewUrl && (
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedFile
                      ? "O arquivo atual será substituído."
                      : "Mantenha vazio para manter o arquivo atual."}
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
                    <span className="mr-2">
                      <Spinner size="sm" />
                    </span>
                    Salvando...
                  </>
                ) : (
                  "Salvar"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContentForm;
