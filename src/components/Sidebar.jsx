import React from 'react';
import { LayoutDashboard, ShoppingBag, LayoutGrid, Play, Zap, Heart, Shield, User, LogOut, Menu, X, Home } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen, sidebarMinimized, setSidebarMinimized, appSettings, isAdmin, onLogout }) {
  
  // Sub-componente interno para os botões
  const SidebarItem = ({ icon: Icon, label, id, isLogout }) => (
    <button 
      onClick={() => isLogout ? onLogout() : (setActiveTab(id), setSidebarOpen(false))} 
      className={`
        flex items-center w-full rounded-xl transition-all duration-200 group font-medium
        ${sidebarMinimized ? 'justify-center px-2 py-4' : 'px-4 py-3'}
        ${activeTab === id && !isLogout ? 'text-blue-500 bg-blue-500/10' : 'text-gray-400 hover:text-white hover:bg-gray-900'}
        ${activeTab === id && !sidebarMinimized && !isLogout ? 'border-l-4 border-blue-500 rounded-l-none' : ''}
        ${isLogout ? 'hover:text-red-400 hover:bg-red-500/10' : ''}
      `}
      title={sidebarMinimized ? label : ''}
    >
      <Icon size={sidebarMinimized ? 28 : 20} className={`${sidebarMinimized ? '' : 'mr-3'} transition-all ${activeTab === id && !isLogout ? 'drop-shadow-[0_0_8px_rgba(37,99,235,0.5)]' : ''}`} />
      {!sidebarMinimized && <span className="truncate animate-fadeIn">{label}</span>}
    </button>
  );

  return (
    <>
      {/* MENU DESKTOP */}
      <aside className={`hidden md:flex flex-col fixed inset-y-0 left-0 z-50 bg-black border-r border-gray-800 transition-all duration-300 ${sidebarMinimized ? 'w-24' : 'w-64'}`}>
        <div className={`p-6 flex items-center ${sidebarMinimized ? 'justify-center' : 'justify-between'} border-b border-gray-800 h-20`}>
           {!sidebarMinimized ? (
               appSettings.logo_menu_url ? <img src={appSettings.logo_menu_url} className="h-8 object-contain"/> : <span className="text-xl font-bold text-white">Prompt<span className="text-blue-600">Lab</span></span>
           ) : (
               <Menu size={28} className="text-blue-600"/>
           )}
           <button onClick={() => setSidebarMinimized(!sidebarMinimized)} className="text-gray-400 hover:text-white focus:outline-none transition-transform hover:scale-110"><Menu size={24} /></button>
        </div>
        
        <nav className={`space-y-2 mt-4 flex-1 overflow-y-auto ${sidebarMinimized ? 'px-2' : 'px-4'}`}>
          <SidebarItem icon={LayoutDashboard} label="Dashboard" id="dashboard" />
          <SidebarItem icon={ShoppingBag} label="Loja Oficial" id="loja" />
          <SidebarItem icon={LayoutGrid} label="Prompts" id="prompts" />
          <SidebarItem icon={Play} label="Tutoriais" id="tutorials" />
          <SidebarItem icon={Zap} label="Geradores" id="generator" />
          <SidebarItem icon={Heart} label="Favoritos" id="favorites" />
          <div className="my-4 border-t border-gray-800 mx-2"></div>
          {isAdmin && <SidebarItem icon={Shield} label="Painel Admin" id="admin" />}
          <SidebarItem icon={User} label="Meu Perfil" id="profile" />
        </nav>
        
        <div className="p-4 border-t border-gray-800">
            <SidebarItem icon={LogOut} label="Sair" isLogout />
        </div>
      </aside>

      {/* MENU MOBILE (INFERIOR) */}
      <div className="md:hidden fixed bottom-0 w-full bg-gray-900 border-t border-gray-800 z-50 flex justify-around items-center p-3 pb-5 safe-area-bottom">
          <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center ${activeTab === 'dashboard' ? 'text-blue-500' : 'text-gray-500'}`}><Home size={24}/><span className="text-[10px] mt-1">Home</span></button>
          <button onClick={() => setActiveTab('loja')} className={`flex flex-col items-center ${activeTab === 'loja' ? 'text-blue-500' : 'text-gray-500'}`}><ShoppingBag size={24}/><span className="text-[10px] mt-1">Loja</span></button>
          <div className="relative -top-5"><button onClick={() => setActiveTab('prompts')} className="bg-blue-600 text-white p-4 rounded-full shadow-lg border-4 border-black"><Images size={24}/></button></div>
          <button onClick={() => setActiveTab('tutorials')} className={`flex flex-col items-center ${activeTab === 'tutorials' ? 'text-blue-500' : 'text-gray-500'}`}><Play size={24}/><span className="text-[10px] mt-1">Aulas</span></button>
          <button onClick={() => setActiveTab(isAdmin ? 'admin' : 'profile')} className={`flex flex-col items-center ${activeTab === 'profile' || activeTab === 'admin' ? 'text-blue-500' : 'text-gray-500'}`}><User size={24}/><span className="text-[10px] mt-1">Perfil</span></button>
      </div>
    </>
  );
}