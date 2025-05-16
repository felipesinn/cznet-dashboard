// src/utils/api.utils.ts
import api from '../services/api';

/**
 * Função utilitária para excluir conteúdo com verificações detalhadas
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function deleteContentSafely(id: any): Promise<{ success: boolean; message: string }> {
  try {
    // Converte ID para o formato correto se necessário
    const contentId = typeof id === 'object' ? id.id || id._id : id;
    
    // Log para diagnóstico
    console.log('Excluindo conteúdo com ID:', contentId, 'Tipo:', typeof contentId);
    
    // Tenta a exclusão com diferentes formatos de ID para lidar com possíveis incompatibilidades
    let response;
    try {
      // Tenta primeiro com o ID original
      response = await api.delete(`/content/${contentId}`);
    } catch (innerError) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (innerError instanceof Error && (innerError as any).response?.status === 404) {
        // Se não encontrou, tenta com toString()
        console.log('Tentando formato alternativo para ID');
        response = await api.delete(`/content/${String(contentId)}`);
      } else {
        throw innerError;
      }
    }
    
    console.log('Resposta da exclusão:', response);
    
    return { 
      success: true, 
      message: response.data?.message || 'Conteúdo excluído com sucesso' 
    };
  } catch (error) {
    console.error('Erro detalhado na exclusão:', error);
    
    // Extrair mensagem de erro para usuário
    let errorMessage = 'Não foi possível excluir o conteúdo.';
    
    if (error instanceof Error && 'response' in error && error.response) {
      // Erro da API
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const status = (error as any).response.status;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiMessage = (error as any).response.data?.message;
      
      switch (status) {
        case 401:
          errorMessage = 'Você não tem permissão para excluir este conteúdo.';
          break;
        case 403:
          errorMessage = 'Acesso negado. Você não tem permissões suficientes.';
          break;
        case 404:
          errorMessage = 'Conteúdo não encontrado. Ele pode já ter sido excluído.';
          break;
        case 500:
          errorMessage = 'Erro no servidor. Tente novamente mais tarde.';
          break;
        default:
          errorMessage = apiMessage || errorMessage;
      }
    } else if (error instanceof Error && 'request' in error) {
      // Erro de rede
      errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
    }
    
    return { success: false, message: errorMessage };
  }
}