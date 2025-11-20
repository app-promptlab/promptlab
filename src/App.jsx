import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  LayoutDashboard, 
  Images, 
  Star, 
  Zap, 
  BookOpen, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Heart, 
  Copy, 
  Check,
  ExternalLink,
  Camera,
  Edit3,
  Lock,
  Unlock,
  ShoppingCart,
  Sparkles,
  Play,
  Mail,
  ArrowRight,
  Loader2,
  Database,
  Trash2,
  Bold,
  Italic,
  Underline,
  Link as LinkIcon,
  List,
  AlignLeft,
  Facebook,
  Instagram,
  Music, 
  Key,
  ChevronLeft,  
  ChevronRight,
  Crown
} from 'lucide-react';

// --- CONEXÃO REAL COM SUPABASE ---
// As chaves são carregadas do ficheiro .env na raiz do projeto
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- DADOS DE FALLBACK (Caso o banco de dados esteja vazio) ---
const NEWS_DATA = [
  { id: 1, title: "PromptLab V2 no Ar", date: "Hoje", content: "Novo motor de gems atualizado." },
  { id: 2, title: "Dica da Semana", date: "Ontem", content: "Use '--stylize 250' para resultados artísticos." },
];

const FREE_PROMPTS = [
  { id: 901, url: "https://images.unsplash.com/photo-1635322966219-b75ed372eb01?auto=format&fit=crop&w=600&q=80", prompt: "Minimalist 3D render of blue sphere..." },
  { id: 902, url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=600&q=80", prompt: "Vaporwave aesthetic landscape..." },
  { id: 903, url: "https://images.unsplash.com/photo-1614726365723-498aa67c5f7b?auto=format&fit=crop&w=600&q=80", prompt: "Abstract fluid art background..." },
  { id: 904, url: "https://images.unsplash.com/photo-1618172193763-c511deb635ca?auto=format&fit=crop&w=600&q=80", prompt: "Neon lights in rainy street..." },
];

const TUTORIALS_DATA = [
  { id: 1, title: "Começando do Zero", thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=400&q=80" },
  { id: 2, title: "Avançado: ControlNet", thumbnail: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=400&q=80" },
];

// --- COMPONENTE PRINCIPAL ---

export default function App() {
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica sessão ativa ao carregar
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

  const fetchProfileData = async (userId, email) => {
    try {
        // 1. Busca Perfil
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (profileError && profileError.code !== 'PGRST116') console.error(profileError);

        // 2. Busca Compras
        const { data: purchases, error: purchaseError } = await supabase
            .from('user_purchases')
            .select('product_id')
            .eq('user_id', userId);

        if (purchaseError) console.error(purchaseError);

        const accessList = purchases ? purchases.map(p => p.product_id) : [];

        setUser({
            ...profile,
            email: email,
            name: profile?.name || 'Usuário',
            access: accessList, 
            plan: profile?.plan || 'free',
            avatar: profile?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
            cover: profile?.cover || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80'
        });
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
        // Fallback de segurança
        setUser({
           id: userId,
           email: email,
           name: 'Usuário',
           access: [],
           plan: 'free',
           avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
        });
    } finally {
        setLoading(false);
    }
  };

  const handleLogin = async (email, password, name, isRegister) => {
    setLoading(true);
    try {
        let authResponse;
        
        if (isRegister) {
            authResponse = await supabase.auth.signUp({
                email,
                password,
                options: { data: { name } }
            });
        } else {
            authResponse = await supabase.auth.signInWithPassword({
                email,
                password
            });
        }

        if (authResponse.error) throw authResponse.error;

        if (authResponse.data.user) {
            // Delay para o trigger do banco criar o perfil
            setTimeout(() => fetchProfileData(authResponse.data.user.id, email), 1500);
        } else if (isRegister) {
            alert("Verifique seu email para confirmar o cadastro!");
            setLoading(false);
        }
    } catch (error) {
        alert("Erro: " + error.message);
        setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handlePurchase = async (productId) => {
    if (window.confirm(`Confirmar compra deste item?`)) {
      try {
          const { error } = await supabase
            .from('user_purchases')
            .insert({ 
                user_id: user.id, 
                product_id: productId 
            });
          
          if (error) throw error;

          setUser(prev => ({
            ...prev,
            access: [...prev.access, productId]
          }));
          alert("Compra realizada com sucesso!");
      } catch (error) {
          console.error("Erro na compra:", error);
          alert("Erro ao processar compra.");
      }
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center text-blue-500">
        <Loader2 size={48} className="animate-spin mb-4" />
        <p className="text-gray-500 text-sm animate-pulse">Iniciando aplicação...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return <MainApp user={user} setUser={setUser} onLogout={handleLogout} onPurchase={handlePurchase} />;
}

// --- TELA DE LOGIN ---

function AuthScreen({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    onLogin(email, password, name, isRegister);
  };

  return (
    <div className="min-h-screen bg-black text-white flex relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[150px] animate-pulse"></div>
      
      <div className="hidden lg:flex w-1/2 flex-col justify-center p-16 relative z-10">
        <div className="mb-8">
          <div className="text-5xl font-bold tracking-tighter flex items-center mb-4">
            Prompt<span className="text-blue-500">Lab</span>
            <Sparkles size={32} className="text-blue-400 ml-2" />
          </div>
          <p className="text-xl text-gray-400 max-w-md leading-relaxed">
            Sua central definitiva de engenharia de prompts.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md bg-gray-900/60 backdrop-blur-xl p-8 rounded-2xl border border-gray-800 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">
            {isRegister ? "Criar Conta" : "Acessar Plataforma"}
          </h2>
          <p className="text-gray-400 text-center mb-6 text-sm">
            {isRegister ? "Preencha seus dados abaixo" : "Faça login para continuar"}
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="relative">
                  <User className="absolute left-3 top-3.5 text-gray-500" size={18} />
                  <input 
                    type="text" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Seu nome"
                  />
              </div>
            )}

            <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-gray-500" size={18} />
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="seu@email.com"
                />
            </div>

            <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-gray-500" size={18} />
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center mt-6 shadow-lg"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : (isRegister ? "Cadastrar" : "Entrar")}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-gray-800 pt-6">
             <button 
               onClick={() => setIsRegister(!isRegister)} 
               className="text-blue-400 hover:text-blue-300 text-sm font-medium"
             >
               {isRegister ? "Já tenho conta? Fazer Login" : "Não tem conta? Criar nova conta"}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- APP LOGADO ---

function MainApp({ user, setUser, onLogout, onPurchase }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false); 
  const [favorites, setFavorites] = useState([901]); 

  const [packs, setPacks] = useState([]);
  const [news, setNews] = useState(NEWS_DATA);
  const [tutorials, setTutorials] = useState(TUTORIALS_DATA);

  // Busca dados dinâmicos
  useEffect(() => {
    const fetchData = async () => {
      const { data: packsRes } = await supabase.from('products').select();
      const { data: newsRes } = await supabase.from('news').select();
      const { data: tutsRes } = await supabase.from('tutorials').select();
      
      if (packsRes) setPacks(packsRes);
      if (newsRes && newsRes.length > 0) setNews(newsRes);
      if (tutsRes && tutsRes.length > 0) setTutorials(tutsRes);
    };
    fetchData();
  }, []);

  const toggleFavorite = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard news={news} changeTab={setActiveTab} user={user} />;
      case 'prompts': return <PromptsArea packs={packs} freePrompts={FREE_PROMPTS} favorites={favorites} toggleFavorite={toggleFavorite} user={user} onPurchase={onPurchase} />;
      case 'favorites': return <Favorites packs={packs} freePrompts={FREE_PROMPTS} favorites={favorites} toggleFavorite={toggleFavorite} />;
      case 'generator': return <GeneratorsHub user={user} onPurchase={onPurchase} />;
      case 'tutorial': return <Tutorials videos={tutorials} />;
      case 'profile': return <Profile user={user} setUser={setUser} />;
      default: return <Dashboard news={news} changeTab={setActiveTab} user={user} />;
    }
  };

  return (
    <div className="flex h-screen bg-black text-gray-100 font-sans overflow-hidden selection:bg-blue-500 selection:text-white animate-fadeIn">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px]"></div>
      </div>

      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 
        ${sidebarMinimized ? 'lg:w-20' : 'lg:w-72'} 
        w-72 bg-black/95 border-r border-gray-800 backdrop-blur-xl
        transform transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className={`flex items-center ${sidebarMinimized ? 'justify-center' : 'justify-between'} p-8 border-b border-gray-800/50 transition-all`}>
           {!sidebarMinimized ? (
             <div className="text-white font-bold text-2xl tracking-tighter flex items-center animate-fadeIn">
                Prompt<span className="text-blue-500">Lab</span>
                <Sparkles size={16} className="text-blue-400 ml-1" />
              </div>
           ) : (
              <Sparkles size={24} className="text-blue-400 animate-fadeIn" />
           )}
           
           <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
             <X size={24} />
           </button>

           <button 
             onClick={() => setSidebarMinimized(!sidebarMinimized)} 
             className={`hidden lg:block text-gray-500 hover:text-white transition-colors ${sidebarMinimized ? 'absolute top-8 right-[-12px] bg-gray-800 rounded-full p-1 border border-gray-700' : ''}`}
           >
             {sidebarMinimized ? <ChevronRight size={14} /> : <ChevronLeft size={20} />}
           </button>
        </div>

        <nav className="mt-8 px-4 space-y-2">
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }} 
            minimized={sidebarMinimized}
          />
          <SidebarItem 
            icon={Images} 
            label="Prompts" 
            active={activeTab === 'prompts'} 
            onClick={() => { setActiveTab('prompts'); setSidebarOpen(false); }} 
            minimized={sidebarMinimized}
          />
          <SidebarItem 
            icon={Star} 
            label="Favoritos" 
            active={activeTab === 'favorites'} 
            onClick={() => { setActiveTab('favorites'); setSidebarOpen(false); }} 
            minimized={sidebarMinimized}
          />
          <SidebarItem 
            icon={Zap} 
            label="Geradores" 
            active={activeTab === 'generator'} 
            onClick={() => { setActiveTab('generator'); setSidebarOpen(false); }} 
            minimized={sidebarMinimized}
          />
          <SidebarItem 
            icon={BookOpen} 
            label="Tutoriais" 
            active={activeTab === 'tutorial'} 
            onClick={() => { setActiveTab('tutorial'); setSidebarOpen(false); }} 
            minimized={sidebarMinimized}
          />
          
          <div className="my-4 border-t border-gray-800/50 mx-2"></div>
          
          <SidebarItem 
            icon={User} 
            label="Meu Perfil" 
            active={activeTab === 'profile'} 
            onClick={() => { setActiveTab('profile'); setSidebarOpen(false); }} 
            minimized={sidebarMinimized}
          />
          
          <div className="pt-8">
            <button 
              onClick={onLogout}
              className={`flex items-center w-full px-4 py-3 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors group ${sidebarMinimized ? 'justify-center' : ''}`}
              title={sidebarMinimized ? "Sair" : ""}
            >
              <LogOut size={20} className={`${sidebarMinimized ? '' : 'mr-3'} group-hover:rotate-12 transition-transform`} />
              {!sidebarMinimized && <span>Sair da Conta</span>}
            </button>
          </div>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <header className="lg:hidden flex items-center justify-center p-4 border-b border-gray-800 bg-black/80 backdrop-blur-md">
          <div className="text-xl font-bold text-white">Prompt<span className="text-blue-500">Lab</span></div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
          {renderContent()}
        </main>

        <button 
          onClick={() => setSidebarOpen(true)} 
          className="fixed bottom-6 left-6 z-50 lg:hidden bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-500 flex items-center justify-center"
        >
          <Menu size={24} />
        </button>
      </div>
    </div>
  );
}

function SidebarItem({ icon: Icon, label, active, onClick, minimized }) {
  return (
    <button
      onClick={onClick}
      title={minimized ? label : ""}
      className={`flex items-center w-full px-4 py-3.5 rounded-xl transition-all duration-300 border border-transparent ${
        active 
          ? 'bg-blue-600/10 text-blue-400 border-blue-500/20 shadow-[0_0_20px_rgba(37,99,235,0.15)]' 
          : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200 hover:border-gray-800'
      } ${minimized ? 'justify-center' : ''}`}
    >
      <Icon size={20} className={`${minimized ? '' : 'mr-3'} ${active ? 'drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]' : ''}`} />
      {!minimized && <span className="font-medium tracking-wide animate-fadeIn">{label}</span>}
    </button>
  );
}

function Dashboard({ news, changeTab, user }) {
  const isGold = user.plan === 'gold';
  const isFree = !isGold && (!user.access || user.access.length === 0);

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      <div className="flex justify-between items-end border-b border-gray-800 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Olá, {user.name.split(' ')[0]}</h2>
          <p className="text-gray-400">Seu laboratório criativo está pronto.</p>
        </div>
        <div className="text-right hidden md:block">
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Status da Conta</div>
          
          {isGold ? (
             <div className="text-yellow-400 font-bold flex items-center gap-2 justify-end drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]">
                <Crown size={18} className="fill-yellow-400" /> MEMBRO GOLD
             </div>
          ) : (
            <div className={`${isFree ? 'text-red-500' : 'text-blue-400'} font-bold flex items-center gap-2 justify-end`}>
                {!isFree ? (
                    <><Sparkles size={16} /> MEMBRO PRO</>
                ) : (
                    <><User size={16} /> MEMBRO FREE</>
                )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div onClick={() => changeTab('prompts')} className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 hover:border-blue-500/50 transition-all cursor-pointer group hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] relative overflow-hidden">
          <div className="bg-blue-500/20 w-12 h-12 rounded-xl flex items-center justify-center text-blue-400 mb-4">
            <Images size={24} />
          </div>
          <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold">Prompts</p>
          <p className="text-3xl font-bold text-white mt-1">Acessar</p>
        </div>

        <div onClick={() => changeTab('favorites')} className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 hover:border-pink-500/50 transition-all cursor-pointer group hover:shadow-[0_0_30px_rgba(236,72,153,0.1)] relative overflow-hidden">
          <div className="bg-pink-500/20 w-12 h-12 rounded-xl flex items-center justify-center text-pink-400 mb-4">
            <Star size={24} />
          </div>
          <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold">Favoritos</p>
          <p className="text-3xl font-bold text-white mt-1">8 Salvos</p>
        </div>

        <div onClick={() => changeTab('generator')} className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 hover:border-yellow-500/50 transition-all cursor-pointer group hover:shadow-[0_0_30px_rgba(234,179,8,0.1)] relative overflow-hidden">
          <div className="bg-yellow-500/20 w-12 h-12 rounded-xl flex items-center justify-center text-yellow-400 mb-4">
            <Zap size={24} />
          </div>
          <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold">Geradores</p>
          <p className="text-3xl font-bold text-white mt-1">Criar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center"><Play size={20} className="mr-2 text-blue-500"/> Feed PromptLab</h3>
            {news.map(item => (
              <div key={item.id} className="bg-gray-900/30 border border-gray-800 p-6 rounded-xl flex items-start gap-4 hover:bg-gray-900/50 transition-colors">
                 <div className="mt-1 min-w-[8px] h-[8px] rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                 <div>
                    <h4 className="text-lg font-bold text-white">{item.title}</h4>
                    <span className="text-xs text-blue-400 mb-2 block">{item.date}</span>
                    <p className="text-gray-400 leading-relaxed">{item.content}</p>
                 </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function PromptsArea({ packs, freePrompts, favorites, toggleFavorite, user, onPurchase }) {
  const [selectedPack, setSelectedPack] = useState(null);
  const [packItems, setPackItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [copied, setCopied] = useState(false);
  
  const userAccess = user.access;
  const isGold = user.plan === 'gold'; 

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openPack = async (pack) => {
    if (isGold || userAccess.includes(pack.id)) {
      setSelectedPack(pack);
      setLoadingItems(true);
      const res = await supabase.from('pack_items').select('*').eq('pack_id', pack.id);
      setPackItems(data || []); 
      setLoadingItems(false);
    }
  };

  const handlePurchaseClick = (e, packId) => {
    e.stopPropagation();
    onPurchase(packId);
  };

  if (selectedPack) {
    return (
      <div className="animate-fadeIn max-w-7xl mx-auto">
        <button 
          onClick={() => setSelectedPack(null)}
          className="mb-8 flex items-center text-gray-400 hover:text-white transition-colors group"
        >
          <div className="bg-gray-800 p-2 rounded-lg mr-3 group-hover:bg-gray-700 transition-colors">
            <Images size={20} />
          </div>
          Voltar para Biblioteca
        </button>

        <div className="flex justify-between items-end mb-8 pb-4 border-b border-gray-800">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{selectedPack.title}</h2>
            {isGold ? (
                <p className="text-yellow-400 flex items-center font-bold drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]">
                    <Crown size={14} className="mr-2 fill-yellow-400"/> Acesso Gold
                </p>
            ) : (
                <p className="text-blue-400 flex items-center"><Unlock size={14} className="mr-2"/> Produto Adquirido</p>
            )}
          </div>
        </div>

        {loadingItems ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[1,2,3,4].map(i => <div key={i} className="aspect-[3/4] bg-gray-900/50 animate-pulse rounded-xl"></div>)}
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {packItems.map(item => (
                <div 
                key={item.id} 
                onClick={() => setModalImage(item)}
                className="aspect-[3/4] bg-gray-900 rounded-xl overflow-hidden cursor-pointer border border-gray-800 hover:border-blue-500 transition-all relative group hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                >
                <img 
                  src={item.url} 
                  alt="Prompt" 
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:blur-sm" 
                />
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <div className="bg-blue-600/90 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-xl">
                      <Copy size={18} className="text-white mr-2" />
                      <span className="text-white font-bold text-sm uppercase tracking-wide">Copiar</span>
                    </div>
                </div>
                </div>
            ))}
            </div>
        )}
        
        {modalImage && (
          <PromptModal 
            data={modalImage} 
            close={() => setModalImage(null)} 
            copy={handleCopy} 
            copied={copied}
            toggleFav={toggleFavorite}
            isFav={favorites.includes(modalImage.id)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="animate-fadeIn max-w-7xl mx-auto space-y-12">
      <section>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Sparkles size={20} className="text-yellow-400 mr-2" /> Seus Packs & Loja
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {packs.map(pack => {
            const isLocked = !isGold && !userAccess.includes(pack.id);
            
            return (
              <div 
                key={pack.id} 
                onClick={() => isLocked ? onPurchase(pack.id) : openPack(pack)}
                className={`aspect-[3/4] relative rounded-2xl overflow-hidden border transition-all duration-300 group cursor-pointer
                  ${isLocked 
                    ? 'border-gray-800 opacity-90 hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] hover:border-blue-500' 
                    : isGold 
                        ? 'border-yellow-500/30 hover:border-yellow-400 hover:shadow-[0_0_25px_rgba(234,179,8,0.3)]' 
                        : 'border-blue-500/30 hover:border-blue-400 hover:shadow-[0_0_25px_rgba(59,130,246,0.2)]'
                  }
                `}
              >
                <img src={pack.cover} alt={pack.title} className={`w-full h-full object-cover transition-transform duration-700 ${isLocked ? 'grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-80' : 'group-hover:scale-110'}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 right-0 p-4 z-20 text-center">
                  <h3 className="text-white font-bold text-lg leading-tight drop-shadow-md">{pack.title}</h3>
                </div>

                {isLocked && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                     <Lock size={32} className="text-blue-400 mb-4 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                     <button 
                      onClick={(e) => handlePurchaseClick(e, pack.id)}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg shadow-blue-900/50 transition-all transform hover:scale-105"
                     >
                       Comprar {pack.price}
                     </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6 border-t border-gray-800 pt-8">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Zap size={20} className="text-blue-500 mr-2" /> Prompts Gratuitos
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {freePrompts.map(item => (
            <div 
              key={item.id} 
              onClick={() => setModalImage(item)}
              className="aspect-[3/4] bg-gray-900 rounded-xl overflow-hidden cursor-pointer border border-gray-800 hover:border-blue-500 transition-all relative group"
            >
              <img 
                src={item.url} 
                alt="Free Prompt" 
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:blur-sm" 
              />
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                  <div className="bg-blue-600/90 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-xl">
                    <Copy size={18} className="text-white mr-2" />
                    <span className="text-white font-bold text-sm uppercase tracking-wide">Copiar</span>
                  </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {modalImage && (
        <PromptModal 
            data={modalImage} 
            close={() => setModalImage(null)} 
            copy={handleCopy} 
            copied={copied} 
            toggleFav={toggleFavorite} 
            isFav={favorites.includes(modalImage.id)}
        />
      )}
    </div>
  );
}

function GeneratorsHub({ user, onPurchase }) {
  const userAccess = user.access;
  const isGold = user.plan === 'gold';
  const hasAccess = isGold || userAccess.includes('access-generators');

  if (!hasAccess) {
    return (
      <div className="animate-fadeIn max-w-4xl mx-auto text-center py-12">
        <div className="inline-block p-6 rounded-full bg-gray-900 border border-gray-800 mb-6 relative">
          <Zap size={64} className="text-gray-600" />
          <div className="absolute -top-2 -right-2 bg-blue-500 p-2 rounded-full animate-bounce">
            <Lock size={20} className="text-white" />
          </div>
        </div>
        <h2 className="text-4xl font-bold text-white mb-4">Área Restrita: Creators Lab</h2>
        <p className="text-xl text-gray-400 mb-8 max-w-xl mx-auto">
          Acesse nosso gerador de Gems exclusivo e as melhores ferramentas de IA do mercado.
        </p>
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 max-w-md mx-auto hover:border-blue-500 transition-colors group">
          <h3 className="text-2xl font-bold text-white mb-2">Plano Creator</h3>
          <div className="text-3xl font-bold text-blue-400 mb-6">R$ 49,90 <span className="text-sm text-gray-500 font-normal">/ vitalício</span></div>
          <button 
            onClick={() => onPurchase('access-generators')}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20 group-hover:shadow-blue-500/40"
          >
            Desbloquear Agora
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="animate-fadeIn max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
          {isGold ? <Crown size={28} className="text-yellow-400 mr-3 fill-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" /> : null}
          Central de Geradores
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className={`bg-gray-900 rounded-2xl border overflow-hidden group transition-all relative ${isGold ? 'border-yellow-500/30 hover:border-yellow-400' : 'border-gray-800 hover:border-blue-500'}`}>
           <div className={`h-48 bg-gradient-to-br flex items-center justify-center ${isGold ? 'from-yellow-900/20 to-black' : 'from-blue-900/40 to-purple-900/40'}`}>
              <Sparkles size={64} className={isGold ? "text-yellow-400" : "text-blue-400"} />
           </div>
           <div className="p-8">
             <h3 className="text-2xl font-bold text-white mb-2">Gerador de Prompts</h3>
             <button className={`w-full py-3 border font-bold rounded-xl transition-all ${isGold ? 'border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black' : 'border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white'}`}>
               <Play size={20} className="mr-2 inline" /> Iniciar App
             </button>
           </div>
        </div>
        <div className={`bg-gray-900 rounded-2xl border overflow-hidden group transition-all relative ${isGold ? 'border-yellow-500/30 hover:border-purple-400' : 'border-gray-800 hover:border-purple-500'}`}>
           <div className="h-48 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative">
              <Images size={64} className="text-white relative z-10" />
           </div>
           <div className="p-8">
             <h3 className="text-2xl font-bold text-white mb-2">Gerador de Imagens</h3>
             <button className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all">
               Acessar Ferramenta <ExternalLink size={20} className="ml-2 inline" />
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}

function PromptModal({ data, close, copy, copied, toggleFav, isFav }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fadeIn" onClick={close}>
      <div className="bg-gray-900 rounded-2xl max-w-5xl w-full flex flex-col md:flex-row overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-gray-800" onClick={e => e.stopPropagation()}>
        <div className="md:w-1/2 bg-black flex items-center justify-center relative">
          <img src={data.url} alt="Detail" className="max-h-[500px] md:max-h-[80vh] w-full object-contain" />
          <button onClick={close} className="absolute top-4 left-4 md:hidden bg-black/50 p-2 rounded-full text-white"><X/></button>
        </div>
        <div className="md:w-1/2 p-8 flex flex-col border-l border-gray-800 bg-gray-900">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white">PromptLab Details</h3>
              <p className="text-gray-500 text-sm font-mono mt-1">ID: #{data.id}</p>
            </div>
            <button onClick={close} className="text-gray-500 hover:text-white hidden md:block"><X size={28}/></button>
          </div>
          <div className="flex-1 bg-black rounded-xl p-6 border border-gray-800 mb-8 overflow-y-auto custom-scrollbar">
            <p className="text-gray-300 font-mono text-sm leading-relaxed tracking-wide">{data.prompt}</p>
          </div>
          <div className="grid grid-cols-5 gap-4 mt-auto">
            <button onClick={() => copy(data.prompt)} className={`col-span-4 flex items-center justify-center py-4 rounded-xl font-bold text-lg transition-all duration-300 ${copied ? 'bg-green-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>
              {copied ? <Check size={24} className="mr-2"/> : <Copy size={24} className="mr-2"/>} {copied ? "COPIADO" : "COPIAR PROMPT"}
            </button>
            <button onClick={() => toggleFav(data.id)} className={`col-span-1 flex items-center justify-center rounded-xl border transition-all ${isFav ? 'bg-pink-500/10 border-pink-500 text-pink-500' : 'border-gray-700 text-gray-500 hover:border-pink-500 hover:text-pink-500'}`}>
              <Heart size={24} className={isFav ? "fill-current" : ""} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Favorites({ packs, freePrompts, favorites, toggleFavorite }) {
  const allItems = [...FREE_PROMPTS]; 
  const favoriteItems = allItems.filter(item => favorites.includes(item.id));
  const [modalImage, setModalImage] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="text-3xl font-bold text-white mb-8">Meus Favoritos</h2>
      {favoriteItems.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {favoriteItems.map(item => (
            <div 
              key={item.id} 
              onClick={() => setModalImage(item)}
              className="aspect-[3/4] bg-gray-900 rounded-xl overflow-hidden cursor-pointer border border-gray-800 hover:border-pink-500 transition-all relative group"
            >
              <img 
                src={item.url} 
                alt="Favorite" 
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:blur-sm" 
              />
              
              <div className="absolute top-2 right-2 bg-pink-500 text-white p-2 rounded-lg shadow-lg z-20">
                <Heart size={14} className="fill-current"/>
              </div>

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                  <div className="bg-pink-600/90 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-xl">
                    <Copy size={18} className="text-white mr-2" />
                    <span className="text-white font-bold text-sm uppercase tracking-wide">Copiar</span>
                  </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 opacity-30">
          <Star size={64} className="mb-4"/>
          <p>Nenhum favorito ainda.</p>
        </div>
      )}

      {modalImage && (
        <PromptModal 
          data={modalImage} 
          close={() => setModalImage(null)} 
          copy={handleCopy} 
          copied={copied}
          toggleFav={toggleFavorite}
          isFav={true}
        />
      )}
    </div>
  );
}

function Tutorials({ videos }) {
  return (
    <div className="animate-fadeIn max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-white mb-8">Central de Aprendizado</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map(video => (
          <div key={video.id} className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-blue-500 transition-all group cursor-pointer">
            <div className="aspect-video relative overflow-hidden">
              <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-red-600 text-white rounded-full p-4 shadow-xl"><Play size={20} className="ml-1 fill-white" /></div>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-white text-lg">{video.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Profile({ user, setUser }) {
  const [activeTab, setActiveTab] = useState('perfil');
  const isGold = user.plan === 'gold';
  const isFree = !isGold && user.access.length === 0;
  
  const [formData, setFormData] = useState({
    firstName: user.name?.split(' ')[0] || '',
    lastName: user.name?.split(' ').slice(1).join(' ') || '',
    username: user.email,
    phone: user.phone || '',
    displayName: user.name,
    avatar: user.avatar,
    cover: user.cover,
    facebook: '',
    instagram: '',
    tiktok: ''
  });
  
  const [passwordData, setPasswordData] = useState({
      current: '',
      new: '',
      confirm: ''
  });

  const handleImageUpload = (type) => {
      alert(`Abertura de seletor de arquivos para: ${type}`);
  };

  const handleSave = () => {
    setUser({
      ...user,
      name: `${formData.firstName} ${formData.lastName}`,
      avatar: formData.avatar,
      cover: formData.cover
    });
    alert("Perfil atualizado com sucesso!");
  };

  const handlePasswordUpdate = () => {
      if(passwordData.new !== passwordData.confirm) {
          alert("As senhas não coincidem!");
          return;
      }
      alert("Senha atualizada com sucesso!");
  };

  const handleSocialUpdate = () => {
      alert("Redes sociais atualizadas!");
  };

  return (
    <div className="animate-fadeIn max-w-5xl mx-auto pb-20">
      <div className="flex justify-between items-start mb-8">
          <h2 className="text-3xl font-bold text-white">Configurações</h2>
          <div className="flex flex-col items-end">
              {/* Status Badge */}
              {isGold ? (
                  <span className="text-yellow-400 text-sm font-bold flex items-center border border-yellow-500/50 px-3 py-1 rounded-full bg-yellow-500/10 shadow-[0_0_15px_rgba(250,204,21,0.2)] mb-2">
                      <Crown size={14} className="mr-2 fill-yellow-400" /> CONTA GOLD
                  </span>
              ) : (
                <div className={`${isFree ? 'text-red-500 border-red-500/30 bg-red-500/10' : 'text-blue-400 border-blue-500/30 bg-blue-500/10'} text-sm font-bold flex items-center border px-3 py-1 rounded-full mb-2`}>
                    {!isFree ? (
                        <><Sparkles size={14} className="mr-2" /> MEMBRO PRO</>
                    ) : (
                        <><User size={14} className="mr-2" /> MEMBRO FREE</>
                    )}
                </div>
              )}

              {/* Upgrade Button */}
              {!isGold && (
                <button 
                  onClick={() => alert('Redirecionar para pagamento Gold')}
                  className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/50 px-4 py-2 rounded-full text-sm font-bold flex items-center transition-all shadow-[0_0_15px_rgba(250,204,21,0.15)] hover:shadow-[0_0_25px_rgba(250,204,21,0.3)]"
                >
                  <Crown size={16} className="mr-2" /> SEJA GOLD
                </button>
              )}
          </div>
      </div>

      <div className="flex space-x-8 border-b border-gray-800 mb-8">
        <button 
          onClick={() => setActiveTab('perfil')}
          className={`pb-4 font-medium text-sm transition-colors relative ${activeTab === 'perfil' ? 'text-blue-500' : 'text-gray-400 hover:text-white'}`}
        >
          Perfil
          {activeTab === 'perfil' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('senha')}
          className={`pb-4 font-medium text-sm transition-colors relative ${activeTab === 'senha' ? 'text-blue-500' : 'text-gray-400 hover:text-white'}`}
        >
          Senha
          {activeTab === 'senha' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('social')}
          className={`pb-4 font-medium text-sm transition-colors relative ${activeTab === 'social' ? 'text-blue-500' : 'text-gray-400 hover:text-white'}`}
        >
          Perfil Social
          {activeTab === 'social' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t-full"></div>}
        </button>
      </div>

      {activeTab === 'perfil' && (
        <div className="space-y-8">
          
          <div className="relative mb-12">
            <div className={`h-48 md:h-64 w-full rounded-t-xl relative overflow-hidden bg-gray-800 border group ${isGold ? 'border-yellow-500/30' : 'border-gray-700'}`}>
              <button className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-red-500/80 rounded text-white transition-colors z-10">
                <Trash2 size={18} />
              </button>
              
              <img src={formData.cover} alt="Capa" className="w-full h-full object-cover opacity-80" />
              
              <button 
                onClick={() => handleImageUpload('Capa')}
                className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-bold flex items-center shadow-lg transition-all"
              >
                <Camera size={16} className="mr-2" /> Alterar Capa
              </button>
            </div>

            <div className="absolute -bottom-16 left-8 md:left-12">
              <div className="relative group">
                <div className={`w-32 h-32 rounded-full border-[6px] overflow-hidden bg-gray-700 ${isGold ? 'border-yellow-500 shadow-[0_0_20px_rgba(250,204,21,0.4)]' : 'border-black'}`}>
                   <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div 
                    onClick={() => handleImageUpload('Avatar')}
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity border-[6px] border-transparent"
                >
                   <Camera size={24} className="text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-end text-xs text-gray-500 gap-4 mt-2 px-4">
             <span>Tamanho da Foto de Perfil: 200x200 pixels</span>
             <span>Tamanho da Foto de Capa: 700x430 pixels</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-white">Nome</label>
              <input 
                type="text" 
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:border-blue-500 focus:outline-none transition-colors placeholder-gray-600"
                placeholder="Seu primeiro nome"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-white">Último nome</label>
              <input 
                type="text" 
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:border-blue-500 focus:outline-none transition-colors placeholder-gray-600"
                placeholder="Último nome"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-white">Nome de usuário</label>
              <input 
                type="text" 
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:border-blue-500 focus:outline-none transition-colors placeholder-gray-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-white">Número de telefone</label>
              <input 
                type="text" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:border-blue-500 focus:outline-none transition-colors placeholder-gray-600"
                placeholder="Número de telefone"
              />
            </div>
          </div>

          <div className="space-y-2">
             <label className="text-sm font-bold text-white">Exibir nome publicamente como</label>
             <div className="relative">
                <select 
                  value={formData.displayName}
                  onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                  className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:border-blue-500 focus:outline-none transition-colors appearance-none cursor-pointer"
                >
                  <option>{formData.firstName} {formData.lastName}</option>
                  <option>{formData.firstName}</option>
                  <option>{formData.username}</option>
                </select>
                <div className="absolute right-4 top-3.5 text-gray-500 pointer-events-none">▼</div>
             </div>
             <p className="text-xs text-gray-500 mt-2 leading-relaxed">
               O nome apresentado é exibido em todos os campos públicos...
             </p>
          </div>

          <div>
            <button 
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-blue-900/20 transition-all transform active:scale-95"
            >
              Atualizar Perfil
            </button>
          </div>

        </div>
      )}

      {activeTab === 'senha' && (
         <div className="max-w-2xl mx-auto py-10 space-y-6 animate-fadeIn">
             <div className="space-y-2">
                <label className="text-sm font-bold text-white flex items-center"><Key size={16} className="mr-2"/> Senha Atual</label>
                <input 
                    type="password" 
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                    className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="••••••••"
                />
             </div>
             <div className="space-y-2">
                <label className="text-sm font-bold text-white">Nova Senha</label>
                <input 
                    type="password" 
                    value={passwordData.new}
                    onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                    className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="••••••••"
                />
             </div>
             <div className="space-y-2">
                <label className="text-sm font-bold text-white">Confirmação Nova Senha</label>
                <input 
                    type="password" 
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                    className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="••••••••"
                />
             </div>
             <button 
              onClick={handlePasswordUpdate}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-blue-900/20 transition-all transform active:scale-95 mt-4"
            >
              Atualizar Senha
            </button>
         </div>
      )}

      {activeTab === 'social' && (
         <div className="max-w-2xl mx-auto py-10 space-y-6 animate-fadeIn">
            <div className="space-y-2">
              <label className="text-sm font-bold text-white flex items-center"><Facebook size={18} className="mr-2 text-blue-500"/> Facebook</label>
              <input 
                type="text" 
                value={formData.facebook}
                onChange={(e) => setFormData({...formData, facebook: e.target.value})}
                className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:border-blue-500 focus:outline-none transition-colors placeholder-gray-600"
                placeholder="URL do perfil"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-white flex items-center"><Instagram size={18} className="mr-2 text-pink-500"/> Instagram</label>
              <input 
                type="text" 
                value={formData.instagram}
                onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:border-blue-500 focus:outline-none transition-colors placeholder-gray-600"
                placeholder="@usuario"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-white flex items-center"><Music size={18} className="mr-2 text-cyan-400"/> TikTok</label>
              <input 
                type="text" 
                value={formData.tiktok}
                onChange={(e) => setFormData({...formData, tiktok: e.target.value})}
                className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:border-blue-500 focus:outline-none transition-colors placeholder-gray-600"
                placeholder="@usuario"
              />
            </div>
             <button 
              onClick={handleSocialUpdate}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-blue-900/20 transition-all transform active:scale-95 mt-4"
            >
              Salvar Redes Sociais
            </button>
         </div>
      )}
    </div>
  );
}