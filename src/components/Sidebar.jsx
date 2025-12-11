import React, { useState } from 'react';
import { LayoutDashboard, Zap, LayoutGrid, Play, Heart, Shield, User, LogOut, Menu, X, Lock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Sidebar({ user, activeTab, setActiveTab, sidebarOpen, setSidebarOpen, isAdmin, onLogout }) {
  const [minimized, setMinimized] = useState(false);
  const { identity } = useTheme();

  const handleNav = (id) => { setActiveTab(id); setSidebarOpen(false); };

  // Função para verificar se o item deve ter cadeado
  const isLocked = (id) => {
    if (isAdmin) return false;
    // Mantém o bloqueio APENAS no Gerador
    if (id === 'generator') return !user?.has_generators;
    return false;
  };

  const SidebarItem = ({ icon: Icon, label, id, isLogout }) => {
    const locked = !isLogout && isLocked(id);
    
    return (
      <button 
        onClick={() => isLogout ? onLogout() : handleNav(id)} 
        className={`
          flex items-center w-full transition-all duration-200 group font-medium mb-1 rounded-xl relative
          ${minimized ? 'justify-center px-2 py-3' : 'px-4 py-3'} 
          ${activeTab === id && !isLogout ? 'text-theme-primary bg-theme-primary/10' : 'text-theme-sidebar-text hover:text-theme-primary hover:bg-white/5'}
          ${!minimized && activeTab === id && !isLogout ? 'border-l-4 border-theme-primary rounded-l-none' : ''}
          ${isLogout ? 'mt-auto hover:text-red-400 hover:bg-red-500/10 text-theme-sidebar-text' : ''}
          ${locked ? 'opacity-70 hover:opacity-100' : ''} 
        `}
        title={minimized ? label : ''}
      >
        <Icon size={24} className={`${minimized ? '' : 'mr-3'}`} />
        
        {!minimized && (
            <>
                <span className="truncate flex-1 text-left">{label}</span>
                {locked && <Lock size={14} className="text-gray-500 ml-2" />}
            </>
        )}
      </button>
    );
  };

  const UserProfileWidget = () => (
    <div className={`flex items-center gap-3 py-6 border-b border-white/10 mb-2 transition-all ${minimized ? 'justify-center px-2' : 'px-4'}`}>
        <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden flex-shrink-0 border border-white/20 ring-2 ring-transparent group-hover:ring-theme-primary transition-all">
            {user?.avatar ? (
                <img src={user.avatar} className="w-full h-full object-cover" alt="User" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-theme-sidebar-text font-bold text-sm">
                    {user?.name?.[0] || 'U'}
                </div>
            )}
        </div>
        {!minimized && (
            <div className="overflow-hidden">
                <h4 className="text-theme-sidebar-text text-sm font-bold truncate">{user?.name?.split(' ')[0] || 'Usuário'}</h4>
                <p className="text-theme-primary text-[10px] uppercase font-bold tracking-wider truncate">
                    {user?.plan === 'admin' ? 'Administrador' : (user?.has_prompts ? 'Membro Pro' : 'Visitante')}
                </p>
            </div>
        )}
    </div>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className={`bg-theme-sidebar border-r border-white/10 z-50 flex-shrink-0 flex flex-col transition-all duration-300 hidden md:flex ${minimized ? 'w-20' : 'w-64'}`}>
        <div className={`h-20 flex items-center border-b border-white/10 px-4 ${minimized ? 'justify-center' : 'justify-between'}`}>
          {!minimized && (
            identity?.logo_menu_url ? (
              <img src={identity.logo_menu_url} alt="Logo" className="h-8 object-contain" />
            ) : (
              <span className="text-xl font-bold text-theme-sidebar-text tracking-tighter">App</span>
            )
          )}
          <button onClick={() => setMinimized(!minimized)} className="text-theme-sidebar-text hover:text-theme-primary p-1"><Menu size={24} /></button>
        </div>

        <UserProfileWidget />

        <nav className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" id="dashboard" />
          <SidebarItem icon={LayoutGrid} label="Prompts" id="prompts" />
          <SidebarItem icon={Play} label="Tutoriais" id="tutorials" />
          <SidebarItem icon={Heart} label="Favoritos" id="favorites" />
          <SidebarItem icon={Zap} label="Gerador" id="generator" />
          
          <div className="my-4 border-t border-white/10 mx-2 opacity-50"></div>
          
          {isAdmin && <SidebarItem icon={Shield} label="Admin" id="admin" />}
          <SidebarItem icon={User} label="Perfil" id="profile" />
        </nav>

        <div className="p-4 border-t border-white/10">
          <SidebarItem icon={LogOut} label="Sair" isLogout />
        </div>
      </aside>

      {/* MOBILE SIDEBAR OVERLAY (Fundo Escuro) */}
      {/* Z-INDEX AUMENTADO PARA z-[100] para cobrir os ícones da galeria */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] md:hidden animate-fadeIn" onClick={() => setSidebarOpen(false)} />}

      {/* MOBILE SIDEBAR (Menu Lateral) */}
      {/* Z-INDEX AUMENTADO PARA z-[110] para ficar acima do fundo escuro */}
      <div className={`fixed inset-y-0 left-0 z-[110] w-72 bg-theme-sidebar border-r border-white/10 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col h-full ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
          <span className="text-xl font-bold text-theme-sidebar-text">Menu</span>
          <button onClick={() => setSidebarOpen(false)} className="text-theme-sidebar-text hover:text-theme-primary"><X size={24} /></button>
        </div>
        
        <div className="px-4 pt-4">
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden border border-white/20">
                    <img src={user?.avatar || ''} className="w-full h-full object-cover" alt="User" />
                </div>
                <div>
                    <h4 className="text-theme-sidebar-text text-sm font-bold">{user?.name?.split(' ')[0]}</h4>
                    <p className="text-theme-primary text-xs font-bold">{user?.plan || 'Free'}</p>
                </div>
            </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" id="dashboard" />
            <SidebarItem icon={LayoutGrid} label="Prompts" id="prompts" />
            <SidebarItem icon={Play} label="Tutoriais" id="tutorials" />
            <SidebarItem icon={Heart} label="Favoritos" id="favorites" />
            <SidebarItem icon={Zap} label="Gerador" id="generator" />
            {isAdmin && <SidebarItem icon={Shield} label="Admin" id="admin" />}
            <SidebarItem icon={User} label="Perfil" id="profile" />
            <SidebarItem icon={LogOut} label="Sair" isLogout />
        </nav>
      </div>

      {/* FAB: Botão Flutuante Mobile */}
      {/* Z-INDEX REDUZIDO PARA z-40 para ficar atrás do menu quando aberto */}
      {!sidebarOpen && (
        <button onClick={() => setSidebarOpen(true)} className="md:hidden fixed bottom-6 right-6 z-40 bg-theme-primary text-white p-4 rounded-full shadow-lg active:scale-95 transition-transform"><Menu size={28} /></button>
      )}
    </>
  );
}