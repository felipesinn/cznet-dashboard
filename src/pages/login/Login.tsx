import React, { useState } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../../contexts/AuthContext'; 
// import Logo from "../../assets/img/CZNet-Branco-Vermelho-Copia.png";
import axios, { AxiosError } from 'axios';

// Interface para o erro da API
interface ApiError {
  message: string;
  status?: number;
  [key: string]: unknown;
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
      console.log("Tentando fazer login com:", { email });
      
      // Usar o login do AuthContext
      await login({ email, password });              
      
      // Redirecionar com base na role do usuário
      const userStr = localStorage.getItem('user');       
      if (userStr) {         
        const user = JSON.parse(userStr);
        
        // MODIFICAÇÃO: Definir um setor padrão se estiver indefinido
        if (!user.sector) {
          user.sector = 'suporte';
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        console.log("Login bem-sucedido, redirecionando usuário:", { 
          role: user.role, 
          sector: user.sector 
        });
        
        // Verificar a role do usuário e redirecionar adequadamente
        if (user.role === 'super_admin') {  
          console.log("Redirecionando super_admin para:", '/admin/dashboard');
          navigate('/admin/dashboard');
        } else if (user.role === 'admin') {
          console.log("Redirecionando admin para:", `/${user.sector}`);
          navigate(`/${user.sector}`);
        } else {
          console.log("Redirecionando usuário comum para:", `/${user.sector}`);
          navigate(`/${user.sector}`);
        }       
      } else {
        console.error("Usuário logado, mas não encontrado no localStorage");
        setError('Erro ao obter informações do usuário');
      }
    } catch (error) {  
      console.error("Erro durante o login:", error);
     
      // Tratar o erro com tipagem adequada
      let errorMessage = 'Erro ao fazer login.';
      
      // Verificar se é um erro do Axios
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiError>;
        // Tentar extrair a mensagem de erro da resposta da API
        errorMessage = axiosError.response?.data?.message || errorMessage;
      } else if (error instanceof Error) {
        // Se for um erro genérico do JavaScript
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
      sector: "suporte", // Definir um setor padrão
      permissions: ["all"]
    };
    
    // Salvar no localStorage
    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(superAdminUser));
    
    console.log("Usuário super_admin criado localmente, redirecionando...");
    navigate('/admin/dashboard');
  };

  return (     
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">       
      {/* <img src={Logo} alt="CZNet Logo" className="w-36 shadow-md m-6 py-2" /> */}
      
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