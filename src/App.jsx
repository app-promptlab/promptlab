import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Loader2, Check } from 'lucide-react';

// Importação das Telas (Certifique-se que criou todos os arquivos acima!)
import Sidebar from './components/Sidebar';
import AuthScreen from './components/AuthScreen';
import Dashboard from './screens/Dashboard';
import Generator from './screens/Generator';
import PromptsGallery from './screens/PromptsGallery';
import TutorialsPage from './screens/TutorialsPage';
import Profile from './screens/Profile';
import AdminPanel from './screens/AdminPanel';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Tabs: dashboard, generator, prompts, tutorials, favorites, admin, profile
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Controle do Menu Mobile e Configs
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appSettings, setAppSettings] = useState(null);
  const [toast, setToast] = useState(null);

  // Função Global de Toast (Notificação)
  const showToast = (message) => { 
    setToast(message); 
    setTimeout(() => setToast(null), 3000); 
  };

  // 1. Inicialização (Auth e Dados)
  useEffect(() => {
    const init = async () => {
      // Pega sessão atual
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Pega perfil completo
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        
        // Verifica Admin (pelo email ou pelo plano)
        const isEmailAdmin = session.user.email === 'app.promptlab@gmail.com'; // Seu email mestre
        const finalPlan = isEmailAdmin ? 'admin' : (profile?.plan || 'free');

        setUser({ ...session.user, ...profile, plan: finalPlan });
      }

      // Pega Configurações Visuais
      const { data: settings } = await supabase.from('app_settings').select().single();
      setAppSettings(settings || {});
      
      setLoading(false);
    };
    init();
  }, []);

  // 2. Login / Cadastro
  const handleLogin = async (email, password, name, isRegister) => {
      setLoading(true);
      let result;
      
      if (isRegister) {
        result = await supabase.auth.signUp({ 
            email, 
            password, 
            options: { data: { name } } 
        });
      } else {
        result = await supabase.auth.signInWithPassword({ email, password });
      }

      const { data, error } = result;

      if (error) {
        alert(error.message);
        setLoading(false);
      } else if (data.user) {
        // Reload força recarregar tudo limpo
        window.location.reload();
      }
  };

  // 3. Renderização
  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-blue-600"><Loader2 size={48} className="animate-spin"/></div>;
  
  if (!user) return <AuthScreen onLogin={handleLogin} />;

  const isAdmin = user.plan === 'admin';

  return (
    <div className="flex h-screen bg-black text-gray-100 font-sans overflow-hidden">
        
        {/* Navegação Lateral */}
        <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            appSettings={appSettings}
            isAdmin={isAdmin}
            onLogout={async () => { await supabase.auth.signOut(); window.location.reload(); }}
        />

        {/* Área Principal */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-black relative">
            <main className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-gray-800">
                
                {activeTab === 'dashboard' && <Dashboard user={user} changeTab={setActiveTab} />}
                
                {/* A Nova Aba Gerador */}
                {activeTab === 'generator' && <Generator />}
                
                {activeTab === 'prompts' && <PromptsGallery user={user} showToast={showToast} />}
                
                {activeTab === 'tutorials' && <TutorialsPage />}
                
                {activeTab === 'favorites' && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <h2 className="text-2xl font-bold text-white mb-2">Meus Favoritos</h2>
                        <p>Seus prompts salvos aparecerão no Dashboard.</p>
                        <button onClick={()=>setActiveTab('dashboard')} className="mt-4 text-blue-500 hover:text-white">Ir para Dashboard</button>
                    </div>
                )}
                
                {/* Apenas Admin acessa */}
                {activeTab === 'admin' && isAdmin && <AdminPanel showToast={showToast} />}
                
                {activeTab === 'profile' && <Profile user={user} showToast={showToast} />}

            </main>
        </div>

        {/* Notificação Toast */}
        {toast && (
            <div className="fixed top-6 right-6 z-[100] bg-blue-600 text-white px-6 py-3 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.5)] animate-fadeIn flex items-center font-bold">
                <Check size={20} className="mr-2"/> {toast}
            </div>
        )}
    </div>
  );
}