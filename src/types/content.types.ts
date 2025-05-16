// src/types/content.types.ts
// src/types/content.types.ts
import type { SectorType } from './common.types';

// Tipos de conteúdo
export const ContentType = {
  PHOTO: 'photo',
  VIDEO: 'video',
  TEXT: 'text',
  TITLE: 'title',
  TUTORIAL: 'tutorial'
} as const;

export type ContentType = typeof ContentType[keyof typeof ContentType];

// Tipos de categoria
export const ContentCategory = {
  TUTORIAL: 'tutorial',
  PROCEDURE: 'procedure',
  CONFIGURATION: 'configuration',
  GUIDE: 'guide'
} as const;

export type ContentCategory = typeof ContentCategory[keyof typeof ContentCategory];

// Interface para criador/editor
export interface ContentCreator {
  id: string;
  name: string;
  email: string;
}

// Interface para item de conteúdo
export interface ContentItem {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  steps: boolean | string | any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  images: boolean | string[] | any[];
  id: string | number;
  title: string;
  description?: string;
  type: ContentType;
  category?: ContentCategory;
  sector: SectorType;
  priority?: number;
  complexity?: number;
  filePath?: string;
  textContent?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mediaItems?: any[];
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  creator?: ContentCreator;
  updater?: ContentCreator;
  views?: number;
}

// Interface para criar novo conteúdo
export interface CreateContentData {
  title: string;
  description?: string;
  type: ContentType;
  category?: ContentCategory;
  sector: SectorType;
  priority?: number;
  complexity?: number;
  file?: File;
  textContent?: string;
}

// Interface para atualizar conteúdo existente
export interface UpdateContentData {
  title?: string;
  description?: string;
  sector?: SectorType;
  priority?: number;
  complexity?: number;
  category?: ContentCategory;
  file?: File;
  textContent?: string;
}