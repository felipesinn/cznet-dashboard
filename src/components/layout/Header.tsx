import React, { useState } from 'react';
import { Menu, Bell, ChevronDown, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Logo from '../../assets/Logotipo CZnet.png';

interface HeaderProps {
  title?: string;
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  isMobileView: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  toggleSidebar, 
  isSidebarOpen, 
  isMobileView 
}) => {
  const { authState, logout } = useAuth();
  const { user } = authState;
  const navigate = useNavigate();
  
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
    setProfileDropdownOpen(false);
  };
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            {isMobileView && (
              <button 
                onClick={toggleSidebar}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 mr-2"
                aria-label={isSidebarOpen ? "Fechar menu" : "Abrir menu"}
              >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
            
            <div className="w-12 h-12 flex items-center justify-center">
              <img src={Logo} alt="CZNet Logo" className="w-full h-full object-contain" />
            </div>
            
            <h1 className="text-xl font-bold text-gray-900 ml-2 hidden sm:block">
              {title || 'CZNet Portal'}
            </h1>
            
            <h1 className="text-lg font-bold text-gray-900 ml-2 sm:hidden">
              {title ? (title.length > 15 ? title.substring(0, 15) + '...' : title) : 'CZNet'}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              className="p-2 rounded-full hover:bg-gray-200 relative"
              aria-label="Notificações"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2 group relative"
                aria-expanded={profileDropdownOpen}
                aria-haspopup="true"
              >
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium group-hover:bg-gray-300">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <span className="font-medium text-gray-700 hidden md:block">{user?.name || 'Usuário'}</span>
                <ChevronDown size={16} className="text-gray-500 hidden md:block" />
              </button>
              
              {profileDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
                  role="menu"
                >
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  
                  {(user?.role === 'super_admin' || user?.role === 'admin') && (
                    <button
                      onClick={() => {
                        navigate('/admin/dashboard');
                        setProfileDropdownOpen(false);
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Dashboard Admin
                    </button>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    role="menuitem"
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;