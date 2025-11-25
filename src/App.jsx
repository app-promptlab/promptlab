import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  LayoutDashboard, Images, Star, Zap, BookOpen, User, LogOut, Menu, X, 
  Heart, Copy, Check, ExternalLink, Camera, Edit3, Lock, Unlock, 
  ShoppingCart, Sparkles, Play, Mail, ArrowRight, Loader2, Database, 
  Trash2, Bold, Italic, Underline, Link as LinkIcon, List, AlignLeft, 
  Facebook, Instagram, Music, Key, ChevronLeft, ChevronRight, Crown,
  Shield, Save, Plus, Search, Users,
  ShoppingBag, Settings, UploadCloud,
  Twitter, Linkedin, Globe, Github, HelpCircle, LayoutGrid, Monitor, Home, FileText
} from 'lucide-react';

// --- CONEXÃO COM SUPABASE ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- CONTEXTO DE TOAST ---
const ToastContext = React.createContext();

// --- COMPONENTE PRINCIPAL ---
export default function App() {
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null); 

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) await fetchProfileData(session.user.id, session.user.email);
      else setLoading(false);
    };
    checkSession();
  }, []);

  const fetchProfileData = async (userId, email) => {
    try {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
        const { data: purchases } = await supabase.from('user_purchases').select('product_id').eq('user_id', userId);
        const accessList = purchases ? purchases.map(p => p.product_id) : [];
        
        const MEU_EMAIL = "app.promptlab@gmail.com"; 
        const finalPlan = (email === MEU_EMAIL || profile?.plan === 'admin') ? 'admin' : (profile?.plan || 'free');

        setUser({
            ...profile,
            email: email,
            name: profile?.name || 'Usuário',
            access: accessList, 
            plan: finalPlan,
            avatar: profile?.avatar || 'https://egeomuvpkfjpvllzrugc.supabase.co/storage/v1/object/public/promptlab/logossemslogan.png',
            cover: profile?.cover || 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1000&q=80'
        });
    } catch (error) { console.error(error); setUser(null); } finally { setLoading(false); }
  };

  const handleLogin = async (email, password, name, isRegister) => {
    setLoading(true);
    try {
        let authResponse = isRegister ? 
            await supabase.auth.signUp({ email, password, options: { data: { name } } }) : 
            await supabase.auth.signInWithPassword({ email, password });
        
        if (authResponse.error) throw authResponse.error;
        if (authResponse.data.user) setTimeout(() => fetchProfileData(authResponse.data.user.id, email), 1500);
        else { alert("Verifique seu email!"); setLoading(false); }
    } catch (error) { alert("Erro: " + error.message); setLoading(false); }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); setUser(null); };

  const handlePurchase = async (productId, checkoutUrl) => {
    if(checkoutUrl) {
        window.open(checkoutUrl, '_blank');
        return;
    }
    if (window.confirm(`Confirmar compra manual?`)) {
      const { error } = await supabase.from('user_purchases').insert({ user_id: user.id, product_id: productId });
      if (!error) {
          setUser(prev => ({ ...prev, access: [...prev.access, productId] }));
          showToast("Compra registrada!");
      }
    }
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-blue-600"><Loader2 size={48} className="animate-spin" /></div>;
  if (!user) return <AuthScreen onLogin={handleLogin} />;

  return (
    <ToastContext.Provider value={{ showToast }}>
        <MainApp user={user} setUser={setUser} onLogout={handleLogout} onPurchase={handlePurchase} />
        {toast && (
            <div className="fixed top-4 right-4 z-[200] bg-gray-900/90 backdrop-blur-md border border-blue-500 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center animate-fadeIn">
                <div className="bg-blue-500 rounded-full p-1 mr-3"><Check size={14} /></div><span className="font-medium">{toast.message}</span>
            </div>
        )}
    </ToastContext.Provider>
  );
}

function ImageUploader({ currentImage, onUploadComplete, label, compact = false }) {
  const [uploading, setUploading] = useState(false);
  const { showToast } = React.useContext(ToastContext) || { showToast: alert };

  const uploadImage = async (event) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) throw new Error('Selecione uma imagem.');
      const file = event.target.files[0];
      const fileName = `${Math.random()}.${file.name.split('.').pop()}`;
      const { error } = await supabase.storage.from('uploads').upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage.from('uploads').getPublicUrl(fileName);
      onUploadComplete(data.publicUrl);
      showToast("Imagem enviada!");
    } catch (error) { alert('Erro: ' + error.message); } finally { setUploading(false); }
  };

  return (
    <div className={`relative group ${compact ? '' : 'mb-4'}`}>
      {!compact && <label className="text-gray-400 text-sm font-bold block mb-2">{label}</label>}
      <div className="flex items-center gap-3">
         <input type="file" accept="image/*" onChange={uploadImage} className="hidden" id={`file-${label}`} disabled={uploading}/>
         <label htmlFor={`file-${label}`} className={`cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-lg flex items-center ${uploading ? 'opacity-50' : ''}`}>
             {uploading ? <Loader2 size={16} className="animate-spin mr-2"/> : <UploadCloud size={16} className="mr-2"/>}
             {uploading ? '...' : (compact ? 'Trocar' : 'Escolher Imagem')}
         </label>
         {!compact && currentImage && <img src={currentImage} className="h-10 w-10 rounded object-cover border border-gray-700"/>}
      </div>
    </div>
  );
}

