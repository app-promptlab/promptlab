import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Loader2, Check } from 'lucide-react';

// Importação das Telas
import Sidebar from './components/Sidebar';
import AuthScreen from './components/AuthScreen'; // Corrigido path
import Dashboard from './screens/Dashboard';
import Generator from './screens/Generator';
import PromptsGallery from './screens/PromptsGallery';
import TutorialsPage from './screens/TutorialsPage';
import Profile from './screens/Profile';
import AdminPanel from './screens/AdminPanel';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appSettings, setAppSettings] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message) => { setToast(message); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        const isEmailAdmin = session.user.email === 'app.promptlab@gmail.com'; 
        const finalPlan = isEmailAdmin ? 'admin' : (profile?.plan || 'free');
        setUser({ ...session.user, ...profile, plan: finalPlan });
      }
      const { data: settings } = await supabase.from('app_settings').select().single();
      setAppSettings(settings || {});
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

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-blue-600"><Loader2 size={48} className="animate-spin"/></div>;
  if (!user) return <AuthScreen onLogin={handleLogin} />;

  const isAdmin = user.plan === 'admin';

  return (
    <div className="flex h-screen bg-black text-gray-100 font-sans overflow-hidden">
        
        <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            appSettings={appSettings}
            isAdmin={isAdmin}
            onLogout={async () => { await supabase.auth.signOut(); window.location.reload(); }}
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-black relative">
            <main className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-gray-800">
                
                {activeTab === 'dashboard' && <Dashboard user={user} changeTab={setActiveTab} />}
                {activeTab === 'generator' && <Generator />}
                
                {/* Galeria Normal */}
                {activeTab === 'prompts' && <PromptsGallery user={user} showToast={showToast} onlyFavorites={false} />}
                
                {/* Galeria de Favoritos (Reutilizando componente com filtro) */}
                {activeTab === 'favorites' && <PromptsGallery user={user} showToast={showToast} onlyFavorites={true} />}
                
                {activeTab === 'tutorials' && <TutorialsPage />}
                {activeTab === 'admin' && isAdmin && <AdminPanel showToast={showToast} />}
                {activeTab === 'profile' && <Profile user={user} showToast={showToast} />}

            </main>
        </div>

        {toast && (
            <div className="fixed top-6 right-6 z-[100] bg-blue-600 text-white px-6 py-3 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.5)] animate-fadeIn flex items-center font-bold">
                <Check size={20} className="mr-2"/> {toast}
            </div>
        )}
    </div>
  );
}