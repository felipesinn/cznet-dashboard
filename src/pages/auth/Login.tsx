import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../../contexts/AuthContext'; 
import Spinner from '../../components/ui/Spinner';
import Logo from '../../assets/Logotipo CZnet.png';

const Login: React.FC = () => {   
  const navigate = useNavigate();   
  const { authState, login } = useAuth();   
  const [email, setEmail] = useState('');   
  const [password, setPassword] = useState('');   
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (authState.isAuthenticated && !authState.loading) {
      navigate(`/${authState.user?.sector || 'suporte'}`);
    }
  }, [authState, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {     
    event.preventDefault();     
    setError('');
    setIsSubmitting(true);          
    
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
        } else {
          navigate(`/${user.sector}`);
        }       
      } else {
        setError('Erro ao obter informações do usuário');
      }
    } catch (error) {  
      let errorMessage = 'Erro ao fazer login.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }   
  };

  return (     
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">       
      <div className="w-34 h-36 flex items-center justify-center mb-8">
        <img src={Logo} alt="CZnet Logo" className="h-20" />
      </div>
      
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Login</h1>
        
        {error && (           
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">             
            {error}           
          </div>         
        )}         
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input           
              type="email"
              id="email"
              placeholder="seu@email.com"           
              value={email}           
              onChange={(e) => setEmail(e.target.value)}           
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"           
              required         
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input           
              type="password"
              id="password"
              placeholder="Sua senha"           
              value={password}           
              onChange={(e) => setPassword(e.target.value)}           
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"           
              required         
            />
          </div>
                
          <button           
            type="submit"           
            className="w-full bg-red-600 text-white py-3 rounded-md hover:bg-red-700 transition duration-300 flex justify-center items-center"           
            disabled={isSubmitting}         
          >           
            {isSubmitting ? (             
              <>               
                <span className="mr-2">
                  <Spinner size="sm" />
                </span>
                Entrando...             
              </>           
            ) : (             
              "Entrar"           
            )}         
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Sistema de Documentação e Suporte CZNet</p>
        </div>
      </div>     
    </div>   
  ); 
};

export default Login;