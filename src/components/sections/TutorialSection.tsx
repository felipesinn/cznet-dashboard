// src/components/sections/TutorialSection.tsx
import React from 'react';
import { Book, Plus, ChevronRight, Clock } from 'lucide-react';
import type { ContentItem } from '../../types/content.types';
import { formatDate } from '../../utils/formatters';

interface TutorialCardProps {
  tutorial: ContentItem;
  priority: number;
  onView: (content: ContentItem) => void;
}

const TutorialCard: React.FC<TutorialCardProps> = ({ tutorial, priority, onView }) => {
  // Determinar cor de fundo com base no tipo ou categoria
  const getBgGradient = () => {
    switch (priority % 4) {
      case 0: return "from-blue-500 to-blue-700";
      case 1: return "from-purple-500 to-purple-700";
      case 2: return "from-green-500 to-green-700";
      case 3: return "from-orange-500 to-orange-700";
      default: return "from-red-500 to-red-700";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className={`bg-gradient-to-r ${getBgGradient()} p-3 text-white flex justify-between items-center`}>
        <div className="flex items-center">
          <div className="w-8 h-8 bg-white text-gray-800 rounded-full flex items-center justify-center font-bold mr-2">
            {priority}
          </div>
          <h3 className="font-semibold truncate">{tutorial.title}</h3>
        </div>
      </div>
      <div className="p-4">
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {tutorial.description || "Tutorial de suporte técnico"}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 flex items-center">
            <Clock size={14} className="mr-1" />
            Atualizado em {formatDate(tutorial.updatedAt || tutorial.createdAt)}
          </span>
          <button
            onClick={() => onView(tutorial)}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
          >
            Ver Tutorial
          </button>
        </div>
      </div>
    </div>
  );
};

interface TutorialSectionProps {
  tutorials: ContentItem[];
  title?: string;
  showAddButton?: boolean;
  onAddContent?: () => void;
  onViewContent: (content: ContentItem) => void;
  maxDisplay?: number;
}

const TutorialSection: React.FC<TutorialSectionProps> = ({
  tutorials,
  title = "Tutoriais Populares",
  showAddButton = false,
  onAddContent,
  onViewContent,
  maxDisplay = 6
}) => {
  // Se não tem tutoriais, não renderiza
  if (tutorials.length === 0) return null;
  
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <Book size={20} className="text-red-600 mr-2" />
          {title}
        </h2>

        {showAddButton && onAddContent && (
          <button
            onClick={onAddContent}
            className="flex items-center text-red-600 hover:text-red-700"
          >
            <Plus size={18} className="mr-1" />
            <span className="text-sm">Adicionar</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tutorials.slice(0, maxDisplay).map((tutorial, index) => (
          <TutorialCard
            key={tutorial.id}
            tutorial={tutorial}
            priority={tutorial.priority || index + 1}
            onView={() => onViewContent(tutorial)}
          />
        ))}
      </div>

      {tutorials.length > maxDisplay && (
        <div className="mt-4 text-right">
          <button className="text-red-600 hover:text-red-700 flex items-center ml-auto">
            <span>Ver mais tutoriais</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default TutorialSection;