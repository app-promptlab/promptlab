import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Loader2, Check, Lock, ShoppingCart } from 'lucide-react'; 
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

  // HOOK DO TEMA
  const { identity } = useTheme();

  const showToast = (message) => { setToast(message); setTimeout(() => setToast(null), 3000); };

  // --- EFEITO: ATUALIZA ÍCONES (PC, ANDROID E IOS) ---
  useEffect(() => {
    if (identity?.favicon_url) {
      // 1. Atualiza Favicon (PC)
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = identity.favicon_url;

      // 2. Atualiza Apple Touch Icon (iOS)
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

  // Componente de Bloqueio (Atualizado: Preço Opcional)
  const LockedFeature = ({ title, price, link }) => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-fadeIn">
        <div className="bg-white/5 p-6 rounded-full mb-6">
            <Lock size={64} className="text-theme-primary" />
        </div>
        <h2 className="text-3xl font-bold mb-2 text-white">Acesso Bloqueado</h2>
        <p className="mb-8 text-gray-400 max-w-md">
            Você precisa desbloquear o pacote <strong>{title}</strong> para acessar esta ferramenta exclusiva.
        </p>
        <a href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-theme-primary hover:bg-theme-primary/90 text-white px-8 py-4 rounded-xl font-bold text-lg transition-transform hover:scale-105 shadow-lg shadow-theme-primary/20">
            <ShoppingCart size={24} />
            {price ? `Desbloquear por apenas ${price}` : 'Desbloquear Agora'}
        </a>
        <p className="mt-4 text-sm text-gray-500">Acesso vitalício & liberação imediata.</p>
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
            <main className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-gray-800 w-full">
                {activeTab === 'dashboard' && <Dashboard user={user} changeTab={setActiveTab} />}
                
                {/* GERADOR: Sem preço fixo, apenas Desbloquear */}
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