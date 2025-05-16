// import React, { useState, useRef } from 'react';
// import { X, Plus, Image } from 'lucide-react';
// import { type ContentItem } from '../../types/content.types';

// interface ContentAdditionFormProps {
//   article: ContentItem;
//   onClose: () => void;
//   onSubmit: (data: FormData) => Promise<void>;
// }

// const ContentAdditionForm: React.FC<ContentAdditionFormProps> = ({
//   article,
//   onClose,
//   onSubmit
// }) => {
//   const [title, setTitle] = useState('');
//   const [content, setContent] = useState('');
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [previewUrl, setPreviewUrl] = useState<string | null>(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState<string | null>(null);
  
//   const fileInputRef = useRef<HTMLInputElement>(null);
  
//   // Manipular seleção de arquivo
//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       const file = e.target.files[0];
//       setSelectedFile(file);
      
//       // Criar URL de preview para imagens
//       if (file.type.startsWith('image/')) {
//         const url = URL.createObjectURL(file);
//         setPreviewUrl(url);
        
//         // Limpar URL quando componente for desmontado
//         return () => URL.revokeObjectURL(url);
//       }
//     }
//   };
  
//   // Limpar arquivo selecionado
//   const clearFile = () => {
//     if (previewUrl) {
//       URL.revokeObjectURL(previewUrl);
//     }
//     setSelectedFile(null);
//     setPreviewUrl(null);
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//   };
  
//   // Enviar formulário
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     // Validação
//     if (!content.trim()) {
//       setError('O conteúdo é obrigatório');
//       return;
//     }
    
//     setIsSubmitting(true);
//     setError(null);
    
//     try {
//       // Criar FormData para envio
//       const formData = new FormData();
      
//       // Dados básicos
//       formData.append('articleId', String(article.id));
//       formData.append('title', title);
//       formData.append('content', content);
      
//       // Adicionar arquivo se existir
//       if (selectedFile) {
//         formData.append('file', selectedFile);
//       }
      
//       // Enviar dados
//       await onSubmit(formData);
      
//       // Fechar modal após sucesso
//       onClose();
//     } catch (err) {
//       console.error('Erro ao adicionar conteúdo:', err);
//       setError('Ocorreu um erro ao adicionar o conteúdo. Tente novamente.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };
  
//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
//         <div className="p-6">
//           <div className="flex justify-between items-center mb-6 pb-2 border-b">
//             <h2 className="text-xl font-semibold text-gray-800">
//               Adicionar Conteúdo: {article.title}
//             </h2>
//             <button 
//               onClick={onClose}
//               className="text-gray-500 hover:text-gray-700"
//             >
//               <X size={20} />
//             </button>
//           </div>
          
//           {error && (
//             <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
//               <p>{error}</p>
//             </div>
//           )}
          
//           <form onSubmit={handleSubmit}>
//             {/* Título da adição */}
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Título da Adição (opcional)
//               </label>
//               <input
//                 type="text"
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//                 className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="Ex: Novo método para consulta ONU"
//               />
//             </div>
            
//             {/* Conteúdo da adição */}
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Conteúdo*
//               </label>
//               <textarea
//                 value={content}
//                 onChange={(e) => setContent(e.target.value)}
//                 rows={8}
//                 className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="Adicione o novo conteúdo aqui. Ele aparecerá abaixo do conteúdo original."
//                 required
//               />
//               <p className="text-xs text-gray-500 mt-1">
//                 Para adicionar listas numeradas, comece as linhas com "1. ", "2. ", etc.
//               </p>
//             </div>
            
//             {/* Upload de imagem */}
//             <div className="mb-6">
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Adicionar Imagem (opcional)
//               </label>
              
//               {previewUrl ? (
//                 <div className="relative mb-4">
//                   <img
//                     src={previewUrl}
//                     alt="Preview"
//                     className="max-h-40 rounded-md border border-gray-200"
//                   />
//                   <button
//                     type="button"
//                     onClick={clearFile}
//                     className="absolute top-2 right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200"
//                   >
//                     <X size={16} />
//                   </button>
//                 </div>
//               ) : (
//                 <div 
//                   onClick={() => fileInputRef.current?.click()}
//                   className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50"
//                 >
//                   <Image className="mx-auto h-12 w-12 text-gray-400" />
//                   <div className="text-sm text-gray-600">
//                     <span className="font-medium text-blue-600">Clique para fazer upload</span> ou arraste e solte
//                   </div>
//                   <p className="text-xs text-gray-500">
//                     PNG, JPG, GIF até 10MB
//                   </p>
//                   <input
//                     type="file"
//                     ref={fileInputRef}
//                     onChange={handleFileChange}
//                     className="hidden"
//                     accept="image/*"
//                   />
//                 </div>
//               )}
//             </div>
            
//             {/* Mensagem explicativa */}
//             <div className="bg-blue-50 p-4 rounded-md mb-6">
//               <p className="text-sm text-blue-700">
//                 <strong>Importante:</strong> Esta adição será exibida abaixo do conteúdo original, 
//                 preservando a documentação existente. Cada adição é numerada e datada automaticamente.
//               </p>
//             </div>
            
//             {/* Botões de ação */}
//             <div className="flex justify-end space-x-2">
//               <button
//                 type="button"
//                 onClick={onClose}
//                 className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
//                 disabled={isSubmitting}
//               >
//                 Cancelar
//               </button>
//               <button
//                 type="submit"
//                 className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
//                 disabled={isSubmitting}
//               >
//                 {isSubmitting ? (
//                   <>
//                     <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                     Adicionando...
//                   </>
//                 ) : (
//                   <>
//                     <Plus size={18} className="mr-1" />
//                     Adicionar Conteúdo
//                   </>
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ContentAdditionForm;

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService } from '../../services/auth.service';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { User, LoginCredentials, AuthState } from '../../types/auth.types';

interface AuthContextType {
  authState: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialState);
  
  useEffect(() => {
    const checkAuth = async () => {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      try {
        const initialState = authService.getInitialAuthState();
        setAuthState(initialState);
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          loading: false,
          error: 'Erro ao verificar autenticação'
        });
      }
    };
    
    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await authService.login(credentials);
      
      const user = authService.getCurrentUser();
      
      setAuthState({
        user,
        isAuthenticated: true,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: 'Credenciais inválidas'
      });
      
      throw error;
    }
  };

  const logout = (): void => {
    authService.logout();
    
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null
    });
  };

  return (
    <AuthContext.Provider 
      value={{ 
        authState, 
        login, 
        logout,
        isLoading: authState.loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;