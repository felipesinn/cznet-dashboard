// src/components/ui/Badge.tsx
import React from 'react';
import { type ContentItem, ContentType, ContentCategory } from '../../types/content.types';

interface BadgeProps {
  variant: string;
  label: string;
  size?: 'sm' | 'md' | 'lg';
}

// Mapeamento de variantes para classes CSS
const variantMap: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-800',
  green: 'bg-green-100 text-green-800',
  red: 'bg-red-100 text-red-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  purple: 'bg-purple-100 text-purple-800',
  gray: 'bg-gray-100 text-gray-800',
  primary: 'bg-red-100 text-red-800',
};

// Mapeamento de tamanhos
const sizeMap = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-0.5',
  lg: 'text-base px-3 py-1'
};

export const Badge: React.FC<BadgeProps> = ({ 
  variant, 
  label,
  size = 'sm'
}) => {
  const classes = variantMap[variant] || variantMap.gray;
  const sizeClass = sizeMap[size];
  
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${classes} ${sizeClass}`}>
      {label}
    </span>
  );
};

// Utilitário para obter a badge com base no tipo de conteúdo
export const getContentTypeBadge = (content: ContentItem) => {
  // Determinar variante com base no tipo
  let variant = 'gray';
  let label = 'Documento';
  
  if (content.type === ContentType.PHOTO) {
    variant = 'purple';
    label = 'Foto';
  } else if (content.type === ContentType.VIDEO) {
    variant = 'green';
    label = 'Vídeo';
  } else if (content.type === ContentType.TEXT) {
    variant = 'blue';
    label = 'Texto';
  } else if (content.type === ContentType.TITLE) {
    variant = 'yellow';
    label = 'Título';
  }
  
  // Sobrescrever se for um tutorial, procedimento ou configuração
  if (content.category === ContentCategory.TUTORIAL || 
      content.title.toLowerCase().includes('tutorial') || 
      content.title.toLowerCase().includes('guia')) {
    variant = 'blue';
    label = 'Tutorial';
  } else if (content.category === ContentCategory.PROCEDURE || 
             content.title.toLowerCase().includes('procedimento') || 
             content.title.toLowerCase().includes('processo')) {
    variant = 'green';
    label = 'Procedimento';
  } else if (content.category === ContentCategory.CONFIGURATION || 
             content.title.toLowerCase().includes('configuração') || 
             content.title.toLowerCase().includes('config')) {
    variant = 'purple';
    label = 'Configuração';
  }
  
  return { variant, label };
};

export default Badge;