// --- TELA DE LOGIN (WARP SPEED) ---
function AuthScreen({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const canvasRef = useRef(null);
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => { supabase.from('app_settings').select('logo_header_url').single().then(({data}) => { if(data) setLogoUrl(data.logo_header_url); }); }, []);

  useEffect(() => {
    const canvas = canvasRef.current; const ctx = canvas.getContext('2d');
    let width = window.innerWidth; let height = window.innerHeight; canvas.width = width; canvas.height = height;
    let stars = []; for(let i=0; i<200; i++) stars.push({x: (Math.random()-0.5)*width, y: (Math.random()-0.5)*height, z: Math.random()*width});
    const render = () => {
        ctx.fillStyle = 'black'; ctx.fillRect(0, 0, width, height); ctx.fillStyle = 'white';
        stars.forEach(star => {
            star.z -= 2; if(star.z <= 0) { star.z = width; star.x = (Math.random()-0.5)*width; star.y = (Math.random()-0.5)*height; }
            const x = (star.x / star.z) * width + width/2; const y = (star.y / star.z) * height + height/2; const size = (1 - star.z / width) * 3;
            if(x>0 && x<width && y>0 && y<height) { ctx.globalAlpha = (1 - star.z / width); ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1; }
        });
        requestAnimationFrame(render);
    };
    render();
  }, []);
  
  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden font-sans select-none">
      <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-60" />
      <div className="w-full max-w-md bg-gray-900/60 backdrop-blur-xl p-10 rounded-3xl border border-white/10 relative z-10 transition-all duration-500 hover:scale-[1.02] hover:border-blue-500/50 hover:shadow-[0_0_60px_rgba(37,99,235,0.2)] shadow-2xl">
        <div className="text-center mb-8">
            {logoUrl ? <img src={logoUrl} className="h-24 mx-auto mb-6 object-contain drop-shadow-2xl animate-fadeIn"/> : <h2 className="text-5xl font-bold text-white mb-4 tracking-tighter">Prompt<span className="text-blue-600">Lab</span></h2>}
            <p className="text-gray-400 text-sm font-medium tracking-widest uppercase">{isRegister ? "Junte-se à revolução" : "Acesse o Futuro"}</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onLogin(email, password, name, isRegister); }} className="space-y-6">
          {isRegister && <div className="group/input"><input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-black/40 border border-gray-700 rounded-xl p-4 text-white focus:border-blue-500 focus:bg-black/60 outline-none transition-all" placeholder="Nome completo" /></div>}
          <div className="group/input"><input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black/40 border border-gray-700 rounded-xl p-4 text-white focus:border-blue-500 focus:bg-black/60 outline-none transition-all" placeholder="Seu e-mail" /></div>
          <div className="group/input"><input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black/40 border border-gray-700 rounded-xl p-4 text-white focus:border-blue-500 focus:bg-black/60 outline-none transition-all" placeholder="Sua senha" /></div>
          <button type="submit" className="w-full bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-600 hover:to-blue-400 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 uppercase tracking-widest text-xs mt-4">{isRegister ? "Iniciar Jornada" : "Entrar na Plataforma"}</button>
        </form>
        <button onClick={() => setIsRegister(!isRegister)} className="w-full text-center mt-8 text-xs text-gray-500 hover:text-white transition-colors">{isRegister ? "Já possui conta? Login" : "Ainda não tem conta? Criar agora"}</button>
      </div>
    </div>
  );
}

