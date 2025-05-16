// src/services/content.service.ts
import api from './api';
import type { 
  CreateContentData,
  ContentItem,
  UpdateContentData,
  ContentType
} from '../types/content.types';
import type { SectorType } from '../types/common.types';

class ContentService {
  async getAllContent(sector?: SectorType): Promise<ContentItem[]> {
    const params = sector ? { sector } : {};
    const response = await api.get<ContentItem[]>('/content', { params });
    return response.data;
  }
  
  async getContentById(id: string): Promise<ContentItem> {
    const response = await api.get<ContentItem>(`/content/${id}`);
    return response.data;
  }
  
  async getContentByType(type: ContentType, sector?: SectorType): Promise<ContentItem[]> {
    const params = sector ? { sector } : {};
    const response = await api.get<ContentItem[]>(`/content/type/${type}`, { params });
    return response.data;
  }
  
  async getContentBySector(sector: SectorType): Promise<ContentItem[]> {
    const response = await api.get<ContentItem[]>(`/content/sector/${sector}`);
    return response.data;
  }
  
  async createContent(data: CreateContentData): Promise<ContentItem> {
    const formData = this.prepareFormData(data);
    
    const response = await api.post<ContentItem>('/content', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  }
  
  async updateContent(id: string, data: UpdateContentData): Promise<ContentItem> {
    const formData = this.prepareFormData(data);
    
    const response = await api.put<ContentItem>(`/content/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  }
  
  async deleteContent(id: string | number): Promise<boolean> {
  try {
    console.log("Excluindo conteúdo ID:", id);
    
    // Usar o endpoint correto com ID convertido para string
    const response = await api.delete(`/content/${id}`);
    
    // Verificar resposta
    if (response.status === 200) {
      console.log("Exclusão bem-sucedida, resposta:", response.data);
      return true;
    } 
    return false;
  } catch (error) {
    console.error("Erro ao excluir conteúdo:", error);
    throw error;
  }
}
  
  getFileUrl(filePath: string): string {
    return `${api.defaults.baseURL}/uploads/${filePath}`;
  }
  
  private prepareFormData(data: CreateContentData | UpdateContentData): FormData {
    const formData = new FormData();
    
    // Adicionar campos ao FormData, apenas os definidos
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'file' && value instanceof File) {
        formData.append('file', value);
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    
    return formData;
  }
}

export const contentService = new ContentService();