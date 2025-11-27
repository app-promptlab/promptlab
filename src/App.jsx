import React, { useState, useEffect } from 'react';
import { Loader2, Check } from 'lucide-react';
import { supabase } from './supabaseClient';
import { ToastContext } from './ToastContext';

import Sidebar from './components/Sidebar'; 
import AuthScreen from './components/AuthScreen';
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
  const [appSettings, setAppSettings] = useState({ logo_menu_url: '', banner_url: '', logo_header_url: '', logo_position: 'center' }); 
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const init = async () => {
        const { data: settings } = await supabase.from('app_settings').select().single();
        if (settings) setAppSettings(settings);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
             const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
             const { data: purchases } = await supabase.from('user_purchases').select('product_id').eq('user_id', session.user.id);
             const isAdmin = session.user.email === 'app.promptlab@gmail.com' || profile?.plan === 'admin';
             setUser({ ...session.user, ...profile, plan: isAdmin ? 'admin' : profile?.plan || 'free', access: purchases ? purchases.map(p=>p.product_id) : [] });
        }
        setLoading(false);
    };
    init();
  }, []);

  const handleLogin = async (email, password, name, isRegister) => {
    setLoading(true);
    try {
        let { data, error } = isRegister ? await supabase.auth.signUp({ email, password, options: { data: { name } } }) : await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) window.location.reload();
    } catch (error) { alert("Erro: " + error.message); setLoading(false); }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); setUser(null); };

  const handlePurchase = async (productId, checkoutUrl) => {
    if (checkoutUrl) { window.open(checkoutUrl, '_blank'); return; }
    if (confirm('Confirmar compra?')) {
      const { error } = await supabase.from('user_purchases').insert({ user_id: user.id, product_id: productId });
      if (!error) { showToast("Compra realizada!"); }
    }
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-blue-600"><Loader2 size={48} className="animate-spin" /></div>;
  if (!user) return <AuthScreen onLogin={handleLogin} />;

  return (
    <ToastContext.Provider value={{ showToast }}>
        <div className="flex h-screen bg-black text-gray-100 font-sans overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} sidebarMinimized={sidebarMinimized} setSidebarMinimized={setSidebarMinimized} appSettings={appSettings} isAdmin={user.plan === 'admin'} onLogout={handleLogout} />
        <div className={`flex-1 flex flex-col min-w-0 overflow-hidden bg-black transition-all duration-300 ${sidebarMinimized ? 'md:ml-24' : 'md:ml-64'}`}>
            <main className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-gray-800 pb-24 md:pb-0">
                {activeTab === 'dashboard' && <Dashboard user={user} settings={appSettings} changeTab={setActiveTab}/>}
                {activeTab === 'prompts' && <PromptsGallery user={user} />}
                {activeTab === 'tutorials' && <TutorialsPage />}
                {activeTab === 'loja' && <StorePage packs={[]} onPurchase={handlePurchase} />}
                {activeTab === 'admin' && user.plan === 'admin' && <AdminPanel updateSettings={(s) => setAppSettings(prev => ({...prev, ...s}))} settings={appSettings} />}
                {activeTab === 'profile' && <Profile user={user} setUser={setUser} />}
            </main>
        </div>
        </div>
        {toast && (<div className="fixed top-4 right-4 z-[200] bg-gray-900/90 backdrop-blur-md border border-blue-500 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center animate-fadeIn"><div className="bg-blue-500 rounded-full p-1 mr-3"><Check size={14} /></div><span className="font-medium">{toast.message}</span></div>)}
    </ToastContext.Provider>
  );
}