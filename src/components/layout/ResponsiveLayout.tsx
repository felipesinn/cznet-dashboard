import React, { useState, useEffect, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Headphones, 
  Upload, 
  Bell, 
  Menu, 
  X, 
  LogOut, 
  ChevronDown,
  Search,
  Users,
  Settings
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { UserSector } from '../../types/auth.types';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  title?: string;
  currentSector?: UserSector;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ 
  children, 
  title, 
  currentSector = 'suporte' 
}) => {
  const navigate = useNavigate();
  const { authState, logout } = useAuth();
  const { user } = authState;
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = isSuperAdmin || user?.role === 'admin';
  
  const sectorIcons: Record<string, JSX.Element> = {
    suporte: <Headphones size={20} />,
    tecnico: <Upload size={20} />,
    noc: <Bell size={20} />,
    comercial: <Menu size={20} />,
    adm: <Search size={20} />
  };
  
  const sectorNames: Record<string, string> = {
    suporte: 'Suporte',
    tecnico: 'Técnico',
    noc: 'NOC',
    comercial: 'Comercial',
    adm: 'ADM'
  };
  
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const navigateToSector = (sector: UserSector) => {
    if (!isSuperAdmin && sector !== user?.sector) {
      return;
    }
    
    navigate(`/${sector}`);
    setSidebarOpen(false);
  };
  
  const navigateToDashboard = () => {
    navigate('/admin/dashboard');
    setSidebarOpen(false);
  };
  
  const navigateToUserManagement = () => {
    navigate('/admin/users');
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('#profile-dropdown') && profileDropdownOpen) {
        setProfileDropdownOpen(false);
      }
      
      if (windowWidth < 768 && sidebarOpen && !target.closest('#mobile-sidebar') && !target.closest('#mobile-menu-button')) {
        setSidebarOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileDropdownOpen, sidebarOpen, windowWidth]);
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              {windowWidth < 768 && (
                <button 
                  id="mobile-menu-button"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 mr-2"
                >
                  {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              )}
              
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold mr-2">
                CZ
              </div>
              <h1 className="text-xl font-bold text-gray-900 hidden sm:block">
                {title || `CZNet ${sectorNames[currentSector] || 'Portal'}`}
              </h1>
              <h1 className="text-lg font-bold text-gray-900 sm:hidden">
                {title ? (title.length > 15 ? title.substring(0, 15) + '...' : title) : `CZ ${sectorNames[currentSector]?.substring(0, 3) || 'Portal'}`}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-gray-200 relative">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="relative" id="profile-dropdown">
                <button 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 group"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium group-hover:bg-gray-300">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="font-medium text-gray-700 hidden md:block">{user?.name || 'Usuário'}</span>
                  <ChevronDown size={16} className="text-gray-500 hidden md:block" />
                </button>
                
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    
                    {isAdmin && (
                      <button
                        onClick={navigateToDashboard}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Settings size={16} className="mr-2 text-gray-500" />
                        Dashboard Admin
                      </button>
                    )}
                    
                    {isSuperAdmin && (
                      <button
                        onClick={navigateToUserManagement}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Users size={16} className="mr-2 text-gray-500" />
                        Gerenciar Usuários
                      </button>
                    )}
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <LogOut size={16} className="mr-2" />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar para desktop */}
        {windowWidth >= 768 && (
          <div className="bg-white border-r border-gray-200 w-64 flex-shrink-0 z-10">
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-red-500 mb-2 bg-gray-200 flex items-center justify-center">
                  <span className="text-2xl font-semibold text-gray-700">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-800 text-center">{user?.name || 'Usuário'}</h3>
                <span className="text-xs text-gray-500">{user?.role || 'Padrão'}</span>
              </div>
            </div>

            <nav className="mt-4 px-2 space-y-1">
              {isAdmin && (
                <button 
                  onClick={navigateToDashboard}
                  className="flex items-center w-full justify-start space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Search size={20} />
                  <span>Dashboard Admin</span>
                </button>
              )}
              
              {isSuperAdmin && (
                <button 
                  onClick={navigateToUserManagement}
                  className="flex items-center w-full justify-start space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Users size={20} />
                  <span>Gerenciar Usuários</span>
                </button>
              )}
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Setores
                </h3>
              </div>
              
              {isSuperAdmin ? (
                <>
                  <button 
                    onClick={() => navigateToSector('suporte')}
                    className={`flex items-center w-full justify-start space-x-3 p-3 rounded-lg ${
                      currentSector === 'suporte' ? 'bg-red-100 text-red-600' : 'hover:bg-gray-200 transition-colors'
                    }`}
                  >
                    <Headphones size={20} />
                    <span>Suporte</span>
                  </button>
                  
                  <button 
                    onClick={() => navigateToSector('tecnico')}
                    className={`flex items-center w-full justify-start space-x-3 p-3 rounded-lg ${
                      currentSector === 'tecnico' ? 'bg-red-100 text-red-600' : 'hover:bg-gray-200 transition-colors'
                    }`}
                  >
                    <Upload size={20} />
                    <span>Técnico</span>
                  </button>
                  
                  <button 
                    onClick={() => navigateToSector('noc')}
                    className={`flex items-center w-full justify-start space-x-3 p-3 rounded-lg ${
                      currentSector === 'noc' ? 'bg-red-100 text-red-600' : 'hover:bg-gray-200 transition-colors'
                    }`}
                  >
                    <Bell size={20} />
                    <span>NOC</span>
                  </button>
                  
                  <button 
                    onClick={() => navigateToSector('comercial')}
                    className={`flex items-center w-full justify-start space-x-3 p-3 rounded-lg ${
                      currentSector === 'comercial' ? 'bg-red-100 text-red-600' : 'hover:bg-gray-200 transition-colors'
                    }`}
                  >
                    <Menu size={20} />
                    <span>Comercial</span>
                  </button>
                  
                  <button 
                    onClick={() => navigateToSector('adm')}
                    className={`flex items-center w-full justify-start space-x-3 p-3 rounded-lg ${
                      currentSector === 'adm' ? 'bg-red-100 text-red-600' : 'hover:bg-gray-200 transition-colors'
                    }`}
                  >
                    <Search size={20} />
                    <span>ADM</span>
                  </button>
                </>
              ) : (
                <button 
                  className="flex items-center w-full justify-start space-x-3 p-3 rounded-lg bg-red-100 text-red-600"
                >
                  {sectorIcons[user?.sector as string] || <Search size={20} />}
                  <span>{sectorNames[user?.sector as string] || user?.sector || 'Setor'}</span>
                </button>
              )}
              
              <button 
                onClick={handleLogout}
                className="flex items-center w-full justify-start space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors text-red-600 mt-8"
              >
                <LogOut size={20} />
                <span>Sair</span>
              </button>
            </nav>
          </div>
        )}

        {/* Sidebar para mobile */}
        {windowWidth < 768 && sidebarOpen && (
          <div 
            id="mobile-sidebar"
            className="fixed inset-0 z-10 bg-gray-900 bg-opacity-50 overflow-y-auto"
          >
            <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-20">
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold mr-2">
                        CZ
                      </div>
                      <h2 className="text-lg font-semibold text-gray-800">CZNet Portal</h2>
                    </div>
                    <button 
                      onClick={() => setSidebarOpen(false)}
                      className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
                
                <div className="p-4 border-b border-gray-200">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-red-500 mb-2 bg-gray-200 flex items-center justify-center">
                      <span className="text-2xl font-semibold text-gray-700">
                        {user?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-800 text-center">{user?.name || 'Usuário'}</h3>
                    <span className="text-xs text-gray-500">{user?.role || 'Padrão'}</span>
                  </div>
                </div>
                
                <nav className="flex-1 px-2 py-4 overflow-y-auto">
                  {isAdmin && (
                    <button 
                      onClick={navigateToDashboard}
                      className="flex items-center w-full justify-start space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors mb-2"
                    >
                      <Search size={20} />
                      <span>Dashboard Admin</span>
                    </button>
                  )}
                  
                  {isSuperAdmin && (
                    <button 
                      onClick={navigateToUserManagement}
                      className="flex items-center w-full justify-start space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors mb-2"
                    >
                      <Users size={20} />
                      <span>Gerenciar Usuários</span>
                    </button>
                  )}
                  
                  <div className="mt-4 mb-2">
                    <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Setores
                    </h3>
                  </div>
                  
                  {isSuperAdmin ? (
                    <>
                      <button 
                        onClick={() => navigateToSector('suporte')}
                        className={`flex items-center w-full justify-start space-x-3 p-3 rounded-lg ${
                          currentSector === 'suporte' ? 'bg-red-100 text-red-600' : 'hover:bg-gray-200 transition-colors'
                        } mb-1`}
                      >
                        <Headphones size={20} />
                        <span>Suporte</span>
                      </button>
                      
                      <button 
                        onClick={() => navigateToSector('tecnico')}
                        className={`flex items-center w-full justify-start space-x-3 p-3 rounded-lg ${
                          currentSector === 'tecnico' ? 'bg-red-100 text-red-600' : 'hover:bg-gray-200 transition-colors'
                        } mb-1`}
                      >
                        <Upload size={20} />
                        <span>Técnico</span>
                      </button>
                      
                      <button 
                        onClick={() => navigateToSector('noc')}
                        className={`flex items-center w-full justify-start space-x-3 p-3 rounded-lg ${
                          currentSector === 'noc' ? 'bg-red-100 text-red-600' : 'hover:bg-gray-200 transition-colors'
                        } mb-1`}
                      >
                        <Bell size={20} />
                        <span>NOC</span>
                      </button>
                      
                      <button 
                        onClick={() => navigateToSector('comercial')}
                        className={`flex items-center w-full justify-start space-x-3 p-3 rounded-lg ${
                          currentSector === 'comercial' ? 'bg-red-100 text-red-600' : 'hover:bg-gray-200 transition-colors'
                        } mb-1`}
                      >
                        <Menu size={20} />
                        <span>Comercial</span>
                      </button>
                      
                      <button 
                        onClick={() => navigateToSector('adm')}
                        className={`flex items-center w-full justify-start space-x-3 p-3 rounded-lg ${
                          currentSector === 'adm' ? 'bg-red-100 text-red-600' : 'hover:bg-gray-200 transition-colors'
                        } mb-1`}
                      >
                        <Search size={20} />
                        <span>ADM</span>
                      </button>
                    </>
                  ) : (
                    <button 
                      className="flex items-center w-full justify-start space-x-3 p-3 rounded-lg bg-red-100 text-red-600 mb-1"
                    >
                      {sectorIcons[user?.sector as string] || <Search size={20} />}
                      <span>{sectorNames[user?.sector as string] || user?.sector}</span>
                    </button>
                  )}
                  
                  <div className="mt-8">
                    <button 
                      onClick={handleLogout}
                      className="flex items-center w-full justify-start space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors text-red-600"
                    >
                      <LogOut size={20} />
                      <span>Sair</span>
                    </button>
                  </div>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Conteúdo principal */}
        <main className="flex-1 overflow-auto bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ResponsiveLayout;