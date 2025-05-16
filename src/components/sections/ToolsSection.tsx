// src/components/sections/ToolsSection.tsx
import React from 'react';
import { Settings, Zap, FileText, Search, ChevronRight } from 'lucide-react';

interface ToolCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  onClick: () => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ icon, title, description, color, onClick }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center mb-3">
        <div className={`w-10 h-10 ${color} rounded-full flex items-center justify-center mr-3`}>
          {icon}
        </div>
        <h3 className="font-medium">{title}</h3>
      </div>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <button
        onClick={onClick}
        className={`text-${color.split('-')[0]}-600 text-sm hover:text-${color.split('-')[0]}-700 flex items-center`}
      >
        <span>Acessar</span>
        <ChevronRight size={14} className="ml-1" />
      </button>
    </div>
  );
};

const ToolsSection: React.FC = () => {
  // Dados das ferramentas
  const tools = [
    {
      id: 'diagnostico',
      icon: <Zap size={20} />,
      title: 'Diagnóstico Rápido',
      description: 'Ferramentas para identificação e solução rápida de problemas comuns.',
      color: 'bg-blue-100 text-blue-600',
      onClick: () => console.log('Diagnóstico Rápido')
    },
    {
      id: 'templates',
      icon: <FileText size={20} />,
      title: 'Templates de Atendimento',
      description: 'Modelos de respostas para os tipos de atendimento mais comuns.',
      color: 'bg-green-100 text-green-600',
      onClick: () => console.log('Templates de Atendimento')
    },
    {
      id: 'conhecimento',
      icon: <Search size={20} />,
      title: 'Base de Conhecimento',
      description: 'Acesse a biblioteca completa de soluções e documentações.',
      color: 'bg-purple-100 text-purple-600',
      onClick: () => console.log('Base de Conhecimento')
    }
  ];

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <Settings size={20} className="text-red-600 mr-2" />
          Ferramentas e Recursos
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tools.map(tool => (
          <ToolCard
            key={tool.id}
            icon={tool.icon}
            title={tool.title}
            description={tool.description}
            color={tool.color}
            onClick={tool.onClick}
          />
        ))}
      </div>
    </div>
  );
};

export default ToolsSection;