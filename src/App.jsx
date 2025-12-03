import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Loader2, Check, Menu } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';

import Sidebar from './components/Sidebar';
import AuthScreen from './components/AuthScreen';
import Dashboard from './screens/Dashboard';
import Generator from './screens/Generator';
import PromptsGallery from './screens/PromptsGallery';
import TutorialsPage from './screens/TutorialsPage';
import Profile from './screens/Profile';
import AdminPanel from './screens/AdminPanel';

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

        {/* CORREÇÃO: p-0 no mobile para remover moldura */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-theme-bg relative">
            
            {/* Header Mobile */}
            <div className="md:hidden h-16 bg-theme-sidebar border-b border-white/10 flex items-center px-4 justify-between flex-shrink-0 z-40">
                 <span className="font-bold text-theme-primary text-lg">App</span>
                 <button onClick={() => setSidebarOpen(true)} className="text-theme-text p-2"><Menu size={24}/></button>
            </div>

            {/* Conteúdo: w-full e p-0 no mobile */}
            <main className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-gray-800 w-full">
                {activeTab === 'dashboard' && <Dashboard user={user} changeTab={setActiveTab} />}
                {activeTab === 'generator' && <Generator />}
                {activeTab === 'prompts' && <PromptsGallery user={user} showToast={showToast} onlyFavorites={false} />}
                {activeTab === 'favorites' && <PromptsGallery user={user} showToast={showToast} onlyFavorites={true} />}
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