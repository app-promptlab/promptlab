import React from 'react';
import { LayoutDashboard, ShoppingBag, LayoutGrid, Play, Zap, Heart, Shield, User, LogOut, Menu, Home } from 'lucide-react';

// O componente do botão fica FORA da função principal
const SidebarItem = ({ icon: Icon, label, activeTab, id, onClick, minimized, isLogout }) => {
  const isActive = activeTab === id;
  return (
    <button 
      onClick={onClick} 
      className={`
        flex items-center w-full rounded-xl transition-all duration-200 group font-medium
        ${minimized ? 'justify-center px-2 py-4' : 'px-4 py-3'}
        ${isActive && !isLogout ? 'text-blue-600 bg-blue-600/10' : 'text-gray-400 hover:text-white hover:bg-gray-900'}
        ${isActive && !minimized && !isLogout ? 'border-l-4 border-blue-600 rounded-l-none' : ''}
        ${isLogout ? 'hover:text-red-400 hover:bg-red-500/10' : ''}
      `}
      title={minimized ? label : ''}
    >
      <Icon size={minimized ? 28 : 20} className={`${minimized ? '' : 'mr-3'} transition-all ${isActive && !isLogout ? 'drop-shadow-[0_0_8px_rgba(37,99,235,0.5)]' : ''}`} />
      {!minimized && <span className="truncate animate-fadeIn">{label}</span>}
    </button>
  );
};

export default function Sidebar({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen, sidebarMinimized, setSidebarMinimized, appSettings, isAdmin, onLogout }) {
  
  const handleNav = (id) => {
      setActiveTab(id);
      setSidebarOpen(false);
  };

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
          <SidebarItem icon={LayoutDashboard} label="Dashboard" id="dashboard" activeTab={activeTab} onClick={() => handleNav('dashboard')} minimized={sidebarMinimized} />
          <SidebarItem icon={ShoppingBag} label="Loja Oficial" id="loja" activeTab={activeTab} onClick={() => handleNav('loja')} minimized={sidebarMinimized} />
          <SidebarItem icon={LayoutGrid} label="Prompts" id="prompts" activeTab={activeTab} onClick={() => handleNav('prompts')} minimized={sidebarMinimized} />
          <SidebarItem icon={Play} label="Tutoriais" id="tutorials" activeTab={activeTab} onClick={() => handleNav('tutorials')} minimized={sidebarMinimized} />
          <SidebarItem icon={Zap} label="Geradores" id="generator" activeTab={activeTab} onClick={() => handleNav('generator')} minimized={sidebarMinimized} />
          <SidebarItem icon={Heart} label="Favoritos" id="favorites" activeTab={activeTab} onClick={() => handleNav('favorites')} minimized={sidebarMinimized} />
          <div className="my-4 border-t border-gray-800 mx-2"></div>
          {isAdmin && <SidebarItem icon={Shield} label="Painel Admin" id="admin" activeTab={activeTab} onClick={() => handleNav('admin')} minimized={sidebarMinimized} />}
          <SidebarItem icon={User} label="Meu Perfil" id="profile" activeTab={activeTab} onClick={() => handleNav('profile')} minimized={sidebarMinimized} />
        </nav>
        
        <div className="p-4 border-t border-gray-800">
            <SidebarItem icon={LogOut} label="Sair" isLogout onClick={onLogout} minimized={sidebarMinimized} />
        </div>
      </aside>

      {/* MENU MOBILE */}
      <div className="md:hidden fixed bottom-0 w-full bg-gray-900 border-t border-gray-800 z-50 flex justify-around items-center p-3 pb-5 safe-area-bottom">
          <button onClick={() => handleNav('dashboard')} className={`flex flex-col items-center ${activeTab === 'dashboard' ? 'text-blue-500' : 'text-gray-500'}`}><Home size={24}/><span className="text-[10px] mt-1">Home</span></button>
          <button onClick={() => handleNav('loja')} className={`flex flex-col items-center ${activeTab === 'loja' ? 'text-blue-500' : 'text-gray-500'}`}><ShoppingBag size={24}/><span className="text-[10px] mt-1">Loja</span></button>
          <div className="relative -top-5"><button onClick={() => handleNav('prompts')} className="bg-blue-600 text-white p-4 rounded-full shadow-lg border-4 border-black"><Images size={24}/></button></div>
          <button onClick={() => handleNav('tutorials')} className={`flex flex-col items-center ${activeTab === 'tutorials' ? 'text-blue-500' : 'text-gray-500'}`}><Play size={24}/><span className="text-[10px] mt-1">Aulas</span></button>
          <button onClick={() => handleNav(isAdmin ? 'admin' : 'profile')} className={`flex flex-col items-center ${activeTab === 'profile' || activeTab === 'admin' ? 'text-blue-500' : 'text-gray-500'}`}><User size={24}/><span className="text-[10px] mt-1">Perfil</span></button>
      </div>
    </>
  );
}