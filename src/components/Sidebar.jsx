import React, { useState } from 'react';
import { LayoutDashboard, Zap, LayoutGrid, Play, Heart, Shield, User, LogOut, Menu, X } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen, appSettings, isAdmin, onLogout }) {
  // Estado local para controlar se o menu Desktop está minimizado ou expandido
  const [minimized, setMinimized] = useState(false);

  const handleNav = (id) => { 
    setActiveTab(id); 
    setSidebarOpen(false); // Fecha o menu mobile se estiver aberto
  };

  const SidebarItem = ({ icon: Icon, label, id, isLogout }) => (
    <button 
      onClick={() => isLogout ? onLogout() : handleNav(id)} 
      className={`
        flex items-center w-full transition-all duration-200 group font-medium mb-1 rounded-xl
        ${minimized ? 'justify-center px-2 py-3' : 'px-4 py-3'} 
        ${activeTab === id && !isLogout ? 'text-blue-500 bg-blue-500/10' : 'text-gray-400 hover:text-white hover:bg-gray-900'}
        ${!minimized && activeTab === id && !isLogout ? 'border-l-4 border-blue-500 rounded-l-none' : ''}
        ${isLogout ? 'mt-auto hover:text-red-400 hover:bg-red-500/10' : ''}
      `}
      title={minimized ? label : ''} // Tooltip nativo quando minimizado
    >
      <Icon size={24} className={`${minimized ? '' : 'mr-3'}`} />
      {!minimized && <span className="truncate">{label}</span>}
    </button>
  );

  return (
    <>
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className={`
        bg-black border-r border-gray-800 z-50 flex-shrink-0 flex flex-col transition-all duration-300
        hidden md:flex
        ${minimized ? 'w-20' : 'w-64'}
      `}>
        {/* Header do Menu (Logo + Toggle) */}
        <div className={`h-20 flex items-center border-b border-gray-800 px-4 ${minimized ? 'justify-center' : 'justify-between'}`}>
          {!minimized && (
            appSettings?.logo_menu_url ? (
              <img src={appSettings.logo_menu_url} alt="Logo" className="h-8 object-contain" />
            ) : (
              <span className="text-xl font-bold text-white tracking-tighter">Prompt<span className="text-blue-600">Lab</span></span>
            )
          )}
          {/* Botão Hambúrguer para Minimizar/Expandir */}
          <button onClick={() => setMinimized(!minimized)} className="text-gray-400 hover:text-white p-1">
            <Menu size={24} />
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto py-6 px-2 space-y-1 custom-scrollbar">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" id="dashboard" />
          <SidebarItem icon={Zap} label="Gerador" id="generator" />
          <SidebarItem icon={LayoutGrid} label="Prompts" id="prompts" />
          <SidebarItem icon={Play} label="Tutoriais" id="tutorials" />
          <SidebarItem icon={Heart} label="Favoritos" id="favorites" />
          
          <div className="my-4 border-t border-gray-800 mx-2 opacity-50"></div>
          
          {isAdmin && <SidebarItem icon={Shield} label="Admin" id="admin" />}
          <SidebarItem icon={User} label="Perfil" id="profile" />
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <SidebarItem icon={LogOut} label="Sair" isLogout />
        </div>
      </aside>

      {/* --- MOBILE OVERLAY MENU (Mantido igual) --- */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden animate-fadeIn"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col h-full
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-800">
          <span className="text-xl font-bold text-white">Menu</span>
          <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" id="dashboard" />
            <SidebarItem icon={Zap} label="Gerador" id="generator" />
            <SidebarItem icon={LayoutGrid} label="Prompts" id="prompts" />
            <SidebarItem icon={Play} label="Tutoriais" id="tutorials" />
            <SidebarItem icon={Heart} label="Favoritos" id="favorites" />
            {isAdmin && <SidebarItem icon={Shield} label="Admin" id="admin" />}
            <SidebarItem icon={User} label="Perfil" id="profile" />
            <SidebarItem icon={LogOut} label="Sair" isLogout />
        </nav>
      </div>

      {/* FAB Mobile */}
      {!sidebarOpen && (
        <button 
          onClick={() => setSidebarOpen(true)}
          className="md:hidden fixed bottom-6 right-6 z-50 bg-blue-600 text-white p-4 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.5)] active:scale-95 transition-transform"
        >
          <Menu size={28} />
        </button>
      )}
    </>
  );
}