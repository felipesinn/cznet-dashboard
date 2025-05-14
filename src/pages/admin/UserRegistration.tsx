import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ResponsiveLayout from '../../components/layout/ResponsiveLayout';
import api from '../../services/api';
import type { UserRole, UserSector } from '../../types/auth.types';

const UserRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { user } = authState;
  
  // Verificar se é super_admin ou admin
  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = isSuperAdmin || user?.role === 'admin';
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user' as UserRole,
    sector: (user?.sector as UserSector) || 'suporte' as UserSector,
    isActive: true
  });
  
  // Estados adicionais
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Manipular mudanças nos campos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Validar formulário
  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('O nome é obrigatório');
      return false;
    }
    
    if (!formData.email.trim()) {
      setError('O email é obrigatório');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor, insira um email válido');
      return false;
    }
    
    if (!formData.password) {
      setError('A senha é obrigatória');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return false;
    }
    
    // Se não é super_admin, limitar a criação de usuários apenas no seu setor
    if (!isSuperAdmin && formData.sector !== user?.sector) {
      setError('Você só pode criar usuários no seu próprio setor');
      return false;
    }
    
    // Se não é super_admin, limitar a criação de usuários com nível menor
    if (!isSuperAdmin && (formData.role === 'super_admin' || 
        (user?.role === 'admin' && formData.role === 'admin'))) {
      setError('Você não tem permissão para criar usuários com este nível de acesso');
      return false;
    }
    
    return true;
  };
  
  // Enviar formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Preparar dados para envio (remover confirmPassword)
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        sector: formData.sector,
        isActive: formData.isActive
      };
      
      // Enviar para a API
      const response = await api.post('/users', userData);
      
      if (response.status === 201) {
        setSuccess('Usuário criado com sucesso!');
        // Limpar formulário após sucesso
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'user',
          sector: (user?.sector as UserSector) || 'suporte',
          isActive: true
        });
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Erro ao criar usuário:', err);
      setError(err?.response?.data?.message || 'Erro ao criar usuário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  // Verificar permissões
  if (!isAdmin) {
    return (
      <ResponsiveLayout>
        <div className="flex justify-center items-center h-full p-4">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
            <h2 className="text-2xl font-bold text-center text-red-600 mb-4">Acesso Negado</h2>
            <p className="text-gray-700 mb-6">
              Você não tem permissão para acessar esta página. Apenas administradores podem registrar novos usuários.
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
            >
              Voltar para a Página Inicial
            </button>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }
  
  return (
    <ResponsiveLayout title="Registrar Novo Usuário">
      <div className="p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6 pb-2 border-b">
              <h1 className="text-2xl font-bold text-gray-800">Registrar Novo Usuário</h1>
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                <ArrowLeft size={18} className="mr-1" />
                Voltar
              </button>
            </div>
            
            {/* Mensagens de erro ou sucesso */}
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                <p>{error}</p>
              </div>
            )}
            
            {success && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
                <p>{success}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Nome completo"
                  required
                />
              </div>
              
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="email@exemplo.com"
                  required
                />
              </div>
              
              {/* Senha */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Senha *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Mínimo de 6 caracteres"
                    required
                  />
                  <button 
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              {/* Confirmar Senha */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Senha *
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Repita a senha"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Função */}
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Função *
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  >
                    <option value="user">Usuário</option>
                    {isAdmin && <option value="admin">Administrador</option>}
                    {isSuperAdmin && <option value="super_admin">Super Admin</option>}
                  </select>
                </div>
                
                {/* Setor */}
                <div>
                  <label htmlFor="sector" className="block text-sm font-medium text-gray-700 mb-1">
                    Setor *
                  </label>
                  <select
                    id="sector"
                    name="sector"
                    value={formData.sector}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                    disabled={!isSuperAdmin} // Somente super_admin pode escolher qualquer setor
                  >
                    <option value="suporte">Suporte</option>
                    <option value="tecnico">Técnico</option>
                    <option value="noc">NOC</option>
                    <option value="comercial">Comercial</option>
                    <option value="adm">ADM</option>
                  </select>
                  {!isSuperAdmin && (
                    <p className="text-sm text-gray-500 mt-1">
                      Como administrador de setor, você só pode criar usuários no seu próprio setor.
                    </p>
                  )}
                </div>
              </div>
              
              {/* Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Usuário ativo
                </label>
              </div>
              
              {/* Botão de envio */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Registrando...
                    </>
                  ) : (
                    'Registrar Usuário'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default UserRegistration;