// --- APP PRINCIPAL ---
function MainApp({ user, setUser, onLogout, onPurchase }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false); 
  const [appSettings, setAppSettings] = useState({ logo_menu_url: '', banner_url: '', logo_header_url: '', logo_position: 'center' }); 
  const isAdmin = user.plan === 'admin';

  useEffect(() => {
    const fetchData = async () => {
      const { data: settingsRes } = await supabase.from('app_settings').select().single();
      if (settingsRes) setAppSettings(settingsRes);
    };
    fetchData();
  }, []);

  const updateSettings = (newSettings) => setAppSettings(prev => ({ ...prev, ...newSettings }));

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard changeTab={setActiveTab} user={user} settings={appSettings} />;
      case 'prompts': return <PromptsGallery user={user} onPurchase={onPurchase} />;
      case 'tutorials': return <TutorialsPage />;
      case 'loja': return <StorePage onPurchase={onPurchase} />;
      case 'favorites': return <Favorites />;
      case 'generator': return <GeneratorsHub />;
      case 'admin': return isAdmin ? <AdminPanel user={user} updateSettings={updateSettings} settings={appSettings} /> : null;
      case 'profile': return <Profile user={user} setUser={setUser} />;
      default: return <Dashboard changeTab={setActiveTab} user={user} settings={appSettings} />;
    }
  };

  return (
    <div className="flex h-screen bg-black text-gray-100 font-sans overflow-hidden">
      <aside className={`hidden md:flex flex-col fixed inset-y-0 left-0 z-50 bg-black border-r border-gray-800 transition-all duration-300 ${sidebarMinimized ? 'w-24' : 'w-64'}`}>
        <div className={`p-6 flex items-center ${sidebarMinimized ? 'justify-center' : 'justify-between'} border-b border-gray-800 h-20`}>
           {!sidebarMinimized ? (appSettings.logo_menu_url ? <img src={appSettings.logo_menu_url} className="h-8 object-contain"/> : <span className="text-xl font-bold text-white">Prompt<span className="text-blue-600">Lab</span></span>) : (<Menu size={28} className="text-blue-600"/>)}
           <button onClick={() => setSidebarMinimized(!sidebarMinimized)} className="text-gray-400 hover:text-white focus:outline-none transition-transform hover:scale-110"><Menu size={24} /></button>
        </div>
        <nav className={`space-y-2 mt-4 flex-1 overflow-y-auto ${sidebarMinimized ? 'px-2' : 'px-4'}`}>
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} minimized={sidebarMinimized} />
          <SidebarItem icon={ShoppingBag} label="Loja Oficial" active={activeTab === 'loja'} onClick={() => setActiveTab('loja')} minimized={sidebarMinimized} />
          <SidebarItem icon={LayoutGrid} label="Prompts" active={activeTab === 'prompts'} onClick={() => setActiveTab('prompts')} minimized={sidebarMinimized} />
          <SidebarItem icon={Play} label="Tutoriais" active={activeTab === 'tutorials'} onClick={() => setActiveTab('tutorials')} minimized={sidebarMinimized} />
          <SidebarItem icon={Zap} label="Geradores" active={activeTab === 'generator'} onClick={() => setActiveTab('generator')} minimized={sidebarMinimized} />
          <SidebarItem icon={Heart} label="Favoritos" active={activeTab === 'favorites'} onClick={() => setActiveTab('favorites')} minimized={sidebarMinimized} />
          <div className="my-4 border-t border-gray-800 mx-2"></div>
          {isAdmin && <SidebarItem icon={Shield} label="Painel Admin" active={activeTab === 'admin'} onClick={() => setActiveTab('admin')} minimized={sidebarMinimized} />}
          <SidebarItem icon={User} label="Meu Perfil" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} minimized={sidebarMinimized} />
        </nav>
        <div className="p-4 border-t border-gray-800"><SidebarItem icon={LogOut} label="Sair" onClick={onLogout} minimized={sidebarMinimized} isLogout/></div>
      </aside>

      <div className="md:hidden fixed bottom-0 w-full bg-gray-900 border-t border-gray-800 z-50 flex justify-around items-center p-3 pb-5 safe-area-bottom">
          <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center ${activeTab === 'dashboard' ? 'text-blue-500' : 'text-gray-500'}`}><Home size={24}/><span className="text-[10px] mt-1">Home</span></button>
          <button onClick={() => setActiveTab('loja')} className={`flex flex-col items-center ${activeTab === 'loja' ? 'text-blue-500' : 'text-gray-500'}`}><ShoppingBag size={24}/><span className="text-[10px] mt-1">Loja</span></button>
          <div className="relative -top-5"><button onClick={() => setActiveTab('prompts')} className="bg-blue-600 text-white p-4 rounded-full shadow-lg border-4 border-black"><Images size={24}/></button></div>
          <button onClick={() => setActiveTab('tutorials')} className={`flex flex-col items-center ${activeTab === 'tutorials' ? 'text-blue-500' : 'text-gray-500'}`}><Play size={24}/><span className="text-[10px] mt-1">Aulas</span></button>
          <button onClick={() => setActiveTab(isAdmin ? 'admin' : 'profile')} className={`flex flex-col items-center ${activeTab === 'profile' || activeTab === 'admin' ? 'text-blue-500' : 'text-gray-500'}`}><User size={24}/><span className="text-[10px] mt-1">Perfil</span></button>
      </div>

      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden bg-black transition-all duration-300 ${sidebarMinimized ? 'md:ml-24' : 'md:ml-64'}`}>
        <main className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-gray-800 pb-24 md:pb-0">{renderContent()}</main>
      </div>
    </div>
  );
}

function SidebarItem({ icon: Icon, label, active, onClick, minimized, isLogout }) {
  return (
    <button onClick={onClick} className={`flex items-center w-full rounded-xl transition-all duration-200 group font-medium ${minimized ? 'justify-center px-2 py-4' : 'px-4 py-3'} ${active && !isLogout ? 'text-blue-500 bg-blue-500/10' : 'text-gray-400 hover:text-white hover:bg-gray-900'} ${active && !minimized && !isLogout ? 'border-l-4 border-blue-500 rounded-l-none' : ''} ${isLogout ? 'hover:text-red-400 hover:bg-red-500/10' : ''}`} title={minimized ? label : ''}>
      <Icon size={minimized ? 28 : 20} className={`${minimized ? '' : 'mr-3'} transition-all ${active && !isLogout ? 'drop-shadow-[0_0_8px_rgba(37,99,235,0.5)]' : ''}`} />
      {!minimized && <span className="truncate animate-fadeIn">{label}</span>}
    </button>
  );
}

