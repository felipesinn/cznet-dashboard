// src/components/sections/ProcedureSection.tsx
import React from 'react';
import { FileText, Plus, ChevronRight } from 'lucide-react';
import type { ContentItem } from '../../types/content.types';

interface ProcedimentoCardProps {
  procedimento: ContentItem;
  onView: (content: ContentItem) => void;
}

const ProcedimentoCard: React.FC<ProcedimentoCardProps> = ({ procedimento, onView }) => {
  // Determinar cor de cabeçalho com base no tipo
  const getHeaderColor = () => {
    const type = procedimento.type;
    switch (type) {
      case "text": return "bg-blue-100 text-blue-800";
      case "title": return "bg-green-100 text-green-800";
      case "photo": return "bg-purple-100 text-purple-800";
      case "video": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Contar número de passos (simulação)
  const getStepsCount = () => {
    if (procedimento.complexity) return procedimento.complexity;
    const text = procedimento.textContent || "";
    return Math.max(3, Math.min(20, Math.floor(text.length / 50)));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className={`p-3 ${getHeaderColor()} flex justify-between items-center`}>
        <h3 className="font-medium text-sm truncate">{procedimento.title}</h3>
      </div>
      <div className="p-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">
            {getStepsCount()} passos numerados
          </span>
          <button
            onClick={() => onView(procedimento)}
            className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition-colors"
          >
            Abrir
          </button>
        </div>
      </div>
    </div>
  );
};

interface ProcedureSectionProps {
  procedures: ContentItem[];
  title?: string;
  showAddButton?: boolean;
  onAddContent?: () => void;
  onViewContent: (content: ContentItem) => void;
  maxDisplay?: number;
}

const ProcedureSection: React.FC<ProcedureSectionProps> = ({
  procedures,
  title = "Procedimentos Operacionais",
  showAddButton = false,
  onAddContent,
  onViewContent,
  maxDisplay = 8
}) => {
  // Se não tem procedimentos, não renderiza
  if (procedures.length === 0) return null;
  
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <FileText size={20} className="text-red-600 mr-2" />
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

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {procedures.slice(0, maxDisplay).map((procedimento) => (
          <ProcedimentoCard
            key={procedimento.id}
            procedimento={procedimento}
            onView={() => onViewContent(procedimento)}
          />
        ))}
      </div>

      {procedures.length > maxDisplay && (
        <div className="mt-4 text-right">
          <button className="text-red-600 hover:text-red-700 flex items-center ml-auto">
            <span>Ver mais procedimentos</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProcedureSection;