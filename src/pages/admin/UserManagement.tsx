// src/pages/admin/UserManagement.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Plus, Edit, Trash2, Search, X, Check, ArrowLeft 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { User, UserRole, UserSector } from '../../types/auth.types';

interface UserWithId extends User {
  id: string;
}

// Simular o serviço de usuários (deve ser substituído por chamadas reais à API)
const userService = {
  async getUsers(): Promise<UserWithId[]> {
    // Simulação - na implementação real, buscaria da API
    return [
      {
        id: '1',
        name: 'Super Admin',
        email: 'super@example.com',
        role: 'super_admin' as UserRole,
        sector: 'suporte' as UserSector,
        isActive: true,
        createdAt: '2023-01-01'
      },
      {
        id: '2',
        name: 'Admin Suporte',
        email: 'admin.suporte@example.com',
        role: 'admin' as UserRole,
        sector: 'suporte' as UserSector,
        isActive: true,
        createdAt: '2023-01-02'
      },
      {
        id: '3',
        name: 'Admin Técnico',
        email: 'admin.tecnico@example.com',
        role: 'admin' as UserRole,
        sector: 'tecnico' as UserSector,
        isActive: true,
        createdAt: '2023-01-03'
      },
      {
        id: '4',
        name: 'Usuário Comum',
        email: 'usuario@example.com',
        role: 'user' as UserRole,
        sector: 'suporte' as UserSector,
        isActive: true,
        createdAt: '2023-01-04'
      },
      {
        id: '5',
        name: 'Usuário Inativo',
        email: 'inativo@example.com',
        role: 'user' as UserRole,
        sector: 'comercial' as UserSector,
        isActive: false,
        createdAt: '2023-01-05'
      }
    ];
  },
  
  async createUser(userData: Partial<User>): Promise<UserWithId> {
    // Simulação - na implementação real, enviaria para API
    return {
      id: Math.floor(Math.random() * 1000).toString(),
      name: userData.name || '',
      email: userData.email || '',
      role: userData.role || 'user' as UserRole,
      sector: userData.sector || 'suporte' as UserSector,
      isActive: userData.isActive !== false,
      createdAt: new Date().toISOString()
    };
  },
  
  async updateUser(id: string, userData: Partial<User>): Promise<UserWithId> {
    // Simulação - na implementação real, enviaria para API
    return {
      id,
      name: userData.name || '',
      email: userData.email || '',
      role: userData.role || 'user' as UserRole,
      sector: userData.sector || 'suporte' as UserSector,
      isActive: userData.isActive !== false,
      createdAt: '2023-01-01'
    };
  },
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async deleteUser(_id: string): Promise<{ success: boolean }> {
    // Simulação - na implementação real, enviaria para API
    return { success: true };
  }
};

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const { authState, logout } = useAuth();
  const { user } = authState;
  
  // Verificar se é super_admin
  const isSuperAdmin = user?.role === 'super_admin';
  
  // Estados
  const [users, setUsers] = useState<UserWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithId | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Formulário
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'user',
    sector: 'suporte',
    isActive: true
  });
  const [password, setPassword] = useState('');
  
  // Carregar usuários
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const data = await userService.getUsers();
        setUsers(data);
      } catch (err) {
        console.error('Erro ao carregar usuários:', err);
        setError('Não foi possível carregar a lista de usuários.');
      } finally {
        setLoading(false);
      }
    };
    
    loadUsers();
  }, []);
  
  // Redirecionar para dashboard se não for super_admin
  useEffect(() => {
    if (!loading && user && !isSuperAdmin) {
      navigate('/admin/dashboard');
    }
  }, [loading, user, isSuperAdmin, navigate]);
  
  // Funções de manipulação de usuários
  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'user',
      sector: 'suporte',
      isActive: true
    });
    setPassword('');
    setShowForm(true);
  };
  
  const handleEditUser = (user: UserWithId) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      sector: user.sector,
      isActive: user.isActive
    });
    setPassword('');
    setShowForm(true);
  };
  
  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
      try {
        await userService.deleteUser(id);
        setUsers(prev => prev.filter(user => user.id !== id));
      } catch (err) {
        console.error('Erro ao excluir usuário:', err);
        alert('Não foi possível excluir o usuário.');
      }
    }
  };
  
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        // Atualizar usuário existente
        const updatedUser = await userService.updateUser(editingUser.id, formData);
        setUsers(prev => prev.map(user => user.id === updatedUser.id ? updatedUser : user));
      } else {
        // Criar novo usuário
        if (!password) {
          alert('A senha é obrigatória para novos usuários.');
          return;
        }
        
        const newUser = await userService.createUser({
          ...formData
        });
        
        setUsers(prev => [...prev, newUser]);
      }
      
      setShowForm(false);
      setEditingUser(null);
    } catch (err) {
      console.error('Erro ao salvar usuário:', err);
      alert('Não foi possível salvar o usuário.');
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Tratar checkbox
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Filtrar usuários pelo termo de busca
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.sector.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Função para voltar ao dashboard
  const goToDashboard = () => {
    navigate('/admin/dashboard');
  };
  
  // Função para logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Funções de formatação
  const formatRole = (role: string): string => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'admin':
        return 'Administrador';
      case 'user':
        return 'Usuário';
      default:
        return role;
    }
  };
  
  const formatSector = (sector: string): string => {
    switch (sector) {
      case 'suporte':
        return 'Suporte';
      case 'tecnico':
        return 'Técnico';
      case 'noc':
        return 'NOC';
      case 'comercial':
        return 'Comercial';
      case 'adm':
        return 'ADM';
      default:
        return sector;
    }
  };
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };
  
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold mr-2">
                CZ
              </div>
              <h1 className="text-xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium">
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <span className="font-medium text-gray-700">{user?.name || 'Admin'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Botões de ação */}
          <div className="flex justify-between mb-6">
            <button
              onClick={goToDashboard}
              className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              <ArrowLeft size={18} className="mr-1" />
              Voltar para Dashboard
            </button>
            
            <div className="flex space-x-2">
              <button
                onClick={handleAddUser}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                <Plus size={18} className="mr-1" />
                Adicionar Usuário
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                <LogOut size={18} className="mr-1" />
                Sair
              </button>
            </div>
          </div>
          
          {/* Mensagem de erro */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}
          
          {/* Barra de pesquisa */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Lista de usuários */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <svg className="animate-spin h-8 w-8 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Função
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Setor
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Criado em
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium mr-3">
                                {user.name.charAt(0)}
                              </div>
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === 'super_admin' 
                                ? 'bg-purple-100 text-purple-800' 
                                : user.role === 'admin' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-green-100 text-green-800'
                            }`}>
                              {formatRole(user.role)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatSector(user.sector)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(user.createdAt || '')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                <Edit size={18} />
                              </button>
                              {/* Não permitir excluir o próprio super_admin */}
                              {user.role !== 'super_admin' && (
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 size={18} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                          Nenhum usuário encontrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Formulário de usuário */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {editingUser ? 'Editar Usuário' : 'Adicionar Usuário'}
                </h2>
                <button 
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleFormSubmit}>
                {/* Nome */}
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
                
                {/* Email */}
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
                
                {/* Senha (apenas para novos usuários) */}
                {!editingUser && (
                  <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Senha *
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                  </div>
                )}
                
                {/* Função */}
                <div className="mb-4">
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Função *
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role || 'user'}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  >
                    <option value="user">Usuário</option>
                    <option value="admin">Administrador</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                
                {/* Setor */}
                <div className="mb-4">
                  <label htmlFor="sector" className="block text-sm font-medium text-gray-700 mb-1">
                    Setor *
                  </label>
                  <select
                    id="sector"
                    name="sector"
                    value={formData.sector || 'suporte'}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  >
                    <option value="suporte">Suporte</option>
                    <option value="tecnico">Técnico</option>
                    <option value="noc">NOC</option>
                    <option value="comercial">Comercial</option>
                    <option value="adm">ADM</option>
                  </select>
                </div>
                
                {/* Status */}
                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive !== false}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Usuário ativo</span>
                  </label>
                </div>
                
                {/* Botões */}
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                  >
                    <Check size={18} className="mr-1" />
                    {editingUser ? 'Atualizar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;