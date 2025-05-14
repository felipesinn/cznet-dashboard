export enum ContentType {
  PHOTO = 'photo',
  VIDEO = 'video',
  TEXT = 'text',
  TITLE = 'title',
  TUTORIAL = 'tutorial'
}

export type SectorType = 'suporte' | 'tecnico' | 'noc' | 'comercial' | 'adm';

export interface ContentCreator {
  id: string;
  name: string;
  email: string;
}

export interface ContentItem {
  id: string;
  title: string;
  description?: string;
  type: ContentType;
  sector: SectorType;
  filePath?: string;
  textContent?: string;
  mediaItems?: any[];
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  creator: ContentCreator;
  updater?: ContentCreator;
}