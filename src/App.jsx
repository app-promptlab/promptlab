import React, { useState, useEffect } from 'react';
import { Loader2, Check } from 'lucide-react';
import { supabase } from './supabaseClient';
import { ToastContext } from './ToastContext';

// Componentes
import Sidebar from './components/Sidebar'; 
import AuthScreen from './components/AuthScreen';

// Telas (Certifique-se que a pasta chama 'screens' e arquivos começam com Maiúscula)
import Dashboard from './screens/Dashboard.jsx';
import PromptsGallery from './screens/PromptsGallery.jsx';
import StorePage from './screens/StorePage.jsx';
import TutorialsPage from './screens/TutorialsPage.jsx';
import AdminPanel from './screens/AdminPanel.jsx';
import Profile from './screens/Profile.jsx';

export default function App() {
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  
  // Estado Global de Configurações e Toast
  const [appSettings, setAppSettings] = useState({ logo_menu_url: '', banner_url: '', logo_header_url: '', logo_position: 'center' }); 
  const [toast, setToast] = useState(null);

  // CORREÇÃO DO LOOP: A função é criada AQUI e passada para baixo. 
  // O App NÃO usa useContext, ele É o dono do contexto.
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Carrega Settings
  useEffect(() => {
    supabase.from('app_settings').select().single().then(({ data }) => {
      if (data) setAppSettings(data);
    });
  }, []);

  // Verifica Login
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchProfileData(session.user.id, session.user.email);
      else setLoading(false);
    });
  }, []);

  const fetchProfileData = async (userId, email) => {
    try {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
        const { data: purchases } = await supabase.from('user_purchases').select('product_id').eq('user_id', userId);
        
        const MEU_EMAIL = "app.promptlab@gmail.com"; 
        const finalPlan = (email === MEU_EMAIL) ? 'admin' : (profile?.plan || 'free');

        setUser({ 
            ...profile, 
            email, 
            plan: finalPlan, 
            access: purchases ? purchases.map(p => p.product_id) : [] 
        });
    } catch (error) { 
        console.error(error); 
        // Fallback para não travar
        setUser({ id: userId, email, plan: 'free' });
    } finally { 
        setLoading(false); 
    }
  };

  const handleLogin = async (email, password, name, isRegister) => {
    setLoading(true);
    try {
        const { data, error } = isRegister 
            ? await supabase.auth.signUp({ email, password, options: { data: { name } } }) 
            : await supabase.auth.signInWithPassword({ email, password });
            
        if (error) throw error;
        if (data.user) {
             // Pequeno delay para garantir que o trigger do banco rodou
             setTimeout(() => fetchProfileData(data.user.id, email), 1000);
        } else {
             alert("Verifique seu email!");
             setLoading(false);
        }
    } catch (error) { alert(error.message); setLoading(false); }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); setUser(null); };

  const handlePurchase = async (productId, checkoutUrl) => {
    if (checkoutUrl) { window.open(checkoutUrl, '_blank'); return; }
    if (confirm('Confirmar compra?')) {
      const { error } = await supabase.from('user_purchases').insert({ user_id: user.id, product_id: productId });
      if (!error) { 
          showToast("Compra realizada!"); 
          // Atualiza dados do usuário localmente
          setUser(prev => ({...prev, access: [...(prev.access || []), productId]}));
      }
    }
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-blue-600"><Loader2 size={48} className="animate-spin" /></div>;
  if (!user) return <AuthScreen onLogin={handleLogin} />;

  const isAdmin = user.plan === 'admin';

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard user={user} settings={appSettings} changeTab={setActiveTab} />;
      case 'prompts': return <PromptsGallery user={user} />;
      case 'tutorials': return <TutorialsPage />;
      case 'loja': return <StorePage packs={[]} onPurchase={handlePurchase} />; // Passa array vazio inicial para evitar crash antes do fetch interno
      case 'admin': return isAdmin ? <AdminPanel updateSettings={(s) => setAppSettings(prev => ({...prev, ...s}))} settings={appSettings} /> : null;
      case 'profile': return <Profile user={user} setUser={setUser} />;
      default: return <Dashboard user={user} settings={appSettings} changeTab={setActiveTab} />;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
        <div className="flex h-screen bg-black text-gray-100 font-sans overflow-hidden">
            <Sidebar 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                sidebarOpen={sidebarOpen} 
                setSidebarOpen={setSidebarOpen} 
                sidebarMinimized={sidebarMinimized}
                setSidebarMinimized={setSidebarMinimized}
                appSettings={appSettings}
                isAdmin={isAdmin}
                onLogout={handleLogout}
            />
            
            <div className={`flex-1 flex flex-col min-w-0 overflow-hidden bg-black transition-all duration-300 ${sidebarMinimized ? 'md:ml-24' : 'md:ml-64'}`}>
                <main className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-gray-800 pb-24 md:pb-0">
                    {renderContent()}
                </main>
            </div>
        </div>
        
        {toast && (
            <div className="fixed top-4 right-4 z-[300] bg-gray-900/95 backdrop-blur-md border border-blue-500 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center animate-fadeIn">
                <div className="bg-blue-500 rounded-full p-1 mr-3"><Check size={14} /></div>
                <span className="font-medium">{toast.message}</span>
            </div>
        )}
    </ToastContext.Provider>
  );
}