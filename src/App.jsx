import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import Row from './components/Row';
import { Search, Bell, LogIn, ShoppingBag, Play } from 'lucide-react';

function App() {
  const [featuredItem, setFeaturedItem] = useState(null);
  const [packs, setPacks] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [session, setSession] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  // 1. Gerenciamento de Sessão e Scroll
  useEffect(() => {
    // Pega a sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Escuta login/logout
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Detecta scroll para mudar cor da navbar
    const handleScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 2. Busca de Dados
  useEffect(() => {
    const fetchData = async () => {
      // Busca Packs (Ordenando Premium primeiro para dar destaque)
      const { data: packsData } = await supabase
        .from('products')
        .select('*')
        .eq('type', 'pack')
        .order('is_premium', { ascending: false }) 
        .limit(10);
      
      if (packsData) setPacks(packsData);

      // Busca Prompts (Geralmente grátis)
      const { data: promptsData } = await supabase
        .from('products')
        .select('*')
        .eq('type', 'prompt')
        .limit(20);

      if (promptsData) setPrompts(promptsData);

      // Define o Hero Banner
      // Tenta pegar um marcado como 'is_featured', senão pega o primeiro pack
      if (packsData && packsData.length > 0) {
        const featured = packsData.find(p => p.is_featured) || packsData[0];
        setFeaturedItem(featured);
      }
    };

    fetchData();
  }, []);

  // Função placeholder de Login
  const handleLogin = async () => {
    // Para funcionar, ative o Google Provider no painel do Supabase
    // await supabase.auth.signInWithOAuth({ provider: 'google' });
    alert("Configure o Google Auth no Supabase para ativar este botão!");
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-900/10 to-[#010511] pb-20">
      
      {/* --- NAVBAR --- */}
      <header className={`fixed top-0 z-50 flex w-full items-center justify-between px-4 py-4 transition-all duration-500 lg:px-10 lg:py-6 ${scrolled ? 'bg-[#141414]' : 'bg-transparent'}`}>
        <div className="flex items-center space-x-2 md:space-x-10">
          <h1 className="text-red-600 text-2xl md:text-4xl font-bold uppercase tracking-widest cursor-pointer drop-shadow-lg">
            PromptLab
          </h1>
          
          <ul className="hidden space-x-4 md:flex text-[#e5e5e5]">
            <li className="cursor-pointer text-sm font-light hover:text-white transition">Início</li>
            <li className="cursor-pointer text-sm font-light hover:text-white transition">Packs</li>
            <li className="cursor-pointer text-sm font-light hover:text-white transition">Prompts</li>
            {session && <li className="cursor-pointer text-sm font-bold text-red-500 transition">Minha Biblioteca</li>}
          </ul>
        </div>
        
        <div className="flex items-center space-x-4 text-sm font-light text-white">
          <Search className="hidden sm:inline h-6 w-6 cursor-pointer hover:text-gray-300" />
          
          {session ? (
            <>
              <Bell className="h-6 w-6 cursor-pointer hover:text-gray-300" />
              {/* Avatar do Usuário */}
              <img 
                src={session.user?.user_metadata?.avatar_url || "https://i.pravatar.cc/150?img=3"} 
                alt="Avatar" 
                className="h-8 w-8 rounded-full cursor-pointer border border-white/20"
              />
            </>
          ) : (
            <button 
              onClick={handleLogin}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded text-sm font-bold transition"
            >
              <LogIn size={16} /> Entrar
            </button>
          )}
        </div>
      </header>

      <main className="relative pl-4 lg:pl-10 bg-[#141414]">
        
        {/* --- HERO BANNER (Destaque Principal) --- */}
        {featuredItem && (
          <div className="flex flex-col space-y-2 py-16 md:space-y-4 lg:h-[75vh] lg:justify-end lg:pb-12 mb-10">
            
            {/* Imagem de Fundo Absoluta */}
            <div className="absolute top-0 left-0 -z-10 h-[85vh] w-full">
              <img 
                src={featuredItem.image_url} 
                alt="Banner" 
                className="h-full w-full object-cover opacity-60"
              />
              {/* Degradê inferior para suavizar a transição para o preto */}
              <div className="absolute bottom-0 w-full h-40 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent"></div>
            </div>

            {/* Conteúdo do Hero */}
            <h1 className="text-3xl font-bold text-white md:text-5xl lg:text-7xl shadow-black drop-shadow-xl max-w-4xl">
              {featuredItem.title}
            </h1>

            {/* Tags e Info */}
            <div className="flex items-center gap-3">
               {featuredItem.is_premium && (
                 <span className="bg-yellow-500 text-black text-xs font-extrabold px-2 py-0.5 rounded shadow-lg shadow-yellow-500/20">
                   PREMIUM
                 </span>
               )}
               <span className="text-green-400 font-bold text-sm">98% Match</span>
               <span className="text-gray-300 text-sm">{featuredItem.category || 'Geral'}</span>
            </div>

            <p className="max-w-xs text-xs md:max-w-lg md:text-lg lg:max-w-2xl text-gray-200 drop-shadow-md">
              {featuredItem.description ? featuredItem.description.substring(0, 150) + "..." : "Descrição indisponível."}
            </p>

            {/* Botões do Hero */}
            <div className="flex space-x-3 mt-4">
              <button 
                onClick={() => featuredItem.is_premium ? alert(`R$ ${featuredItem.price}`) : alert("Ver Prompt")}
                className="flex items-center gap-x-2 rounded bg-white px-6 py-2 text-sm font-bold text-black transition hover:bg-[#e6e6e6] md:py-3 md:text-xl"
              >
                {featuredItem.is_premium ? (
                  <> <ShoppingBag size={24} /> Comprar Pack R$ {featuredItem.price} </>
                ) : (
                  <> <Play size={24} className="fill-black" /> Ver Prompt </>
                )}
              </button>
              
              <button className="flex items-center gap-x-2 rounded bg-gray-500/70 px-6 py-2 text-sm font-bold text-white transition hover:bg-gray-500/50 md:py-3 md:text-xl">
                Mais Informações
              </button>
            </div>
          </div>
        )}

        {/* --- TRILHOS DE CONTEÚDO --- */}
        <section className="space-y-12 md:space-y-24 z-20 relative">
          
          {/* Trilho 1: Packs (Posters Verticais) */}
          {packs.length > 0 && (
            <Row title="Packs Premium & Exclusivos" items={packs} isLargeRow={true} />
          )}

          {/* Trilho 2: Prompts (Cards Horizontais) */}
          {prompts.length > 0 && (
            <Row title="Prompts da Comunidade (Grátis)" items={prompts} />
          )}

           {/* Trilho 3: Repetição para volume (apenas exemplo visual) */}
          {prompts.length > 0 && (
            <Row title="Tendências em Retratos e IA" items={prompts} />
          )}

        </section>
      </main>
    </div>
  );
}

export default App;