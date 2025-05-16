import React, { type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { Headphones, Upload, Bell, Search, LogOut, Users, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { SectorType } from '../../types/common.types';

interface SidebarProps {
  currentSector: SectorType;
  isMobileView: boolean;
  closeSidebar?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentSector, 
  isMobileView, 
  closeSidebar 
}) => {
  const navigate = useNavigate();
  const { authState, logout } = useAuth();
  const { user } = authState;
  
  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = isSuperAdmin || user?.role === 'admin';
  
  const sectorIcons: Record<string, JSX.Element> = {
    suporte: <Headphones size={20} />,
    tecnico: <Upload size={20} />,
    noc: <Bell size={20} />,
    comercial: <Search size={20} />,
    adm: <Settings size={20} />
  };
  
  const sectorNames: Record<string, string> = {
    suporte: 'Suporte',
    tecnico: 'Técnico',
    noc: 'NOC',
    comercial: 'Comercial',
    adm: 'ADM'
  };
  
  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobileView && closeSidebar) {
      closeSidebar();
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-red-500 mb-2 bg-gray-200 flex items-center justify-center">
            <span className="text-2xl font-semibold text-gray-700">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <h3 className="font-semibold text-gray-800 text-center">{user?.name || 'Usuário'}</h3>
          <span className="text-xs text-gray-500">{user?.role === 'super_admin' ? 'Super Admin' : user?.role === 'admin' ? 'Administrador' : 'Usuário'}</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {isAdmin && (
          <>
            <button 
              onClick={() => handleNavigation('/admin/dashboard')}
              className="flex items-center w-full justify-start space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Settings size={20} />
              <span>Dashboard Admin</span>
            </button>
            
            {isSuperAdmin && (
              <button 
                onClick={() => handleNavigation('/admin/users')}
                className="flex items-center w-full justify-start space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Users size={20} />
                <span>Gerenciar Usuários</span>
              </button>
            )}
            
            <div className="my-4 border-t border-gray-200"></div>
          </>
        )}
        
        <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Setores
        </div>
        
        {isSuperAdmin ? (
          // Super Admin pode acessar todos os setores
          <>
            {Object.entries(sectorNames).map(([sector, name]) => (
              <button 
                key={sector}
                onClick={() => handleNavigation(`/${sector}`)}
                className={`flex items-center w-full justify-start space-x-3 p-3 rounded-lg ${
                  currentSector === sector ? 'bg-red-100 text-red-600' : 'hover:bg-gray-200 transition-colors'
                }`}
              >
                {sectorIcons[sector] || <Search size={20} />}
                <span>{name}</span>
              </button>
            ))}
          </>
        ) : (
          // Usuários normais só podem ver seu próprio setor
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
  );
};

export default Sidebar;