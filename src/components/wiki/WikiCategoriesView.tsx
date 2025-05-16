import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  ChevronRight, 
  Plus 
} from 'lucide-react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { type ContentItem } from '../../types/content.types';
import api from '../../services/api';

// Componente de card de categoria principal
interface CategoryCardProps {
  title: string;
  count: number;
  color: string;
  onClick: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ title, count, color, onClick }) => {
  return (
    <div className="flex flex-col items-center cursor-pointer" onClick={onClick}>
      <div className={`w-20 h-20 ${color} rounded-full flex items-center justify-center`}>
        <div className="text-center">
          <div className="font-bold">{title}</div>
          <div className="text-xs">{count} etapas</div>
        </div>
      </div>
      <div className="mt-2 text-center">
        <p className="text-sm text-gray-600">Clique no card {title}</p>
        <div className="flex justify-center mt-1">
          <ChevronRight size={16} className="text-blue-600" />
        </div>
      </div>
    </div>
  );
};

// Interface para categoria
interface Category {
  id: string;
  title: string;
  count: number;
  color: string;
}

// Interface para props do componente
interface WikiCategoriesViewProps {
  sectorId: string;
  onCategoryClick?: (categoryId: string) => void;
  onAddContent?: () => void;
  canEdit: boolean;
}

// Componente principal
const WikiCategoriesView: React.FC<WikiCategoriesViewProps> = ({ 
  sectorId, 
  onCategoryClick,
  onAddContent,
  canEdit 
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Gerar categorias a partir dos conteúdos
  const generateCategories = useCallback((contents: ContentItem[]) => {
    // Agrupar conteúdo por categoria
    const categoryMap = new Map<string, ContentItem[]>();
    
    contents.forEach(content => {
      // Usar a categoria se existir, ou tentar detectar do título
      let categoryName = 'Geral';
      
      if (content.category) {
        categoryName = content.category;
      } else if (content.title.toLowerCase().includes('tutorial')) {
        categoryName = 'Tutoriais';
      } else if (content.title.toLowerCase().includes('config')) {
        categoryName = 'Configurações';
      } else if (content.title.toLowerCase().includes('crm')) {
        categoryName = 'CRM';
      } else if (content.title.toLowerCase().includes('procedimento')) {
        categoryName = 'Procedimentos';
      }
      
      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, []);
      }
      
      categoryMap.get(categoryName)!.push(content);
    });
    
    // Converter mapa para array de categorias
    const categoryArray: Category[] = [];
    const colorOptions = [
      'bg-blue-200', 'bg-purple-200', 'bg-green-200', 
      'bg-yellow-200', 'bg-red-200', 'bg-indigo-200'
    ];
    
    let colorIndex = 0;
    categoryMap.forEach((items, name) => {
      categoryArray.push({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        title: name,
        count: items.length,
        color: colorOptions[colorIndex % colorOptions.length]
      });
      colorIndex++;
    });
    
    return categoryArray;
  }, []);

  // Carregar categorias
  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Obter conteúdo do setor
        const response = await api.get(`/content/sector/${sectorId}`);
        
        // Gerar categorias a partir do conteúdo
        const generatedCategories = generateCategories(response.data);
        setCategories(generatedCategories);
      } catch (err) {
        console.error('Erro ao carregar categorias:', err);
        setError('Não foi possível carregar as categorias. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    
    loadCategories();
  }, [sectorId, generateCategories]);

  // Botão para adicionar conteúdo
  const renderAddButton = () => {
    if (canEdit) {
      return (
        <button
          onClick={onAddContent}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Adicionar Categoria/Conteúdo
        </button>
      );
    }
    return null;
  };

  // Renderização principal
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">1. PÁGINA INICIAL - CATEGORIAS</h1>
      
      {/* Barra de Pesquisa */}
      <div className="mb-6 relative">
        <input
          type="text"
          placeholder="Buscar em todo o conteúdo..."
          className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
      
      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {/* Carregando */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <svg className="animate-spin h-8 w-8 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <>
          {/* Grade de categorias */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {categories.length > 0 ? (
                categories.map(category => (
                  <CategoryCard
                    key={category.id}
                    title={category.title}
                    count={category.count}
                    color={category.color}
                    onClick={() => onCategoryClick?.(category.id)}
                  />
                ))
              ) : (
                <div className="col-span-3 text-center py-8 text-gray-500">
                  <p>Nenhuma categoria encontrada para este setor.</p>
                  {renderAddButton()}
                </div>
              )}
            </div>
            
            {categories.length > 0 && renderAddButton()}
          </div>
        </>
      )}
    </div>
  );
};

export default WikiCategoriesView;