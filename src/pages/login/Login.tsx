// src/pages/login/Login.tsx
import React, { useState } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../../contexts/AuthContext'; 
import axios, { AxiosError } from 'axios';
import type { ApiError } from '../../types/common.types';
import Spinner from '../../components/ui/Spinner';

import Logo from '../../assets/Logotipo CZnet.png'; // Importe o logo correto

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

  return (     
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">       
      <div className="w-34 h-36 flex items-center justify-center">
       <img src={Logo} alt="" srcSet="Logo cznet" />
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
              <Spinner size="sm" />
              Entrando...             
            </span>           
          ) : (             
            "Entrar"           
          )}         
        </button>
      </form>     
    </div>   
  ); 
}