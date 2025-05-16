import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import type { SectorType } from '../../types/common.types';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  title?: string;
  currentSector?: SectorType;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ 
  children, 
  title, 
  currentSector = 'suporte' 
}) => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  const isMobileView = windowWidth < 768;
  
  // Verificar se o usuário está autenticado
  useEffect(() => {
    if (!authState.isAuthenticated && !authState.loading) {
      navigate('/login');
    }
  }, [authState.isAuthenticated, authState.loading, navigate]);
  
  // Lidar com redimensionamento da janela
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
  
  // Fechar sidebar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      if (isMobileView && sidebarOpen && 
          !target.closest('#mobile-sidebar') && 
          !target.closest('[aria-label="Abrir menu"]')) {
        setSidebarOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen, isMobileView]);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <Header 
        title={title} 
        toggleSidebar={toggleSidebar} 
        isSidebarOpen={sidebarOpen}
        isMobileView={isMobileView}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar para desktop */}
        {!isMobileView && (
          <div className="w-64 flex-shrink-0 z-10">
            <Sidebar currentSector={currentSector} isMobileView={false} />
          </div>
        )}

        {/* Sidebar para mobile */}
        {isMobileView && sidebarOpen && (
          <div 
            id="mobile-sidebar"
            className="fixed inset-0 z-40 bg-gray-900 bg-opacity-50"
          >
            <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50">
              <Sidebar 
                currentSector={currentSector} 
                isMobileView={true} 
                closeSidebar={() => setSidebarOpen(false)} 
              />
            </div>
          </div>
        )}

        {/* Conteúdo principal */}
        <main className="flex-1 overflow-auto bg-gray-100 relative">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ResponsiveLayout;