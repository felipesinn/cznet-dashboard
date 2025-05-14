import React, { useState } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../../contexts/AuthContext'; 
import axios, { AxiosError } from 'axios';

interface ApiError {
  message: string;
  status?: number;
}

export default function Login() {   
  const navigate = useNavigate();   
  const { login, isLoading } = useAuth();   
  const [email, setEmail] = useState('');   
  const [password, setPassword] = useState('');   
  const [error, setError] = useState('');    

  const handleSubmit = async (event: React.FormEvent) => {     
    event.preventDefault();     
    setError('');          
    
    try {       
      // Usar o login do AuthContext
      await login({ email, password });              
      
      // Redirecionar com base na role do usuário
      const userStr = localStorage.getItem('user');       
      if (userStr) {         
        const user = JSON.parse(userStr);
        
        // Definir um setor padrão se estiver indefinido
        if (!user.sector) {
          user.sector = 'suporte';
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        // Verificar a role do usuário e redirecionar adequadamente
        if (user.role === 'super_admin') {  
          navigate('/admin/dashboard');
        } else if (user.role === 'admin') {
          navigate(`/${user.sector}`);
        } else {
          navigate(`/${user.sector}`);
        }       
      } else {
        setError('Erro ao obter informações do usuário');
      }
    } catch (error) {  
      let errorMessage = 'Erro ao fazer login.';
      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiError>;
        errorMessage = axiosError.response?.data?.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    }   
  };
  
  // Função para criar um usuário super_admin diretamente no localStorage (bypass da API)
  const createSuperAdminLocally = () => {
    // Criar um token fictício (apenas para teste)
    const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlN1cGVyIEFkbWluIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    
    // Criar dados de usuário com role super_admin
    const superAdminUser = {
      id: 999,
      name: "Super Admin",
      email: "superadmin@example.com",
      role: "super_admin",
      sector: "suporte",
      permissions: ["all"]
    };
    
    // Salvar no localStorage
    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(superAdminUser));
    
    navigate('/admin/dashboard');
  };

  return (     
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">       
      <div className="w-36 h-36 flex items-center justify-center bg-red-600 text-white text-4xl font-bold rounded-full shadow-md m-6">
        CZ
      </div>
      
      <form         
        onSubmit={handleSubmit}         
        className="bg-white p-6 rounded-lg shadow-md w-96"       
      >         
        {error && (           
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">             
            {error}           
          </div>         
        )}         
        
        <input           
          type="email"           
          placeholder="Email"           
          value={email}           
          onChange={(e) => setEmail(e.target.value)}           
          className="w-full p-4 mb-5 border rounded-md"           
          required         
        />         
        
        <input           
          type="password"           
          placeholder="Senha"           
          value={password}           
          onChange={(e) => setPassword(e.target.value)}           
          className="w-full p-4 mb-5 border rounded-md"           
          required         
        />         
        
        <button           
          type="submit"           
          className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition duration-300 flex justify-center items-center"           
          disabled={isLoading}         
        >           
          {isLoading ? (             
            <span className="flex items-center">               
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">                 
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>                 
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>               
              </svg>               
              Entrando...             
            </span>           
          ) : (             
            "Entrar"           
          )}         
        </button>
        
        {/* Botão de desenvolvimento - REMOVER EM PRODUÇÃO */}
        <button
          type="button"
          onClick={createSuperAdminLocally}
          className="w-full mt-4 bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition duration-300"
        >
          Criar Super Admin Local
        </button>
      </form>     
    </div>   
  ); 
}