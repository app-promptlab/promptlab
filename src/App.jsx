import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Loader2, Check, Lock, ShoppingCart, Zap, Bot, Star, ShieldCheck } from 'lucide-react'; 
import { ThemeProvider, useTheme } from './context/ThemeContext';

import Sidebar from './components/Sidebar';
import AuthScreen from './components/AuthScreen';
import Dashboard from './screens/Dashboard';
import Generator from './screens/Generator';
import PromptsGallery from './screens/PromptsGallery';
import TutorialsPage from './screens/TutorialsPage';
import Profile from './screens/Profile';
import AdminPanel from './screens/AdminPanel';

// --- CONFIGURAÇÃO: Coloque seus links de checkout da Kiwify aqui ---
const LINK_CHECKOUT_PROMPTS = "https://pay.kiwify.com.br/hgxpno4";
const LINK_CHECKOUT_GERADOR = "https://pay.kiwify.com.br/63gP2T1";
// -------------------------------------------------------------------

export default function AppWrapper() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const { identity } = useTheme();

  const showToast = (message) => { setToast(message); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    if (identity?.favicon_url) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = identity.favicon_url;

      let appleLink = document.querySelector("link[rel='apple-touch-icon']");
      if (!appleLink) {
        appleLink = document.createElement('link');
        appleLink.rel = 'apple-touch-icon';
        document.getElementsByTagName('head')[0].appendChild(appleLink);
      }
      appleLink.href = identity.favicon_url;
    }
  }, [identity]);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        const isEmailAdmin = session.user.email === 'app.promptlab@gmail.com'; 
        
        const finalUser = {
            ...session.user,
            ...profile,
            plan: isEmailAdmin ? 'admin' : (profile?.plan || 'free'),
            has_prompts: isEmailAdmin ? true : (profile?.has_prompts || false),
            has_generators: isEmailAdmin ? true : (profile?.has_generators || false)
        };

        setUser(finalUser);
      }
      setLoading(false);
    };
    init();
  }, []);

  const handleLogin = async (email, password, name, isRegister) => {
      setLoading(true);
      let result;
      if (isRegister) {
        result = await supabase.auth.signUp({ email, password, options: { data: { name } } });
      } else {
        result = await supabase.auth.signInWithPassword({ email, password });
      }
      const { data, error } = result;
      if (error) { alert(error.message); setLoading(false); } 
      else if (data.user) { window.location.reload(); }
  };

  // --- NOVA TELA DE BLOQUEIO (ESTILO LANDING PAGE) ---
  const LockedFeature = ({ title, price, link }) => (
    <div className="flex flex-col items-center justify-center min-h-full text-center p-6 animate-fadeIn relative overflow-hidden">
        
        {/* Fundo Decorativo */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-purple-900/10 to-black pointer-events-none"></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 max-w-lg w-full bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
            
            {/* Ícone Hero */}
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20">
                <Bot size={40} className="text-white" />
            </div>

            <h2 className="text-3xl font-bold mb-3 text-white">
                Instale o Cérebro do <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">PromptLab</span>
            </h2>
            
            <p className="text-gray-300 mb-8 leading-relaxed">
                Transforme seu ChatGPT e Gemini em especialistas de criação visual. 
                Tenha a inteligência do Nano Banana direto na sua conta.
            </p>

            {/* Lista de Benefícios */}
            <div className="grid grid-cols-1 gap-3 mb-8 text-left">
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                    <div className="bg-green-500/20 p-1.5 rounded-full"><Check size={16} className="text-green-400"/></div>
                    <span className="text-sm font-bold text-gray-200">Instalação em 1 Clique (Plug & Play)</span>
                </div>
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                    <div className="bg-blue-500/20 p-1.5 rounded-full"><Zap size={16} className="text-blue-400"/></div>
                    <span className="text-sm font-bold text-gray-200">Compatível com Gemini e ChatGPT</span>
                </div>
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                    <div className="bg-yellow-500/20 p-1.5 rounded-full"><Star size={16} className="text-yellow-400"/></div>
                    <span className="text-sm font-bold text-gray-200">Geração de Prompts Profissionais</span>
                </div>
            </div>
            
            <a 
                href={link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-1"
            >
                <div className="absolute inset-0 rounded-xl border border-white/20 group-hover:border-white/40 transition-colors"></div>
                <ShoppingCart size={22} />
                {price ? `Liberar Acesso por ${price}` : 'QUERO DESBLOQUEAR AGORA'}
            </a>
            
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
                <ShieldCheck size={14} />
                <span>Compra segura & Acesso vitalício imediato</span>
            </div>
        </div>
    </div>
  );

  if (loading) return <div className="h-screen bg-theme-bg flex items-center justify-center text-theme-primary"><Loader2 size={48} className="animate-spin"/></div>;
  if (!user) return <AuthScreen onLogin={handleLogin} />;

  const isAdmin = user.plan === 'admin';

  return (
    <div className="flex h-screen bg-theme-bg text-theme-text font-sans overflow-hidden">
        
        <Sidebar 
            user={user} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            sidebarOpen={sidebarOpen} 
            setSidebarOpen={setSidebarOpen} 
            isAdmin={isAdmin} 
            onLogout={async () => { await supabase.auth.signOut(); window.location.reload(); }} 
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-theme-bg relative">
            {/* CORREÇÃO AQUI: Adicionado overflow-x-hidden para travar rolagem lateral */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden p-0 scrollbar-thin scrollbar-thumb-gray-800 w-full">
                {activeTab === 'dashboard' && <Dashboard user={user} changeTab={setActiveTab} />}
                
                {/* GERADOR: Versão Nova "Vendedora" */}
                {activeTab === 'generator' && (
                    user.has_generators 
                    ? <Generator /> 
                    : <LockedFeature title="Gerador Inteligente" link={LINK_CHECKOUT_GERADOR} />
                )}
                
                {activeTab === 'prompts' && (<PromptsGallery user={user} showToast={showToast} onlyFavorites={false} />)}
                {activeTab === 'favorites' && (<PromptsGallery user={user} showToast={showToast} onlyFavorites={true} />)}
                {activeTab === 'tutorials' && <TutorialsPage />}
                {activeTab === 'admin' && isAdmin && <AdminPanel showToast={showToast} />}
                {activeTab === 'profile' && <Profile user={user} showToast={showToast} />}
            </main>
        </div>

        {toast && (
            <div className="fixed top-6 right-6 z-[200] bg-theme-primary text-white px-6 py-3 rounded-xl shadow-lg animate-fadeIn flex items-center font-bold">
                <Check size={20} className="mr-2"/> {toast}
            </div>
        )}
    </div>
  );
}