// --- DASHBOARD (NETFLIX STYLE CAROUSELS) ---
function Dashboard({ changeTab, user, settings }) {
  const [featuredPrompts, setFeaturedPrompts] = useState([]);
  const [featuredTutorials, setFeaturedTutorials] = useState([]);
  const [news, setNews] = useState([]);
  const isAdmin = user.plan === 'admin';

  useEffect(() => {
      supabase.from('pack_items').select('*').eq('is_featured', true).limit(10).then(({data}) => setFeaturedPrompts(data || []));
      supabase.from('tutorials_videos').select('*').eq('is_featured', true).limit(10).then(({data}) => setFeaturedTutorials(data || []));
      supabase.from('news').select('*').limit(2).order('id', {ascending:false}).then(({data}) => setNews(data || []));
  }, []);

  return (
    <div className="w-full animate-fadeIn">
      <div className="relative w-full h-64 md:h-80 bg-gray-900 overflow-hidden">
          {settings.banner_url && <img src={settings.banner_url} className="w-full h-full object-cover opacity-80" alt="Banner"/>}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black"></div>
          <div className={`absolute inset-0 p-8 flex items-center ${settings.logo_position === 'flex-start' ? 'justify-start' : settings.logo_position === 'flex-end' ? 'justify-end' : 'justify-center'}`}>
              {settings.logo_header_url && <img src={settings.logo_header_url} className="h-24 md:h-32 object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duration-500"/>}
          </div>
      </div>
      <div className="max-w-full mx-auto px-6 -mt-8 relative z-10 space-y-12 pb-20">
          <div className="flex justify-between items-end pb-4 border-b border-gray-800">
            <div><h2 className="text-3xl font-bold text-white mb-1">Olá, {user.name.split(' ')[0]}</h2><p className="text-gray-400">O que vamos criar hoje?</p></div>
            {isAdmin && <span className="text-xs bg-blue-900 text-blue-200 px-3 py-1 rounded border border-blue-700 font-bold tracking-wider">ADMIN</span>}
          </div>

          {/* CARROSSEL DESTAQUES PROMPTS */}
          {featuredPrompts.length > 0 && (
              <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center"><Images className="mr-2 text-blue-500"/> Destaques da Semana</h3>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-700">
                      {featuredPrompts.map(p => (
                          <div key={p.id} className="min-w-[200px] aspect-[3/4] bg-gray-800 rounded-xl overflow-hidden relative group cursor-pointer border border-gray-700 hover:border-blue-500 transition-all hover:shadow-lg hover:shadow-blue-900/20">
                              <img src={p.url} className="w-full h-full object-cover"/>
                              <div className="absolute bottom-0 inset-x-0 bg-black/80 p-3 text-sm text-white truncate font-medium">{p.title || 'Sem título'}</div>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {/* CARROSSEL DESTAQUES TUTORIAIS */}
          {featuredTutorials.length > 0 && (
              <div>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center"><Play className="mr-2 text-purple-500"/> Aulas Recomendadas</h3>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-700">
                      {featuredTutorials.map(t => (
                          <div key={t.id} className="min-w-[280px] aspect-video bg-gray-800 rounded-xl overflow-hidden relative group cursor-pointer border border-gray-700 hover:border-purple-500 transition-all hover:shadow-lg">
                              <img src={t.thumbnail} className="w-full h-full object-cover opacity-80 group-hover:opacity-100"/>
                              <div className="absolute inset-0 flex items-center justify-center"><Play className="text-white fill-white w-10 h-10 drop-shadow-lg"/></div>
                              <div className="absolute bottom-0 inset-x-0 bg-black/80 p-3 text-sm font-bold text-white truncate">{t.title}</div>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {/* ATALHOS RÁPIDOS */}
          <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center"><Zap className="mr-2 text-green-500"/> Ferramentas Rápidas</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button onClick={() => changeTab('generator')} className="bg-gray-900 hover:bg-gray-800 border border-gray-800 p-4 rounded-xl flex flex-col items-center gap-2 transition-all hover:border-green-500"><Zap className="text-green-500"/> <span className="text-white font-bold text-sm">Gerador de Texto</span></button>
                  <button onClick={() => changeTab('generator')} className="bg-gray-900 hover:bg-gray-800 border border-gray-800 p-4 rounded-xl flex flex-col items-center gap-2 transition-all hover:border-blue-500"><Images className="text-blue-500"/> <span className="text-white font-bold text-sm">Criar Imagem</span></button>
                  <button onClick={() => changeTab('prompts')} className="bg-gray-900 hover:bg-gray-800 border border-gray-800 p-4 rounded-xl flex flex-col items-center gap-2 transition-all hover:border-purple-500"><Search className="text-purple-500"/> <span className="text-white font-bold text-sm">Buscar Prompt</span></button>
                  <button onClick={() => changeTab('loja')} className="bg-gray-900 hover:bg-gray-800 border border-gray-800 p-4 rounded-xl flex flex-col items-center gap-2 transition-all hover:border-orange-500"><ShoppingBag className="text-orange-500"/> <span className="text-white font-bold text-sm">Comprar Packs</span></button>
              </div>
          </div>

          {/* FEED NOTÍCIAS */}
          {news.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center"><FileText className="mr-2 text-gray-400"/> Novidades</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {news.map(item => (
                  <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col hover:border-gray-600 transition-all group">
                      {item.image && <div className="h-48 w-full overflow-hidden"><img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/></div>}
                      <div className="p-6"><span className="text-xs text-blue-500 font-bold uppercase tracking-wider mb-2 block">{item.date}</span><h4 className="text-xl font-bold text-white mb-2">{item.title}</h4><p className="text-gray-400 text-sm leading-relaxed">{item.content}</p></div>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

// --- PERFIL ---
function Profile({ user, setUser }) {
  const [activeTab, setActiveTab] = useState('perfil');
  const [formData, setFormData] = useState({ firstName: user.name?.split(' ')[0] || '', lastName: user.name?.split(' ').slice(1).join(' ') || '', phone: user.phone || '', avatar: user.avatar, cover: user.cover, facebook: user.social_facebook || '', twitter: user.social_twitter || '', linkedin: user.social_linkedin || '', website: user.social_website || '', github: user.social_github || '' });
  const { showToast } = React.useContext(ToastContext) || { showToast: alert };

  const handleSave = async () => {
      const updates = { name: `${formData.firstName} ${formData.lastName}`, phone: formData.phone, avatar: formData.avatar, cover: formData.cover, social_facebook: formData.facebook, social_twitter: formData.twitter, social_linkedin: formData.linkedin, social_website: formData.website, social_github: formData.github };
      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
      if(!error) { setUser({ ...user, ...updates }); showToast("Perfil atualizado!"); } else { alert("Erro ao salvar."); }
  };

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn p-8">
      <h2 className="text-3xl font-bold text-white mb-8">Configurações</h2>
      <div className="flex space-x-8 border-b border-gray-800 mb-8 overflow-x-auto">
         {['perfil', 'senha', 'social'].map(tab => (<button key={tab} onClick={() => setActiveTab(tab)} className={`pb-4 text-sm font-medium capitalize relative whitespace-nowrap ${activeTab === tab ? 'text-blue-600' : 'text-gray-500 hover:text-white'}`}>{tab === 'social' ? 'Perfil Social' : tab}{activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}</button>))}
      </div>
      {activeTab === 'perfil' && (
         <div className="mb-10">
            <div className="h-48 w-full rounded-t-xl bg-gray-800 relative overflow-hidden group"><img src={formData.cover} className="w-full h-full object-cover opacity-80"/><div className="absolute bottom-4 right-4"><ImageUploader compact label="Capa" onUploadComplete={(url) => setFormData({...formData, cover: url})} /></div></div>
            <div className="px-8 relative"><div className="w-32 h-32 rounded-full border-4 border-black bg-gray-700 -mt-16 overflow-hidden relative group"><img src={formData.avatar} className="w-full h-full object-cover"/><div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center"><ImageUploader compact label="Avatar" onUploadComplete={(url) => setFormData({...formData, avatar: url})} /></div></div></div>
         </div>
      )}
      {activeTab === 'perfil' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div><label className="text-white text-sm font-bold mb-2 block">Nome</label><input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-white focus:border-blue-600 outline-none"/></div>
             <div><label className="text-white text-sm font-bold mb-2 block">Último nome</label><input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-white focus:border-blue-600 outline-none"/></div>
             <div className="col-span-2"><label className="text-white text-sm font-bold mb-2 block">Telefone</label><input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-white focus:border-blue-600 outline-none" placeholder="(00) 00000-0000"/></div>
             <div className="col-span-2 mt-4"><button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-colors">Atualizar Perfil</button></div>
          </div>
      )}
      {activeTab === 'senha' && <div className="max-w-2xl space-y-6"><div><label className="text-white text-sm font-bold mb-2 block">Nova Senha</label><input type="password" className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-white focus:border-blue-600 outline-none" placeholder="Digite a senha"/></div><button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg mt-4">Redefinir senha</button></div>}
      {activeTab === 'social' && <div className="space-y-6">{[{k:'facebook',l:'Facebook',i:Facebook},{k:'twitter',l:'Twitter',i:Twitter},{k:'linkedin',l:'Linkedin',i:Linkedin}].map(s=><div key={s.k} className="flex items-center"><div className="w-32 flex items-center text-white"><s.i size={18} className="mr-2"/> {s.l}</div><input type="text" value={formData[s.k]} onChange={e=>setFormData({...formData,[s.k]:e.target.value})} className="flex-1 bg-gray-900 border border-gray-800 rounded-lg p-3 text-gray-400 focus:text-white focus:border-blue-600 outline-none"/></div>)}<button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg mt-4">Atualizar Perfil</button></div>}
    </div>
  );
}

// --- ADMIN PANEL (NETFLIX STYLE) ---
function AdminPanel({ user, updateSettings, settings }) {
  const [activeSection, setActiveSection] = useState('prompts');
  const [dataList, setDataList] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedPack, setSelectedPack] = useState(null); 
  const [packPrompts, setPackPrompts] = useState([]); 
  const { showToast } = React.useContext(ToastContext) || { showToast: alert };

  const fetchData = async () => {
    let query;
    if (activeSection === 'users') query = supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (activeSection === 'prompts') query = supabase.from('products').select('*').order('id', { ascending: true });
    if (activeSection === 'tutorials') query = supabase.from('tutorials_videos').select('*').order('id', { ascending: true });
    if (activeSection === 'news') query = supabase.from('news').select('*').order('id', { ascending: false });
    if (query) { const { data } = await query; setDataList(data || []); }
  };

  const fetchPackPrompts = async (packId) => {
      const { data } = await supabase.from('pack_items').select('*').eq('pack_id', packId).order('created_at', { ascending: false });
      setPackPrompts(data || []);
  };

  useEffect(() => { fetchData(); setSelectedPack(null); }, [activeSection]);

  const handleSave = async (e) => {
      e.preventDefault();
      if (activeSection === 'settings') { await supabase.from('app_settings').update(editingItem).gt('id', 0); updateSettings(editingItem); showToast('Configurações salvas!'); return; }
      if (selectedPack && activeSection === 'prompts') { const { error } = await supabase.from('pack_items').upsert({ ...editingItem, pack_id: selectedPack.id }).eq('id', editingItem.id || 0); if (!error) { showToast('Prompt salvo!'); setEditingItem(null); fetchPackPrompts(selectedPack.id); } return; }
      
      let table = activeSection === 'users' ? 'profiles' : activeSection === 'prompts' ? 'products' : activeSection === 'tutorials' ? 'tutorials_videos' : activeSection;
      let payload = activeSection === 'users' ? { plan: editingItem.plan } : editingItem;
      const { error } = await supabase.from(table).upsert(payload).eq('id', editingItem.id || 0);
      if(!error) { showToast('Salvo!'); setEditingItem(null); fetchData(); }
  };

  const handleDelete = async (id, isPrompt = false) => {
      if(!confirm('Tem certeza?')) return;
      let table = isPrompt ? 'pack_items' : activeSection === 'prompts' ? 'products' : activeSection === 'tutorials' ? 'tutorials_videos' : activeSection;
      await supabase.from(table).delete().eq('id', id);
      if(isPrompt && selectedPack) fetchPackPrompts(selectedPack.id); else fetchData();
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-fadeIn px-6">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-gray-800 pb-4 gap-4">
          <div><h2 className="text-3xl font-bold text-white"><Shield className="inline text-blue-600 mr-2"/> Painel Admin</h2><p className="text-gray-400">Gerencie seu conteúdo estilo estúdio.</p></div>
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">{['prompts', 'tutorials', 'users', 'news', 'settings'].map(id => (<button key={id} onClick={() => { setActiveSection(id); setEditingItem(id === 'settings' ? settings : null); setSelectedPack(null); }} className={`px-4 py-2 rounded-lg font-bold capitalize whitespace-nowrap ${activeSection === id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>{id}</button>))}</div>
      </div>

      {activeSection === 'settings' && editingItem && (
          <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 grid grid-cols-1 gap-6">
              <h3 className="text-white font-bold text-xl">Configurações Visuais</h3>
              <div><ImageUploader label="Logo Menu" currentImage={editingItem.logo_menu_url} onUploadComplete={url=>setEditingItem({...editingItem,logo_menu_url:url})}/></div>
              <div><ImageUploader label="Banner" currentImage={editingItem.banner_url} onUploadComplete={url=>setEditingItem({...editingItem,banner_url:url})}/></div>
              <div><ImageUploader label="Logo Header" currentImage={editingItem.logo_header_url} onUploadComplete={url=>setEditingItem({...editingItem,logo_header_url:url})}/></div>
              <div><label className="text-gray-400 block mb-2">Posição</label><div className="flex gap-4">{['flex-start','center','flex-end'].map(pos=><button key={pos} onClick={()=>setEditingItem({...editingItem,logo_position:pos})} className={`px-4 py-2 rounded border ${editingItem.logo_position===pos?'bg-blue-600 border-blue-600 text-white':'bg-black border-gray-700 text-gray-400'}`}>{pos}</button>)}</div></div>
              <button onClick={handleSave} className="bg-green-600 text-white px-8 py-3 rounded font-bold w-full">Salvar</button>
          </div>
      )}

      {activeSection === 'prompts' && (
          selectedPack ? (
              <div className="animate-fadeIn">
                  <button onClick={() => setSelectedPack(null)} className="mb-6 text-gray-400 hover:text-white flex items-center font-bold"><ChevronLeft className="mr-2"/> Voltar para Packs</button>
                  <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                      <div className="relative h-48 bg-gray-800"><img src={selectedPack.cover} className="w-full h-full object-cover opacity-40"/><div className="absolute bottom-6 left-8 right-8 flex justify-between items-end"><div><span className="text-blue-500 font-bold text-xs uppercase">SÉRIE</span><h2 className="text-4xl font-bold text-white">{selectedPack.title}</h2></div><button onClick={() => setEditingItem({ title: '', prompt: '', url: '', is_featured: false })} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center"><Plus size={20} className="mr-2"/> Adicionar Episódio</button></div></div>
                      <div className="p-8 grid grid-cols-1 md:grid-cols-4 gap-6">
                          {packPrompts.map(prompt => (
                              <div key={prompt.id} className="bg-black border border-gray-800 rounded-xl overflow-hidden group relative">
                                  <div className="aspect-square relative"><img src={prompt.url} className="w-full h-full object-cover"/><div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity"><button onClick={()=>setEditingItem(prompt)} className="bg-blue-600 p-2 rounded-full text-white"><Edit3 size={18}/></button><button onClick={()=>handleDelete(prompt.id, true)} className="bg-red-600 p-2 rounded-full text-white"><Trash2 size={18}/></button></div></div>
                                  <div className="p-4"><h4 className="text-white font-bold truncate">{prompt.title}</h4>{prompt.is_featured && <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded mt-1 inline-block">DESTAQUE</span>}</div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          ) : (
              <div className="animate-fadeIn">
                 <div className="flex justify-between items-center mb-6"><h3 className="text-xl text-white font-bold">Suas Séries (Packs)</h3><button onClick={() => setEditingItem({})} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center"><Plus size={20} className="mr-2"/> Nova Série</button></div>
                 <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                     {dataList.map(pack => (
                         <div key={pack.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition-all group relative cursor-pointer" onClick={() => { setSelectedPack(pack); fetchPackPrompts(pack.id); }}>
                             <div className="aspect-[2/3] relative"><img src={pack.cover} className="w-full h-full object-cover"/><div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]"><span className="bg-white text-black px-4 py-2 rounded-full font-bold text-xs">Gerenciar</span></div></div>
                             <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100"><button onClick={(e)=>{e.stopPropagation();setEditingItem(pack)}} className="bg-black/80 text-blue-400 p-2 rounded"><Edit3 size={16}/></button><button onClick={(e)=>{e.stopPropagation();handleDelete(pack.id)}} className="bg-black/80 text-red-500 p-2 rounded"><Trash2 size={16}/></button></div>
                         </div>
                     ))}
                 </div>
              </div>
          )
      )}

      {activeSection !== 'settings' && activeSection !== 'prompts' && (
          <div className="animate-fadeIn">
            {activeSection !== 'users' && <div className="mb-6 flex justify-end"><button onClick={() => setEditingItem({})} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center"><Plus size={20} className="mr-2"/> Novo</button></div>}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-xl">
                <table className="w-full text-left text-sm text-gray-400"><thead className="bg-black text-xs uppercase font-bold"><tr><th className="p-6">Item</th><th className="p-6">Detalhes</th><th className="p-6 text-right">Ações</th></tr></thead>
                    <tbody className="divide-y divide-gray-800">{dataList.map(item => (<tr key={item.id} className="hover:bg-gray-800/50"><td className="p-6">{activeSection === 'users' ? item.name : item.title}</td><td className="p-6">{activeSection === 'users' ? item.plan : (item.is_featured ? '⭐ Destaque' : '-')}</td><td className="p-6 text-right"><button onClick={() => setEditingItem(item)} className="text-blue-500 mr-2"><Edit3 size={18}/></button><button onClick={() => handleDelete(item.id)} className="text-red-500"><Trash2 size={18}/></button></td></tr>))}</tbody>
                </table>
            </div>
          </div>
      )}

      {editingItem && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-gray-900 w-full max-w-2xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
                  <div className="p-6 border-b border-gray-800 flex justify-between items-center"><h3 className="text-xl font-bold text-white">Editor</h3><button onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-white"><X/></button></div>
                  <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                      <form onSubmit={handleSave} className="space-y-6">
                          {activeSection === 'users' && <div><label className="block text-gray-400 text-sm font-bold mb-2">Plano</label><select className="w-full bg-black border border-gray-700 p-4 rounded-xl text-white" value={editingItem.plan || 'free'} onChange={e => setEditingItem({...editingItem, plan: e.target.value})}><option value="free">Free</option><option value="pro">Pro</option><option value="gold">Gold</option><option value="admin">Admin</option></select></div>}
                          {/* CHECKBOX DESTAQUE */}
                          {(activeSection === 'prompts' && selectedPack || activeSection === 'tutorials') && (
                              <label className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-gray-700 cursor-pointer"><input type="checkbox" checked={editingItem.is_featured || false} onChange={e => setEditingItem({...editingItem, is_featured: e.target.checked})} className="w-5 h-5 accent-blue-600"/><span className="text-white font-bold">Destacar no Dashboard</span></label>
                          )}
                          {/* CAMPOS DINÂMICOS */}
                          {Object.keys(editingItem).map(key => {
                              if(['id','created_at','pack_id','is_featured'].includes(key)) return null;
                              if(['cover','url','thumbnail','image'].includes(key)) return <ImageUploader key={key} label={key.toUpperCase()} currentImage={editingItem[key]} onUploadComplete={(url) => setEditingItem({...editingItem, [key]: url})} />;
                              if(key === 'prompt' || key === 'content' || key === 'description') return <div key={key}><label className="block text-gray-400 text-sm font-bold mb-2 uppercase">{key}</label><textarea className="w-full bg-black border border-gray-700 p-4 rounded-xl text-white h-32" value={editingItem[key] || ''} onChange={e => setEditingItem({...editingItem, [key]: e.target.value})}/></div>
                              return <div key={key}><label className="block text-gray-400 text-sm font-bold mb-2 uppercase">{key}</label><input type="text" className="w-full bg-black border border-gray-700 p-4 rounded-xl text-white" value={editingItem[key] || ''} onChange={e => setEditingItem({...editingItem, [key]: e.target.value})}/></div>
                          })}
                          <div className="flex justify-end gap-4 pt-4"><button type="button" onClick={() => setEditingItem(null)} className="px-6 py-3 rounded-xl font-bold text-gray-400">Cancelar</button><button type="submit" className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg">Salvar</button></div>
                      </form>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}

// --- TUTORIAIS ---
function TutorialsPage() {
    const [tutorials, setTutorials] = useState([]);
    useEffect(() => { supabase.from('tutorials_videos').select('*').order('id', { ascending: true }).then(({ data }) => setTutorials(data || [])); }, []);
    return (
        <div className="max-w-3xl mx-auto pb-20 animate-fadeIn px-6">
             <div className="text-center mb-12 mt-8"><h2 className="text-5xl font-black text-white mb-2 tracking-tighter">TUTORIAIS</h2><p className="text-blue-600 font-bold tracking-[0.2em] text-sm uppercase mb-8">Ferramentas de Criação</p></div>
             <div className="space-y-12">{tutorials.map(video => (<div key={video.id} className="bg-black border border-gray-800 rounded-2xl overflow-hidden shadow-2xl hover:border-blue-900 transition-all"><div className="p-4 flex items-center border-b border-gray-900"><div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div><h3 className="text-white font-bold text-lg">{video.title}</h3></div><div className="relative aspect-video group cursor-pointer overflow-hidden"><img src={video.thumbnail} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105"/><div className="absolute inset-0 flex items-center justify-center"><div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform"><Play className="ml-1 text-white fill-white w-8 h-8"/></div></div><a href={video.video_url} target="_blank" className="absolute inset-0 z-10"></a></div><div className="p-6 text-center bg-gray-900"><a href={video.link_action || '#'} target="_blank" className="text-blue-500 hover:text-white font-bold text-sm uppercase tracking-wider border-b-2 border-blue-500/30 pb-1 hover:border-white transition-colors">{video.link_label || 'Acessar Recurso'}</a></div></div>))}</div>
        </div>
    );
}

// --- LOJA (COM LINK EXTERNO) ---
function StorePage({ packs, onPurchase }) {
    return (
        <div className="max-w-7xl mx-auto animate-fadeIn px-6"><h2 className="text-3xl font-bold text-white mb-8">Loja Oficial</h2><div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">{packs.map(pack => (<div key={pack.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-blue-600 transition-all cursor-pointer group shadow-lg"><div className="aspect-square relative overflow-hidden"><img src={pack.cover} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/><div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 to-transparent"><h4 className="text-white font-bold text-sm md:text-base leading-tight">{pack.title}</h4><p className="text-blue-500 font-bold text-xs mt-1">{pack.price}</p></div></div><button onClick={() => onPurchase(pack.id, pack.checkout_url)} className="w-full bg-blue-600 text-white font-bold py-2 text-sm hover:bg-blue-500 transition-colors">COMPRAR</button></div>))}</div></div>
    );
}

// --- PROMPTS (ESTRUTURA DE PRATELEIRAS) ---
function PromptsGallery() {
    const [packs, setPacks] = useState([]);
    const [allItems, setAllItems] = useState([]);
    const [modalItem, setModalItem] = useState(null);
    const { showToast } = React.useContext(ToastContext) || { showToast: alert };

    // Busca Packs e seus Itens
    useEffect(() => { 
        supabase.from('products').select('*').then(({data}) => setPacks(data || []));
        supabase.from('pack_items').select('*').then(({data}) => setAllItems(data || [])); 
    }, []);

    return (
        <div className="max-w-7xl mx-auto animate-fadeIn px-6 pb-20">
             {/* 1. CARROSSÉIS DOS PACKS (PRATELEIRAS) */}
             {packs.map(pack => {
                 const items = allItems.filter(i => i.pack_id === pack.id);
                 if (items.length === 0) return null;
                 return (
                     <div key={pack.id} className="mb-12">
                         <div className="flex items-center justify-between mb-4 border-l-4 border-blue-600 pl-4">
                             <h2 className="text-2xl font-bold text-white">{pack.title}</h2>
                             <button className="text-gray-400 hover:text-white text-sm flex items-center">Ver Pack <ChevronRight size={16}/></button>
                         </div>
                         <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-gray-800">
                             {items.map(item => (
                                 <div key={item.id} onClick={() => setModalItem(item)} className="min-w-[220px] aspect-[3/4] bg-gray-900 rounded-xl overflow-hidden relative group cursor-pointer hover:scale-105 transition-transform border border-gray-800 hover:border-blue-500">
                                     <img src={item.url} className="w-full h-full object-cover"/>
                                     <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-3">
                                         <p className="text-white font-bold text-sm truncate">{item.title}</p>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     </div>
                 )
             })}

             {/* 2. PROMPTS FREE (AVULSOS - SEM PACK) */}
             <div className="mt-16">
                 <h2 className="text-3xl font-bold text-white mb-8 flex items-center"><Sparkles className="mr-2 text-yellow-500"/> Prompts Gratuitos</h2>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     {allItems.filter(i => !i.pack_id).map(item => (
                         <div key={item.id} onClick={() => setModalItem(item)} className="aspect-[3/4] bg-gray-900 rounded-2xl overflow-hidden relative group hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:border-2 border-blue-500 transition-all duration-300 border border-gray-800 cursor-pointer">
                             <img src={item.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>
                             <div className="absolute bottom-8 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0"><button className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-2xl hover:scale-105 hover:bg-blue-500 transition-transform flex items-center border border-blue-400"><Copy size={18} className="mr-2"/> DETALHES</button></div>
                         </div>
                     ))}
                 </div>
             </div>

             {/* MODAL DE DETALHES */}
             {modalItem && (
                 <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn" onClick={() => setModalItem(null)}>
                     <div className="bg-gray-900 w-full max-w-4xl rounded-2xl border border-blue-500/50 shadow-2xl overflow-hidden flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>
                         <div className="md:w-1/2 bg-black flex items-center justify-center"><img src={modalItem.url} className="w-full h-full object-contain max-h-[50vh] md:max-h-[80vh]"/></div>
                         <div className="md:w-1/2 p-8 flex flex-col">
                             <div className="flex justify-between items-start mb-6"><h3 className="text-2xl font-bold text-white">{modalItem.title || 'Prompt'}</h3><button onClick={() => setModalItem(null)} className="text-gray-400 hover:text-white"><X size={28}/></button></div>
                             <div className="bg-black border border-gray-800 p-6 rounded-xl flex-1 overflow-y-auto custom-scrollbar mb-6"><p className="text-gray-300 font-mono text-sm leading-relaxed">{modalItem.prompt}</p></div>
                             <button onClick={() => {navigator.clipboard.writeText(modalItem.prompt); showToast("Copiado!");}} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-blue-600/40 transition-all flex items-center justify-center mb-3"><Copy className="mr-2"/> COPIAR PROMPT</button>
                             <button className="w-full border border-gray-700 text-gray-400 font-bold py-3 rounded-xl hover:bg-gray-800 hover:text-white transition-all flex items-center justify-center"><Heart className="mr-2"/> ADICIONAR AOS FAVORITOS</button>
                         </div>
                     </div>
                 </div>
             )}
        </div>
    );
}

function GeneratorsHub() { return <div className="text-white text-center py-20 text-xl font-bold animate-pulse">⚡ Geradores em Manutenção</div>; }
function Favorites() { return <div className="text-white text-center py-20 text-gray-500">Você ainda não favoritou nada.</div>; }