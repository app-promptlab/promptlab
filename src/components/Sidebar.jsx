import React, { useState } from 'react';
import { LayoutDashboard, Zap, LayoutGrid, Play, Heart, Shield, User, LogOut, Menu, X } from 'lucide-react';

export default function Sidebar({ user, activeTab, setActiveTab, sidebarOpen, setSidebarOpen, appSettings, isAdmin, onLogout }) {
  const [minimized, setMinimized] = useState(false);

  const handleNav = (id) => { 
    setActiveTab(id); 
    setSidebarOpen(false); 
  };

  const SidebarItem = ({ icon: Icon, label, id, isLogout }) => (
    <button 
      onClick={() => isLogout ? onLogout() : handleNav(id)} 
      className={`
        flex items-center w-full transition-all duration-200 group font-medium mb-1 rounded-xl
        ${minimized ? 'justify-center px-2 py-3' : 'px-4 py-3'} 
        ${activeTab === id && !isLogout ? 'text-theme-primary bg-theme-primary/10' : 'text-gray-400 hover:text-white hover:bg-gray-900'}
        ${!minimized && activeTab === id && !isLogout ? 'border-l-4 border-theme-primary rounded-l-none' : ''}
        ${isLogout ? 'mt-auto hover:text-red-400 hover:bg-red-500/10' : ''}
      `}
      title={minimized ? label : ''}
    >
      <Icon size={24} className={`${minimized ? '' : 'mr-3'}`} />
      {!minimized && <span className="truncate">{label}</span>}
    </button>
  );

  const UserProfileWidget = () => (
    <div className={`flex items-center gap-3 py-6 border-b border-gray-800 mb-2 transition-all ${minimized ? 'justify-center px-2' : 'px-4'}`}>
        <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden flex-shrink-0 border border-gray-600 ring-2 ring-transparent group-hover:ring-theme-primary transition-all">
            {user?.avatar ? (
                <img src={user.avatar} className="w-full h-full object-cover" alt="User" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                    {user?.name?.[0] || 'U'}
                </div>
            )}
        </div>
        {!minimized && (
            <div className="overflow-hidden">
                <h4 className="text-white text-sm font-bold truncate">{user?.name?.split(' ')[0] || 'Usuário'}</h4>
                <p className="text-theme-primary text-[10px] uppercase font-bold tracking-wider truncate">
                    {user?.plan === 'admin' ? 'Administrador' : `Plano ${user?.plan || 'Free'}`}
                </p>
            </div>
        )}
    </div>
  );

  return (
    <>
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className={`
        bg-black border-r border-gray-800 z-50 flex-shrink-0 flex flex-col transition-all duration-300
        hidden md:flex
        ${minimized ? 'w-20' : 'w-64'}
      `}>
        {/* Header */}
        <div className={`h-20 flex items-center border-b border-gray-800 px-4 ${minimized ? 'justify-center' : 'justify-between'}`}>
          {!minimized && (
            appSettings?.logo_menu_url ? (
              <img src={appSettings.logo_menu_url} alt="Logo" className="h-8 object-contain" />
            ) : (
              <span className="text-xl font-bold text-white tracking-tighter">Prompt<span className="text-theme-primary">Lab</span></span>
            )
          )}
          <button onClick={() => setMinimized(!minimized)} className="text-gray-400 hover:text-white p-1"><Menu size={24} /></button>
        </div>

        {/* Perfil */}
        <UserProfileWidget />

        {/* Navegação (ORDEM CORRIGIDA) */}
        <nav className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" id="dashboard" />
          <SidebarItem icon={LayoutGrid} label="Prompts" id="prompts" />
          <SidebarItem icon={Play} label="Tutoriais" id="tutorials" />
          <SidebarItem icon={Heart} label="Favoritos" id="favorites" />
          
          {/* GERADOR AGORA ESTÁ ABAIXO DE FAVORITOS */}
          <SidebarItem icon={Zap} label="Gerador" id="generator" />
          
          <div className="my-4 border-t border-gray-800 mx-2 opacity-50"></div>
          
          {isAdmin && <SidebarItem icon={Shield} label="Admin" id="admin" />}
          <SidebarItem icon={User} label="Perfil" id="profile" />
        </nav>

        <div className="p-4 border-t border-gray-800">
          <SidebarItem icon={LogOut} label="Sair" isLogout />
        </div>
      </aside>

      {/* --- MOBILE --- */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden animate-fadeIn" onClick={() => setSidebarOpen(false)} />}

      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col h-full
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-800">
          <span className="text-xl font-bold text-white">Menu</span>
          <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
        </div>
        
        <div className="px-4 pt-4">
            <div className="flex items-center gap-3 p-3 bg-black/40 rounded-xl border border-gray-800">
                <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden border border-gray-600">
                    <img src={user?.avatar || ''} className="w-full h-full object-cover" alt="User" />
                </div>
                <div>
                    <h4 className="text-white text-sm font-bold">{user?.name?.split(' ')[0]}</h4>
                    <p className="text-theme-primary text-xs font-bold">{user?.plan || 'Free'}</p>
                </div>
            </div>
        </div>

        {/* Navegação Mobile (ORDEM CORRIGIDA) */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" id="dashboard" />
            <SidebarItem icon={LayoutGrid} label="Prompts" id="prompts" />
            <SidebarItem icon={Play} label="Tutoriais" id="tutorials" />
            <SidebarItem icon={Heart} label="Favoritos" id="favorites" />
            
            {/* GERADOR ABAIXO DE FAVORITOS */}
            <SidebarItem icon={Zap} label="Gerador" id="generator" />
            
            {isAdmin && <SidebarItem icon={Shield} label="Admin" id="admin" />}
            <SidebarItem icon={User} label="Perfil" id="profile" />
            <SidebarItem icon={LogOut} label="Sair" isLogout />
        </nav>
      </div>

      {!sidebarOpen && (
        <button onClick={() => setSidebarOpen(true)} className="md:hidden fixed bottom-6 right-6 z-50 bg-theme-primary text-white p-4 rounded-full shadow-lg active:scale-95 transition-transform"><Menu size={28} /></button>
      )}
    </>
  );
}