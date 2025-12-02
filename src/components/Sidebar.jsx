import React from 'react';
import { LayoutDashboard, Zap, LayoutGrid, Play, Heart, Shield, User, LogOut, Menu, X, Home } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen, appSettings, isAdmin, onLogout }) {
  
  const handleNav = (id) => { 
    setActiveTab(id); 
    setSidebarOpen(false); 
  };

  const SidebarItem = ({ icon: Icon, label, id, isLogout, highlight }) => (
    <button 
      onClick={() => isLogout ? onLogout() : handleNav(id)} 
      className={`
        flex items-center w-full px-4 py-3 mb-1 rounded-xl transition-all duration-200 group font-medium
        ${activeTab === id && !isLogout ? 'text-blue-500 bg-blue-500/10 border-l-4 border-blue-500 rounded-l-none' : 'text-gray-400 hover:text-white hover:bg-gray-900'}
        ${isLogout ? 'mt-auto hover:text-red-400 hover:bg-red-500/10' : ''}
        ${highlight ? 'text-white bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]' : ''}
      `}
    >
      <Icon size={20} className={`mr-3 ${highlight ? 'text-blue-400' : ''}`} />
      <span>{label}</span>
    </button>
  );

  return (
    <>
      {/* --- DESKTOP SIDEBAR (FIXA) --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-black border-r border-gray-800 w-64 
        hidden md:flex flex-col transition-all duration-300
      `}>
        {/* Logo Area */}
        <div className="h-20 flex items-center px-6 border-b border-gray-800">
          {appSettings?.logo_menu_url ? (
            <img src={appSettings.logo_menu_url} alt="Logo" className="h-8 object-contain" />
          ) : (
            <span className="text-xl font-bold text-white tracking-tighter">Prompt<span className="text-blue-600">Lab</span></span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" id="dashboard" />
          <SidebarItem icon={Zap} label="Gerador" id="generator" highlight />
          <SidebarItem icon={LayoutGrid} label="Prompts" id="prompts" />
          <SidebarItem icon={Play} label="Tutoriais" id="tutorials" />
          <SidebarItem icon={Heart} label="Favoritos" id="favorites" />
          
          <div className="my-4 border-t border-gray-800 mx-2 opacity-50"></div>
          
          {isAdmin && <SidebarItem icon={Shield} label="Admin" id="admin" />}
          <SidebarItem icon={User} label="Perfil" id="profile" />
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-gray-800">
          <SidebarItem icon={LogOut} label="Sair" isLogout />
        </div>
      </aside>

      {/* --- MOBILE OVERLAY MENU --- */}
      {/* Fundo Escuro (Backdrop) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden animate-fadeIn"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Menu Gaveta Mobile */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col
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
            <SidebarItem icon={Zap} label="Gerador" id="generator" highlight />
            <SidebarItem icon={LayoutGrid} label="Prompts" id="prompts" />
            <SidebarItem icon={Play} label="Tutoriais" id="tutorials" />
            <SidebarItem icon={Heart} label="Favoritos" id="favorites" />
            {isAdmin && <SidebarItem icon={Shield} label="Admin" id="admin" />}
            <SidebarItem icon={User} label="Perfil" id="profile" />
            <SidebarItem icon={LogOut} label="Sair" isLogout />
        </nav>
      </div>

      {/* --- MOBILE FAB (Botão Flutuante) --- */}
      {/* Só aparece se o menu estiver fechado e for mobile */}
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