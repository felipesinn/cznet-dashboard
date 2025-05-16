// src/utils/formatters.ts

/**
 * Formata uma data para o formato local brasileiro
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

/**
 * Formata uma data incluindo o horário
 */
export const formatDateTime = (dateString: string): string => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formata o nome do papel de usuário
 */
export const formatRole = (role: string): string => {
  switch (role) {
    case 'super_admin': return 'Super Admin';
    case 'admin': return 'Administrador';
    case 'user': return 'Usuário';
    default: return role;
  }
};

/**
 * Formata o nome do setor
 */
export const formatSector = (sector: string): string => {
  switch (sector) {
    case 'suporte': return 'Suporte';
    case 'tecnico': return 'Técnico';
    case 'noc': return 'NOC';
    case 'comercial': return 'Comercial';
    case 'adm': return 'ADM';
    default: return sector;
  }
};

/**
 * Calcula o tempo de leitura aproximado
 */
export const calculateReadingTime = (text: string): number => {
  const wordsPerMinute = 200;
  const wordCount = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
};