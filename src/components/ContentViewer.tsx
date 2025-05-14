import React from 'react';
import { X, Clock, User, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { type ContentItem, ContentCategory } from '../types/content.types';

interface ContentViewerProps {
  content: ContentItem;
  onClose: () => void;
}

const ContentViewer: React.FC<ContentViewerProps> = ({ content, onClose }) => {
  // Obter autor do documento, se disponível
  const getAuthorName = () => {
    if (content.creator && content.creator.name) {
      return content.creator.name;
    }
    return "Equipe CZNet";
  };

  // Obter número de visualizações, com padrão simulado
  const getViewCount = () => {
    if (content.views) return content.views;
    // Simulação - na implementação real viria do banco de dados
    return Math.floor(Math.random() * 500) + 50;
  };
  
  // Função para converter texto plano em conteúdo estruturado
  const renderStructuredContent = () => {
    // Na implementação real, você teria um parser adequado ou armazenaria
    // o conteúdo já estruturado no banco de dados
    
    // Aqui estamos simulando uma estrutura baseada no conteúdo
    const text = content.textContent || '';
    if (!text) {
      return (
        <div className="text-center py-12 text-gray-500">
          <p>Conteúdo não disponível</p>
        </div>
      );
    }
    
    // Detectar se já há alguma estrutura no texto
    const hasStructure = /^\d+\.(\d+\.?)?\s/m.test(text);
    
    if (hasStructure) {
      // Se já tem estrutura, formatamos melhor
      // Esta é uma implementação simples - uma real seria mais robusta
      const lines = text.split('\n');
      return (
        <div className="space-y-4">
          {lines.map((line, index) => {
            // Detectar linha de seção principal (ex: "1. Título")
            if (/^\d+\.\s/.test(line)) {
              const [num, ...titleParts] = line.split(/\.\s/);
              const title = titleParts.join('. ');
              return (
                <div key={index} className="mb-4">
                  <div className="flex items-baseline">
                    <span className="font-bold mr-2 text-gray-800">{num}.</span>
                    <h3 className="font-bold text-xl text-gray-800">{title}</h3>
                  </div>
                </div>
              );
            }
            // Detectar linha de subseção (ex: "1.1. Subtítulo")
            else if (/^\d+\.\d+\.\s/.test(line)) {
              const [num, ...titleParts] = line.split(/\.\s/);
              const title = titleParts.join('. ');
              return (
                <div key={index} className="mb-3 ml-6">
                  <div className="flex items-baseline">
                    <span className="font-medium mr-2 text-gray-600">{num}.</span>
                    <h4 className="font-medium text-lg text-gray-600">{title}</h4>
                  </div>
                </div>
              );
            }
            // Conteúdo normal
            else {
              return (
                <p key={index} className="ml-8 text-gray-700">
                  {line}
                </p>
              );
            }
          })}
        </div>
      );
    } else {
      // Se não tem estrutura, criamos uma estrutura simulada baseada no conteúdo
      // Na implementação real, os autores poderiam formatar diretamente
      const paragraphs = text.split('\n\n');
      
      // Tentar criar uma estrutura lógica baseada nos parágrafos
      const sections = [];
      
      if (paragraphs.length <= 1) {
        // Texto muito curto, talvez apenas um parágrafo
        sections.push({
          id: "1",
          title: "Conteúdo",
          content: text
        });
      } else {
        // Mais estruturado, tentar criar seções lógicas
        if (paragraphs.length >= 4) {
          // Suficiente para criar uma estrutura completa
          sections.push({
            id: "1",
            title: "Introdução",
            content: paragraphs[0]
          });
          
          sections.push({
            id: "2",
            title: "Procedimento",
            content: ""
          });
          
          // Dividir o conteúdo do meio em subseções
          const middleParagraphs = paragraphs.slice(1, paragraphs.length - 1);
          
          middleParagraphs.forEach((para, idx) => {
            sections.push({
              id: `2.${idx + 1}`,
              title: `Etapa ${idx + 1}`,
              content: para
            });
          });
          
          sections.push({
            id: "3",
            title: "Conclusão",
            content: paragraphs[paragraphs.length - 1]
          });
        } else {
          // Estrutura mais simples
          paragraphs.forEach((para, idx) => {
            sections.push({
              id: String(idx + 1),
              title: idx === 0 ? "Introdução" : 
                     idx === paragraphs.length - 1 ? "Conclusão" : `Parte ${idx}`,
              content: para
            });
          });
        }
      }

      // Renderizar as seções estruturadas
      return (
        <div className="space-y-4">
          {sections.map(section => (
            <div key={section.id} className="mb-4">
              <div className="flex items-start">
                <span className={`font-bold mr-2 ${section.id.includes('.') ? 'text-gray-600' : 'text-gray-800'}`}>
                  {section.id}
                </span>
                <h3 className={`font-semibold ${section.id.includes('.') ? 'text-gray-600 text-md' : 'text-gray-800 text-lg'}`}>
                  {section.title}
                </h3>
              </div>
              {section.content && (
                <div className="ml-6 mt-1 text-gray-700">
                  <p>{section.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }
  };

  // Formatar a data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Obter badge do tipo de conteúdo
  const getTypeBadge = () => {
    let bgColor = 'bg-blue-100 text-blue-800';
    let label = 'Documento';
    
    // Por tipo
    if (content.category === ContentCategory.TUTORIAL || 
        content.title.toLowerCase().includes('tutorial') || 
        content.title.toLowerCase().includes('guia')) {
      bgColor = 'bg-blue-100 text-blue-800';
      label = 'Tutorial';
    } else if (content.category === ContentCategory.PROCEDURE || 
               content.title.toLowerCase().includes('procedimento') || 
               content.title.toLowerCase().includes('processo')) {
      bgColor = 'bg-green-100 text-green-800';
      label = 'Procedimento';
    } else if (content.category === ContentCategory.CONFIGURATION || 
               content.title.toLowerCase().includes('configuração') || 
               content.title.toLowerCase().includes('config')) {
      bgColor = 'bg-purple-100 text-purple-800';
      label = 'Configuração';
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Cabeçalho */}
          <div className="flex justify-between items-start mb-6 pb-4 border-b">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center mr-3">
                <span className="font-bold">D</span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">{content.title}</h2>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Metadados */}
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            {getTypeBadge()}
            
            <span className="text-sm text-gray-500 flex items-center ml-2">
              <Clock size={14} className="mr-1" />
              Atualizado em {formatDate(content.updatedAt || content.createdAt)}
            </span>
            
            <span className="text-sm text-gray-500 flex items-center ml-2">
              <User size={14} className="mr-1" />
              Autor: {getAuthorName()}
            </span>
            
            <span className="text-sm text-gray-500 flex items-center ml-2">
              <Eye size={14} className="mr-1" />
              Visualizações: {getViewCount()}
            </span>
          </div>
          
          {/* Descrição */}
          {content.description && (
            <div className="mb-6 bg-gray-50 p-4 border-l-4 border-red-500 rounded">
              <p className="text-gray-700">{content.description}</p>
            </div>
          )}
          
          {/* Conteúdo estruturado */}
          <div className="bg-white rounded-lg">
            {renderStructuredContent()}
          </div>
          
          {/* Rodapé */}
          <div className="mt-6 pt-4 border-t flex items-center justify-between">
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded flex items-center">
                <ChevronLeft size={16} className="mr-1" />
                Anterior
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded flex items-center">
                Próximo
                <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
            
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentViewer;