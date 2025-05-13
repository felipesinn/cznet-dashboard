// src/components/tutorials/TutorialEditor.tsx
import React, { useState, useEffect } from 'react';
import { X, Plus, Save, ArrowUp, ArrowDown, Trash2, Book, Upload, Image, BookOpen, ChevronRight, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import type { ContentItem, SectorType } from '../../types/content.types';

// Interface para um passo do tutorial
interface TutorialStep {
  id: string;
  title: string;
  description: string;
  image?: string;
  order: number;
}

// Interface para o tutorial completo
interface Tutorial {
  id: string;
  title: string;
  description: string;
  steps: TutorialStep[];
  sector: SectorType;
  tags?: string[];
  category?: string;
  coverImage?: string;
}

interface TutorialEditorProps {
  initialTutorial?: ContentItem;
  userSector: SectorType;
  isSuperAdmin: boolean;
  onSubmit: (tutorial: Tutorial) => Promise<void>;
  onCancel: () => void;
}

const TutorialEditor: React.FC<TutorialEditorProps> = ({
  initialTutorial,
  userSector,
  isSuperAdmin,
  onSubmit,
  onCancel
}) => {
  // Estado para o tutorial
  const [tutorial, setTutorial] = useState<Tutorial>({
    id: initialTutorial?.id || `tutorial-${Date.now()}`,
    title: initialTutorial?.title || '',
    description: initialTutorial?.description || '',
    steps: [],
    sector: initialTutorial?.sector as SectorType || userSector,
    tags: (initialTutorial && 'tags' in initialTutorial) ? (initialTutorial.tags as string[]) : [],
    category: (initialTutorial && 'category' in initialTutorial) ? (initialTutorial.category as string) : 'Tutorial'
  });
  
  // Estados adicionais
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(
    (initialTutorial && 'coverImage' in initialTutorial) ? (initialTutorial.coverImage as string) : null
  );
  const [newTag, setNewTag] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [selectedStepForPreview, setSelectedStepForPreview] = useState<TutorialStep | null>(null);
  const [imageZoom, setImageZoom] = useState<number>(1);
  const [imageRotation, setImageRotation] = useState<number>(0);
  
  // Converter mediaItems para steps se houver um tutorial inicial
  useEffect(() => {
    if (initialTutorial && initialTutorial.mediaItems) {
      // Ordenar os itens pelo campo 'order' ou índice
      const sortedItems = [...initialTutorial.mediaItems].sort((a, b) => {
        const orderA = a.order !== undefined ? a.order : 0;
        const orderB = b.order !== undefined ? b.order : 0;
        return orderA - orderB;
      });
      
      // Converter para passos de tutorial
      const steps: TutorialStep[] = sortedItems.map((item, index) => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        image: item.content,
        order: item.order !== undefined ? item.order : index
      }));
      
      setTutorial(prev => ({
        ...prev,
        steps
      }));
    }
  }, [initialTutorial]);
  
  // Adicionar um novo passo
  const addStep = () => {
    const newStep: TutorialStep = {
      id: `step-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: `Passo ${tutorial.steps.length + 1}`,
      description: '',
      order: tutorial.steps.length
    };
    
    setTutorial(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };
  
  // Atualizar um passo existente
  const updateStep = (id: string, changes: Partial<TutorialStep>) => {
    setTutorial(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === id ? { ...step, ...changes } : step
      )
    }));
  };
  
  // Mover um passo para cima
  const moveStepUp = (index: number) => {
    if (index <= 0) return;
    
    const updatedSteps = [...tutorial.steps];
    const temp = updatedSteps[index];
    updatedSteps[index] = updatedSteps[index - 1];
    updatedSteps[index - 1] = temp;
    
    // Atualizar a ordem
    updatedSteps.forEach((step, i) => {
      step.order = i;
    });
    
    setTutorial(prev => ({
      ...prev,
      steps: updatedSteps
    }));
  };
  
  // Mover um passo para baixo
  const moveStepDown = (index: number) => {
    if (index >= tutorial.steps.length - 1) return;
    
    const updatedSteps = [...tutorial.steps];
    const temp = updatedSteps[index];
    updatedSteps[index] = updatedSteps[index + 1];
    updatedSteps[index + 1] = temp;
    
    // Atualizar a ordem
    updatedSteps.forEach((step, i) => {
      step.order = i;
    });
    
    setTutorial(prev => ({
      ...prev,
      steps: updatedSteps
    }));
  };
  
  // Remover um passo
  const removeStep = (id: string) => {
    const updatedSteps = tutorial.steps.filter(step => step.id !== id);
    
    // Reordenar os passos restantes
    updatedSteps.forEach((step, index) => {
      step.order = index;
    });
    
    setTutorial(prev => ({
      ...prev,
      steps: updatedSteps
    }));
  };
  
  // Adicionar uma tag
  const addTag = () => {
    if (!newTag.trim()) return;
    
    if (tutorial.tags?.includes(newTag.trim())) {
      setError('Esta tag já existe');
      return;
    }
    
    setTutorial(prev => ({
      ...prev,
      tags: [...(prev.tags || []), newTag.trim()]
    }));
    
    setNewTag('');
    setError(null);
  };
  
  // Remover uma tag
  const removeTag = (tag: string) => {
    setTutorial(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || []
    }));
  };
  
  // Função para lidar com upload de imagem para capa
  const handleCoverImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setCoverFile(file);
      
      // Criar URL para preview
      const imageUrl = URL.createObjectURL(file);
      setCoverPreview(imageUrl);
    }
  };
  
  // Função para lidar com upload de imagem para um passo
  const handleStepImageSelect = (e: React.ChangeEvent<HTMLInputElement>, stepId: string) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Simulação de upload - na implementação real, enviaria para o servidor
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        updateStep(stepId, { image: imageUrl });
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Função para pré-visualizar uma imagem em tamanho maior
  const previewImage = (step: TutorialStep) => {
    setSelectedStepForPreview(step);
    setImageZoom(1);
    setImageRotation(0);
  };
  
  // Função para fechar o preview de imagem
  const closeImagePreview = () => {
    setSelectedStepForPreview(null);
    setImageZoom(1);
    setImageRotation(0);
  };

  // Função para aumentar zoom
  const zoomIn = () => {
    setImageZoom(prev => Math.min(prev + 0.2, 3));
  };

  // Função para diminuir zoom
  const zoomOut = () => {
    setImageZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  // Função para rotacionar imagem
  const rotateImage = () => {
    setImageRotation(prev => (prev + 90) % 360);
  };
  
  // Manipular o envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      // Validação básica
      if (!tutorial.title.trim()) {
        throw new Error('O título é obrigatório');
      }
      
      if (tutorial.steps.length === 0) {
        throw new Error('Adicione pelo menos um passo ao tutorial');
      }
      
      // Se houver um arquivo de capa, simular um upload
      let coverImageUrl = tutorial.coverImage;
      if (coverFile) {
        // Na implementação real, isso seria substituído por um upload para o servidor
        coverImageUrl = coverPreview || undefined;
      }
      
      // Preparar o tutorial para envio
      const tutorialToSubmit: Tutorial = {
        ...tutorial,
        coverImage: coverImageUrl || undefined,
        // Garantir que os passos estejam na ordem correta
        steps: tutorial.steps.sort((a, b) => a.order - b.order)
      };
      
      // Enviar o tutorial
      await onSubmit(tutorialToSubmit);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar o tutorial');
      setIsSubmitting(false);
    }
  };
  
  // Alternar para o modo de pré-visualização
  const togglePreviewMode = () => {
    setPreviewMode(!previewMode);
  };
  
  // Componente para a pré-visualização do tutorial
  const TutorialPreview = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6 pb-2 border-b">
        <div className="flex items-center">
          <BookOpen size={24} className="text-blue-500 mr-2" />
          <h2 className="text-2xl font-semibold text-gray-800">{tutorial.title || 'Sem título'}</h2>
        </div>
        <button 
          onClick={togglePreviewMode}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center"
        >
          <X size={16} className="mr-2" />
          Fechar Pré-visualização
        </button>
      </div>
      
      {tutorial.description && (
        <div className="mb-6">
          <p className="text-gray-700">{tutorial.description}</p>
        </div>
      )}
      
      {coverPreview && (
        <div className="mb-6">
          <img 
            src={coverPreview} 
            alt="Capa do tutorial" 
            className="max-w-full h-auto rounded-lg shadow-sm"
          />
        </div>
      )}
      
      <div className="space-y-6">
        {tutorial.steps.length > 0 ? (
          tutorial.steps
            .sort((a, b) => a.order - b.order)
            .map((step, index) => (
              <div 
                key={step.id}
                className="bg-gray-50 rounded-lg p-6 shadow-sm"
              >
                <h3 className="text-xl font-medium text-gray-800 mb-3">
                  {step.title || `Passo ${index + 1}`}
                </h3>
                
                {step.description && (
                  <div 
                    className="prose max-w-none mb-4 text-gray-700"
                    dangerouslySetInnerHTML={{ __html: step.description }}
                  />
                )}
                
                {step.image && (
                  <div className="mt-4">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="max-w-full h-auto rounded-md shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => previewImage(step)}
                    />
                  </div>
                )}
              </div>
            ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            Adicione passos ao seu tutorial para ver a pré-visualização.
          </div>
        )}
      </div>
    </div>
  );
  
  // Componente para edição de um passo
  const StepEditor: React.FC<{
    step: TutorialStep;
    index: number;
    isFirst: boolean;
    isLast: boolean;
  }> = ({ step, index, isFirst, isLast }) => {
    // Estado para o editor de texto rico
    const [isRichEditor, setIsRichEditor] = useState<boolean>(false);
    
    return (
      <div className="border border-gray-300 rounded-lg p-4 mb-4 bg-white shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-2">
              {index + 1}
            </div>
            <input
              type="text"
              value={step.title}
              onChange={(e) => updateStep(step.id, { title: e.target.value })}
              className="text-lg font-medium p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Título do passo"
            />
          </div>
          
          <div className="flex space-x-1">
            <button
              type="button"
              onClick={() => moveStepUp(index)}
              disabled={isFirst}
              className={`p-1 rounded ${isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
              title="Mover para cima"
            >
              <ArrowUp size={20} />
            </button>
            
            <button
              type="button"
              onClick={() => moveStepDown(index)}
              disabled={isLast}
              className={`p-1 rounded ${isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
              title="Mover para baixo"
            >
              <ArrowDown size={20} />
            </button>
            
            <button
              type="button"
              onClick={() => removeStep(step.id)}
              className="p-1 rounded text-red-500 hover:bg-red-50"
              title="Remover passo"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
        
        {/* Editor de descrição */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          
          <div className="flex mb-1">
            <button
              type="button"
              onClick={() => setIsRichEditor(!isRichEditor)}
              className={`text-xs px-2 py-1 rounded ${isRichEditor ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              {isRichEditor ? 'Editor Rich Text' : 'Editor Simples'}
            </button>
          </div>
          
          {isRichEditor ? (
            // Editor Rico (na implementação real, você usaria uma biblioteca como TinyMCE, CKEditor, etc.)
            <div className="border border-gray-300 rounded-md">
              <div className="bg-gray-100 border-b p-1">
                <div className="flex space-x-1">
                  <button
                    type="button"
                    className="p-1 hover:bg-gray-200 rounded"
                    onClick={() => {
                      const currentText = step.description;
                      updateStep(step.id, { description: `<strong>${currentText}</strong>` });
                    }}
                  >
                    <strong>B</strong>
                  </button>
                  <button
                    type="button"
                    className="p-1 hover:bg-gray-200 rounded italic"
                    onClick={() => {
                      const currentText = step.description;
                      updateStep(step.id, { description: `<em>${currentText}</em>` });
                    }}
                  >
                    I
                  </button>
                  <button
                    type="button"
                    className="p-1 hover:bg-gray-200 rounded"
                    onClick={() => {
                      const currentText = step.description;
                      updateStep(step.id, { description: `<u>${currentText}</u>` });
                    }}
                  >
                    <u>U</u>
                  </button>
                </div>
              </div>
              <textarea
                value={step.description}
                onChange={(e) => updateStep(step.id, { description: e.target.value })}
                className="w-full p-2 min-h-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descrição detalhada do passo..."
              />
            </div>
          ) : (
            // Editor Simples
            <textarea
              value={step.description}
              onChange={(e) => updateStep(step.id, { description: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md min-h-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descrição detalhada do passo..."
            />
          )}
        </div>
        
        {/* Upload de imagem */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Imagem (opcional)
          </label>
          
          {step.image ? (
            <div className="relative mb-2">
              <img
                src={step.image}
                alt={step.title}
                className="max-h-[200px] rounded-md border border-gray-200 cursor-pointer"
                onClick={() => previewImage(step)}
              />
              <div className="absolute top-2 right-2 flex space-x-1">
                <button
                  type="button"
                  onClick={() => previewImage(step)}
                  className="bg-gray-800 text-white rounded-full p-1 hover:bg-gray-700"
                  title="Visualizar imagem"
                >
                  <Image size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => updateStep(step.id, { image: undefined })}
                  className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  title="Remover imagem"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
              <input
                type="file"
                id={`step-image-${step.id}`}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleStepImageSelect(e, step.id)}
              />
              <label 
                htmlFor={`step-image-${step.id}`}
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                <Upload size={24} className="text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Clique para selecionar uma imagem</span>
              </label>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Renderização condicional - Editor ou Pré-visualização
  if (previewMode) {
    return (
      <div className="bg-gray-100 p-4 md:p-6 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <TutorialPreview />
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-100 p-4 md:p-6 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 pb-2 border-b">
            <div className="flex items-center">
              <BookOpen size={24} className="text-blue-500 mr-2" />
              <h1 className="text-2xl font-bold text-gray-800">
                {initialTutorial ? 'Editar Tutorial' : 'Criar Novo Tutorial'}
              </h1>
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={togglePreviewMode}
                className="px-4 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 flex items-center"
              >
                <ChevronRight size={16} className="mr-1" />
                Pré-visualizar
              </button>
              <button 
                onClick={onCancel}
                className="text-gray-500 hover:text-gray-700 p-2"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          
          {/* Mensagens de erro */}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="md:col-span-2 space-y-4">
                {/* Título */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Título do Tutorial *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={tutorial.title}
                    onChange={(e) => setTutorial({ ...tutorial, title: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                    placeholder="Digite o título do tutorial"
                    required
                  />
                </div>
                
                {/* Descrição */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    id="description"
                    value={tutorial.description}
                    onChange={(e) => setTutorial({ ...tutorial, description: e.target.value })}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Adicione uma breve descrição sobre o tutorial"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Imagem de capa */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imagem de capa (opcional)
                  </label>
                  {coverPreview ? (
                    <div className="relative">
                      <img
                        src={coverPreview}
                        alt="Capa do tutorial"
                        className="w-full h-40 object-cover rounded-md border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCoverPreview(null);
                          setCoverFile(null);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        title="Remover imagem"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center h-40 flex flex-col items-center justify-center">
                      <input
                        type="file"
                        id="cover-image"
                        className="hidden"
                        accept="image/*"
                        onChange={handleCoverImageSelect}
                      />
                      <label 
                        htmlFor="cover-image"
                        className="cursor-pointer flex flex-col items-center justify-center w-full h-full"
                      >
                        <Upload size={24} className="text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Clique para selecionar uma imagem</span>
                      </label>
                    </div>
                  )}
                </div>
                
                {/* Categoria */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria
                  </label>
                  <input
                    type="text"
                    id="category"
                    value={tutorial.category || ''}
                    onChange={(e) => setTutorial({ ...tutorial, category: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Categoria do tutorial"
                  />
                </div>
                
                {/* Setor */}
                <div>
                  <label htmlFor="sector" className="block text-sm font-medium text-gray-700 mb-1">
                    Setor *
                  </label>
                  <select
                    id="sector"
                    value={tutorial.sector}
                    onChange={(e) => setTutorial({ ...tutorial, sector: e.target.value as SectorType })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={!isSuperAdmin}
                  >
                    <option value="suporte">Suporte</option>
                    <option value="tecnico">Técnico</option>
                    <option value="noc">NOC</option>
                    <option value="comercial">Comercial</option>
                    <option value="adm">ADM</option>
                  </select>
                </div>
                
                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tutorial.tags?.map((tag) => (
                      <span 
                        key={tag} 
                        className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1.5 text-blue-500 hover:text-blue-700"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Adicionar tag"
                      className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-3 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 flex items-center"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Lista de passos */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-800 flex items-center">
                  <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-2">
                    {tutorial.steps.length}
                  </span>
                  Passos do Tutorial
                </h3>
                
                <button
                  type="button"
                  onClick={addStep}
                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  <Plus size={16} className="mr-1" />
                  Adicionar Passo
                </button>
              </div>
              
              {tutorial.steps.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <Book size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">
                    Nenhum passo adicionado. Comece adicionando um passo ao seu tutorial.
                  </p>
                  <button
                    type="button"
                    onClick={addStep}
                    className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    <Plus size={16} className="mr-1" />
                    Adicionar Primeiro Passo
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {tutorial.steps
                    .sort((a, b) => a.order - b.order)
                    .map((step, index) => (
                      <StepEditor
                        key={step.id}
                        step={step}
                        index={index}
                        isFirst={index === 0}
                        isLast={index === tutorial.steps.length - 1}
                      />
                    ))}
                </div>
              )}
            </div>
            
            {/* Botões de ação */}
            <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-gray-200">
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
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
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
                    Salvar Tutorial
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Modal para visualização ampliada de imagens */}
      {selectedStepForPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col justify-center items-center z-50">
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
              onClick={rotateImage}
              className="p-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
              title="Rotacionar"
            >
              <RotateCw size={20} />
            </button>
            <button
              onClick={closeImagePreview}
              className="p-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
              title="Fechar"
            >
              <X size={20} />
            </button>
          </div>
          
          <div 
            className="w-full h-full flex items-center justify-center p-4 overflow-auto"
            onClick={closeImagePreview}
          >
            <img
              src={selectedStepForPreview.image}
              alt={selectedStepForPreview.title}
              className="max-h-full max-w-full object-contain transition-transform duration-200"
              style={{ 
                transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`,
                cursor: 'zoom-out'
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (imageZoom >= 2) {
                  setImageZoom(1);
                } else {
                  closeImagePreview();
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorialEditor;