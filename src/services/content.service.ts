// src/services/content.service.ts
import api from './api';
import type { 
  CreateContentData,
  ContentItem,
  SectorType
} from '../types/auth.types';

export const contentService = {
  // Buscar todos os conteúdos
  getAllContent: async (sector?: SectorType): Promise<ContentItem[]> => {
    const params = sector ? { sector } : {};
    const response = await api.get<ContentItem[]>('/content', { params });
    return response.data;
  },
  
  // Buscar conteúdo por ID
  getContentById: async (id: string): Promise<ContentItem> => {
    const response = await api.get<ContentItem>(`/content/${id}`);
    return response.data;
  },
  
  // Buscar conteúdo por tipo
  getContentByType: async (type: ContentItem, sector?: SectorType): Promise<ContentItem[]> => {
    const params = sector ? { sector } : {};
    const response = await api.get<ContentItem[]>(`/content/type/${type}`, { params });
    return response.data;
  },
  
  // Buscar conteúdo por setor
  getContentBySector: async (sector: SectorType): Promise<ContentItem[]> => {
    const response = await api.get<ContentItem[]>(`/content/sector/${sector}`);
    return response.data;
  },
  
  // Criar novo conteúdo
  createContent: async (data: CreateContentData): Promise<ContentItem> => {
    // Usar FormData para enviar arquivos
    const formData = new FormData();
    
    // Adicionar campos ao FormData
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    formData.append('type', data.type);
    formData.append('sector', data.sector);
    
    if (data.textContent) formData.append('textContent', data.textContent);
    if (data.file) formData.append('file', data.file);
    
    const response = await api.post<ContentItem>('/content', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  },
  
  // Atualizar conteúdo existente
  updateContent: async (id: string, data: CreateContentData): Promise<ContentItem> => {
    // Usar FormData para enviar arquivos
    const formData = new FormData();
    
    // Adicionar campos ao FormData
    if (data.title) formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.sector) formData.append('sector', data.sector);
    if (data.textContent) formData.append('textContent', data.textContent);
    if (data.file) formData.append('file', data.file);
    
    const response = await api.put<ContentItem>(`/content/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  },
  
  // Excluir conteúdo
  deleteContent: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/content/${id}`);
    return response.data;
  },
  
  // Obter URL para o arquivo
  getFileUrl: (filePath: string): string => {
    // Construir a URL para o arquivo no servidor
    // Como o arquivo está salvo na pasta 'uploads', precisamos acessar via API
    return `${api.defaults.baseURL}/uploads/${filePath}`;
  }
};