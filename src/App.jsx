import React, { useState, useEffect } from 'react';
import { Loader2, Check } from 'lucide-react';
import { supabase } from './supabaseClient';
import { ToastContext } from './ToastContext';

// Importa Componentes
import Sidebar from './components/Sidebar'; 
import AuthScreen from './components/AuthScreen';

// Importa Telas (DA PASTA SCREENS)
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
  
  // Estados Globais
  const [appSettings, setAppSettings] = useState({ 
    logo_menu_url: '', 
    banner_url: '', 
    logo_header_url: '', 
    logo_position: 'center' 
  }); 
  
  const [toast, setToast] = useState(null);

  // Função de Toast (Criada aqui para ser passada para baixo)
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 1. Carrega Configurações Visuais
  useEffect(() => {
    const fetchSettings = async () => {
        const { data } = await supabase.from('app_settings').select().single();
        if (data) setAppSettings(data);
    };
    fetchSettings();
  }, []);

  // 2. Verifica Sessão (Login)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
          await fetchProfileData(session.user.id, session.user.email);
      } else {
          setLoading(false);
      }
    };
    checkSession();
  }, []);

  // 3. Busca Dados do Perfil
  const fetchProfileData = async (userId, email) => {
    try {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
        const { data: purchases } = await supabase.from('user_purchases').select('product_id').eq('user_id', userId);
        
        // TRAVA DE ADMIN (Seu E-mail)
        const MEU_EMAIL = "app.promptlab@gmail.com"; 
        const finalPlan = (email === MEU_EMAIL) ? 'admin' : (profile?.plan || 'free');

        setUser({ 
            ...profile, 
            email: email, 
            plan: finalPlan, 
            access: purchases ? purchases.map(p => p.product_id) : [] 
        });
    } catch (error) { 
        console.error("Erro ao carregar perfil:", error); 
        // Mesmo com erro, libera o acesso básico para não travar em tela branca
        setUser({ id: userId, email, plan: 'free', name: 'Usuário' });
    } finally { 
        setLoading(false); 
    }
  };

  // 4. Login
  const handleLogin = async (email, password, name, isRegister) => {
    setLoading(true);
    try {
        let authResult;
        if (isRegister) {
            authResult = await supabase.auth.signUp({ email, password, options: { data: { name } } });
        } else {
            authResult = await supabase.auth.signInWithPassword({ email, password });
        }

        if (authResult.error) throw authResult.error;
        
        if (authResult.data.user) {
            // Sucesso! Busca o perfil
            await fetchProfileData(authResult.data.user.id, email);
        } else if (isRegister) { 
            alert("Verifique seu email para confirmar o cadastro!"); 
            setLoading(false); 
        }
    } catch (error) {
        alert("Erro: " + error.message);
        setLoading(false);
    }
  };

  // 5. Logout
  const handleLogout = async () => { 
      await supabase.auth.signOut(); 
      setUser(null); 
      setActiveTab('dashboard');
  };

  // 6. Compra
  const handlePurchase = async (productId, checkoutUrl) => {
    if (checkoutUrl) { window.open(checkoutUrl, '_blank'); return; }
    if (window.confirm(`Confirmar compra?`)) {
      const { error } = await supabase.from('user_purchases').insert({ user_id: user.id, product_id: productId });
      if (!error) { 
          setUser(prev => ({ ...prev, access: [...prev.access, productId] })); 
          showToast("Compra realizada!"); 
      }
    }
  };

  // Renderização Condicional (Evita erros de null)
  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-blue-600"><Loader2 size={48} className="animate-spin" /></div>;
  
  if (!user) return <AuthScreen onLogin={handleLogin} />;

  const isAdmin = user.plan === 'admin';

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard user={user} settings={appSettings} changeTab={setActiveTab} />;
      case 'prompts': return <PromptsGallery user={user} />;
      case 'tutorials': return <TutorialsPage />;
      case 'loja': return <StorePage packs={[]} onPurchase={handlePurchase} />; // Passa array vazio inicial para evitar crash
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
        
        {/* Toast Global */}
        {toast && (
            <div className="fixed top-4 right-4 z-[300] bg-gray-900/95 backdrop-blur-md border border-blue-500 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center animate-fadeIn">
                <div className="bg-blue-500 rounded-full p-1 mr-3"><Check size={14} /></div>
                <span className="font-medium">{toast.message}</span>
            </div>
        )}
    </ToastContext.Provider>
  );
}