import React from 'react';
import { LayoutDashboard, ShoppingBag, LayoutGrid, Play, Zap, Heart, Shield, User, LogOut, Menu, Home, X } from 'lucide-react';

// Item definido FORA para não causar re-render infinito
const SidebarItem = ({ icon: Icon, label, activeTab, id, onClick, minimized, isLogout }) => {
  const isActive = activeTab === id;
  return (
    <button 
      onClick={onClick} 
      className={`flex items-center w-full rounded-xl transition-all duration-200 group font-medium ${minimized ? 'justify-center px-2 py-4' : 'px-4 py-3'} ${isActive && !isLogout ? 'text-blue-500 bg-blue-500/10 border-l-4 border-blue-500 rounded-l-none' : 'text-gray-400 hover:text-white hover:bg-gray-900'} ${isLogout ? 'hover:text-red-400 hover:bg-red-500/10' : ''}`}
      title={minimized ? label : ''}
    >
      <Icon size={minimized ? 28 : 20} className={`${minimized ? '' : 'mr-3'}`} />
      {!minimized && <span className="truncate">{label}</span>}
    </button>
  );
};

export default function Sidebar({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen, sidebarMinimized, setSidebarMinimized, appSettings, isAdmin, onLogout }) {
  const handleNav = (id) => { setActiveTab(id); setSidebarOpen(false); };

  return (
    <>
      {/* Desktop */}
      <aside className={`hidden md:flex flex-col fixed inset-y-0 left-0 z-50 bg-black border-r border-gray-800 transition-all duration-300 ${sidebarMinimized ? 'w-24' : 'w-64'}`}>
        <div className={`p-6 flex items-center ${sidebarMinimized ? 'justify-center' : 'justify-between'} border-b border-gray-800 h-20`}>
           {!sidebarMinimized ? (appSettings.logo_menu_url ? <img src={appSettings.logo_menu_url} className="h-8 object-contain"/> : <span className="text-xl font-bold text-white">PromptLab</span>) : (<Menu size={28} className="text-blue-600"/>)}
           <button onClick={() => setSidebarMinimized(!sidebarMinimized)} className="text-gray-400 hover:text-white"><Menu size={24} /></button>
        </div>
        <nav className={`space-y-2 mt-4 flex-1 overflow-y-auto px-2`}>
          <SidebarItem icon={LayoutDashboard} label="Dashboard" id="dashboard" activeTab={activeTab} onClick={() => handleNav('dashboard')} minimized={sidebarMinimized} />
          <SidebarItem icon={ShoppingBag} label="Loja" id="loja" activeTab={activeTab} onClick={() => handleNav('loja')} minimized={sidebarMinimized} />
          <SidebarItem icon={LayoutGrid} label="Prompts" id="prompts" activeTab={activeTab} onClick={() => handleNav('prompts')} minimized={sidebarMinimized} />
          <SidebarItem icon={Play} label="Tutoriais" id="tutorials" activeTab={activeTab} onClick={() => handleNav('tutorials')} minimized={sidebarMinimized} />
          {isAdmin && <SidebarItem icon={Shield} label="Admin" id="admin" activeTab={activeTab} onClick={() => handleNav('admin')} minimized={sidebarMinimized} />}
          <SidebarItem icon={User} label="Perfil" id="profile" activeTab={activeTab} onClick={() => handleNav('profile')} minimized={sidebarMinimized} />
        </nav>
        <div className="p-4 border-t border-gray-800"><SidebarItem icon={LogOut} label="Sair" isLogout onClick={onLogout} minimized={sidebarMinimized} /></div>
      </aside>
      {/* Mobile */}
      <div className="md:hidden fixed bottom-0 w-full bg-gray-900 border-t border-gray-800 z-50 flex justify-around items-center p-3 pb-5 safe-area-bottom">
          <button onClick={() => handleNav('dashboard')} className={`flex flex-col items-center ${activeTab==='dashboard'?'text-blue-500':'text-gray-500'}`}><Home size={24}/><span className="text-[10px] mt-1">Home</span></button>
          <button onClick={() => handleNav('loja')} className={`flex flex-col items-center ${activeTab==='loja'?'text-blue-500':'text-gray-500'}`}><ShoppingBag size={24}/><span className="text-[10px] mt-1">Loja</span></button>
          <div className="-mt-6"><button onClick={() => handleNav('prompts')} className="bg-blue-600 text-white p-4 rounded-full shadow-lg border-4 border-black"><Images size={24}/></button></div>
          <button onClick={() => handleNav('tutorials')} className={`flex flex-col items-center ${activeTab==='tutorials'?'text-blue-500':'text-gray-500'}`}><Play size={24}/><span className="text-[10px] mt-1">Aulas</span></button>
          <button onClick={() => handleNav(isAdmin?'admin':'profile')} className={`flex flex-col items-center ${activeTab==='profile'||activeTab==='admin'?'text-blue-500':'text-gray-500'}`}><User size={24}/><span className="text-[10px] mt-1">Perfil</span></button>
      </div>
    </>
  );
}