// src/hooks/useContent.ts
import { useState, useEffect, useCallback } from 'react';
import type { ContentItem } from '../types/content.types';
import type { SectorType } from '../types/common.types';
import { contentService } from '../services/content.service';

export const useContent = (sector?: SectorType, type?: string) => {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadContent = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log(`Carregando conteúdo: setor=${sector}, tipo=${type}, trigger=${refreshTrigger}`);
      let response;
      
      if (type && type !== 'all' && sector) {
        // Buscar por tipo e setor
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        response = await contentService.getContentByType(type as any, sector);
      } else if (sector) {
        // Buscar apenas por setor
        response = await contentService.getContentBySector(sector);
      } else {
        // Buscar todos
        response = await contentService.getAllContent();
      }
      
      console.log(`Conteúdos carregados: ${response.length}`);
      setContents(response);
    } catch (err) {
      console.error('Erro ao carregar conteúdo:', err);
      setError('Não foi possível carregar o conteúdo. Por favor, tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }, [sector, type, refreshTrigger]); // Importante: refreshTrigger como dependência

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const refresh = useCallback(() => {
    console.log("Disparando refresh de conteúdo");
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return { 
    contents, 
    loading, 
    error, 
    refresh,
    forceRefresh: refresh, // Alias mais explícito
    removeFromState: (id: string | number) => {
      // Remove localmente sem esperar pela API
      console.log(`Removendo ID ${id} do estado local`);
      setContents(prev => prev.filter(content => 
        String(content.id) !== String(id)
      ));
    }
  };
};