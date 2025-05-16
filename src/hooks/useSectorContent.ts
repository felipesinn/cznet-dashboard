import { useState, useEffect, useCallback } from 'react';
import { contentService } from '../services/content.service';
import { type ContentItem, type ContentType, ContentCategory } from '../types/content.types';
import type { SectorType } from '../types/common.types';

export const useSectorContent = (sector: SectorType) => {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Buscar todos os conteúdos do setor
 const fetchContents = useCallback(async () => {
  setLoading(true);
  setError(null);
  
  try {
    console.log(`Buscando conteúdos do setor: ${sector}`);
    const response = await contentService.getContentBySector(sector);
    console.log('Conteúdos carregados:', response);
    setContents(response);
  } catch (err) {
    console.error('Erro ao carregar conteúdos:', err);
    setError('Não foi possível carregar os conteúdos. Por favor, tente novamente.');
  } finally {
    setLoading(false);
  }
}, [sector]);
  // Buscar conteúdo por ID
  const getContentById = useCallback(async (id: string): Promise<ContentItem | null> => {
    try {
      return await contentService.getContentById(id);
    } catch (err) {
      console.error('Erro ao buscar conteúdo por ID:', err);
      return null;
    }
  }, []);
  
  // Filtrar conteúdos por tipo
  const getContentsByType = useCallback((type: ContentType): ContentItem[] => {
    return contents.filter(content => content.type === type);
  }, [contents]);
  
  // Filtrar conteúdos por categoria
  const getContentsByCategory = useCallback((category: string): ContentItem[] => {
  console.log(`Filtrando por categoria: ${category}`);
  
  if (category === 'tutorials') {
    // Inclua conteúdos do tipo 'text' mesmo se category for null
    return contents.filter(content => 
      content.category === 'tutorial' || 
      content.title.toLowerCase().includes('tutorial') ||
      content.title.toLowerCase().includes('guia') ||
      // Adicionar esta condição para capturar mais conteúdos:
      (content.type === 'text' && !content.category)
    );
  } 
  
  if (category === 'procedures') {
    return contents.filter(content => 
      content.category === 'procedure' || 
      content.title.toLowerCase().includes('procedimento') ||
      content.title.toLowerCase().includes('processo') ||
      // Adicionar esta condição para capturar mais conteúdos:
      (content.type === 'title' && !content.category)
    );
  }
  
  // Retornar todos se não for nenhuma categoria específica
  return contents;
}, [contents]);
  
  // Buscar conteúdos populares (com base na prioridade ou visualizações)
  const getPopularContents = useCallback((limit: number = 5): ContentItem[] => {
    return [...contents]
      .sort((a, b) => {
        // Primeiro por prioridade (maior primeiro)
        const priorityDiff = (b.priority || 0) - (a.priority || 0);
        if (priorityDiff !== 0) return priorityDiff;
        
        // Depois por visualizações (maior primeiro)
        return (b.views || 0) - (a.views || 0);
      })
      .slice(0, limit);
  }, [contents]);
  
  // Pesquisar conteúdos
  const searchContents = useCallback((term: string): ContentItem[] => {
    if (!term.trim()) return contents;
    
    const searchTerm = term.toLowerCase().trim();
    return contents.filter(content => 
      content.title.toLowerCase().includes(searchTerm) || 
      (content.description?.toLowerCase() || '').includes(searchTerm) ||
      (content.textContent?.toLowerCase() || '').includes(searchTerm)
    );
  }, [contents]);
  
  // Carregar conteúdos ao montar o componente
  useEffect(() => {
    fetchContents();
  }, [fetchContents]);
  
  return {
    contents,
    loading,
    error,
    fetchContents,
    getContentById,
    getContentsByType,
    getContentsByCategory,
    getPopularContents,
    searchContents
  };
};