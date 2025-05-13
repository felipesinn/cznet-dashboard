// src/components/FileUpload.tsx
import React, { useState, useRef } from 'react';
import { X, Upload, Image, FileText, File } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onClear: () => void;
  selectedFile: File | null;
  accept?: string;
  label?: string;
  required?: boolean;
  maxSizeMB?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onClear,
  selectedFile,
  accept = '*/*',
  label = 'Selecionar arquivo',
  required = false,
  maxSizeMB = 10
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determinar o tipo de arquivo
  const getFileType = (file: File) => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('text/')) return 'text';
    if (file.type.includes('pdf')) return 'pdf';
    return 'file';
  };

  // Exibir o tamanho do arquivo em formato legível
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Obter o ícone do arquivo com base no tipo
  const getFileIcon = (file: File) => {
    const type = getFileType(file);
    switch (type) {
      case 'image':
        return <Image size={24} className="text-blue-500" />;
      case 'video':
        return <Upload size={24} className="text-green-500" />;
      case 'text':
      case 'pdf':
        return <FileText size={24} className="text-orange-500" />;
      default:
        return <File size={24} className="text-gray-500" />;
    }
  };

  // Função para lidar com o arrastar e soltar (drag & drop)
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    setError(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndProcessFile(file);
    }
  };

  // Função para lidar com a seleção de arquivo via input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndProcessFile(file);
    }
  };

  // Função para validar e processar o arquivo
  const validateAndProcessFile = (file: File) => {
    // Verificar tamanho
    const maxSize = maxSizeMB * 1024 * 1024; // Converter para bytes
    if (file.size > maxSize) {
      setError(`O arquivo excede o tamanho máximo de ${maxSizeMB}MB.`);
      return;
    }
    
    // Verificar tipo, se accept for especificado
    if (accept !== '*/*') {
      const acceptTypes = accept.split(',').map(type => type.trim());
      const fileType = file.type;
      
      // Verificar se o tipo do arquivo está na lista de tipos aceitos
      const isAccepted = acceptTypes.some(type => {
        if (type.endsWith('/*')) {
          // Para casos como "image/*"
          const prefix = type.split('/')[0];
          return fileType.startsWith(`${prefix}/`);
        }
        return type === fileType;
      });
      
      if (!isAccepted) {
        setError(`Tipo de arquivo não suportado. Aceitos: ${accept}`);
        return;
      }
    }
    
    // Se passar nas validações, chamar a função de callback
    onFileSelect(file);
  };

  // Função para limpar o arquivo selecionado
  const clearFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setError(null);
    onClear();
  };

  // Função para abrir o diálogo de seleção de arquivo
  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      {/* Área de arrastar e soltar */}
      <div
        className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileSelector}
      >
        {selectedFile ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {getFileIcon(selectedFile)}
              <div className="ml-3 text-left">
                <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="text-gray-400 hover:text-gray-500"
            >
              <X size={20} />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="text-sm text-gray-600">
              <span className="font-medium text-blue-600">
                Clique para selecionar
              </span>{' '}
              ou arraste e solte
            </div>
            <p className="text-xs text-gray-500">
              Tamanho máximo: {maxSizeMB}MB
            </p>
          </div>
        )}
        
        {/* Input de arquivo (escondido) */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleFileChange}
          required={required && !selectedFile}
        />
      </div>
      
      {/* Mensagem de erro */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default FileUpload;