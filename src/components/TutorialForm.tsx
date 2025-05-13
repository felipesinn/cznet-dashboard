// src/components/TutorialForm.tsx
import React, { useState, useEffect } from 'react';
import { X, Plus, Save, ArrowUp, ArrowDown, Trash2, Book, BookOpen } from 'lucide-react';
import FileUpload from './FileUpload';
import { ContentItem, SectorType } from '../types/content.types';

// Interface para um passo do tutorial
interface TutorialStep {
  id: string;
  title: string;
  description: string;
  image?: string;
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

interface TutorialFormProps {
  initialTutorial?: ContentItem;
  userSector: SectorType;
  isSuperAdmin: boolean;
  onSubmit: (tutorial: Tutorial) => Promise<void>;
  onCancel: () => void;
}

const TutorialForm: React.FC<TutorialFormProps> = ({
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
    sector: initialTutorial?.sector || userSector,
    tags: initialTutorial?.tags || [],
    category: initialTutorial?.category || 'Tutorial'
  });
  
  // Estado para arquivo de capa
  const [coverFile, setCoverFile] = useState<File | null>(null);
  
  // Estado para nova tag
  const [newTag, setNewTag] = useState<string>('');
  
  // Estado para submissão
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
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
      const steps: TutorialStep[] = sortedItems.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        image: item.content
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
      description: ''
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
    
    setTutorial(prev => ({
      ...prev,
      steps: updatedSteps
    }));
  };
  
  // Remover um passo
  const removeStep = (id: string) => {
    setTutorial(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== id)
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
        coverImageUrl = URL.createObjectURL(coverFile);
      }
      
      // Preparar o tutorial para envio
      const tutorialToSubmit: Tutorial = {
        ...tutorial,
        coverImage: coverImageUrl
      };
      
      // Enviar o tutorial
      await onSubmit(tutorialToSubmit);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar o tutorial');
      setIsSubmitting(false);
    }
  };
  
  // Componente para edição de um passo
  const StepEditor: React.FC<{
    step: TutorialStep;
    index: number;
    isFirst: boolean;
    isLast: boolean;
  }> = ({ step, index, isFirst, isLast }) => {
    // Estado para o arquivo de imagem
    const [stepFile, setStepFile] = useState<File | null>(null);
    
    // Definir modo de editor rico
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
                className="max-h-[200px] rounded-md border border-gray-200"
              />
              <button
                type="button"
                onClick={() => updateStep(step.id, { image: undefined })}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                title="Remover imagem"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <FileUpload
              onFileSelect={(file) => {
                setStepFile(file);
                // Simular upload (na implementação real, isso seria um upload real)
                const imageUrl = URL.createObjectURL(file);
                updateStep(step.id, { image: imageUrl });
              }}
              onClear={() => {
                setStepFile(null);
                updateStep(step.id, { image: undefined });
              }}
              selectedFile={stepFile}
              accept="image/*"
              label="Selecione uma imagem"
              required={false}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-xl max-w-4xl mx-auto overflow-y-auto max-h-[90vh]">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6 pb-2 border-b">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <BookOpen size={24} className="mr-2 text-blue-500" />
            {initialTutorial ? 'Editar Tutorial' : 'Criar Novo Tutorial'}
          </h2>
          <button 
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
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
                <FileUpload
                  onFileSelect={(file) => setCoverFile(file)}
                  onClear={() => setCoverFile(null)}
                  selectedFile={coverFile}
                  accept="image/*"
                  label="Selecione uma imagem"
                  required={false}
                />
                {tutorial.coverImage && !coverFile && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">Imagem atual:</p>
                    <div className="h-20 w-20 mt-1 overflow-hidden rounded border border-gray-300">
                      <img 
                        src={tutorial.coverImage} 
                        alt="Capa" 
                        className="h-full w-full object-cover" 
                      />
                    </div>
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
                  disabled={!isSuperAdmin}
                  required
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
                {tutorial.steps.map((step, index) => (
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
  );
};

export default TutorialForm;