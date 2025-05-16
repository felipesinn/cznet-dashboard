// src/utils/ui.utils.ts
// src/utils/ui.utils.ts
import type { ContentItem } from '../types/content.types';

/**
 * Força uma atualização limpando o cache local
 */
export function triggerReload(): void {
  // Limpar qualquer cache local 
  // Pode ser necessário adaptar conforme sua implementação
  localStorage.removeItem('contentCache');
  
  // Força atualização para casos críticos
  setTimeout(() => {
    window.location.reload();
  }, 500);
}

/**
 * Solução temporária para remover item da DOM
 */
export function removeElementById(id: string | number): void {
  const elementId = `content-item-${id}`;
  const element = document.getElementById(elementId);
  
  if (element) {
    console.log(`Removendo elemento DOM: ${elementId}`);
    element.style.display = 'none';
  }
}

/**
 * Remove item localmente da lista de conteúdos
 */
export function removeItemLocally(
  contents: ContentItem[],
  idToRemove: string | number
): ContentItem[] {
  return contents.filter(item => String(item.id) !== String(idToRemove));
}