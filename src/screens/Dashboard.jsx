import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Row from '../components/Row';
import { Zap, Loader2 } from 'lucide-react';

export default function Dashboard({ user, changeTab }) {
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // 1. Carregar Novidades (Tabela news)
        const { data: newsData } = await supabase.from('news').select('*').limit(5);
        
        // 2. Carregar Favoritos (Join com pack_items)
        // Nota: O supabase retorna data.item como um objeto
        const { data: favData } = await supabase
          .from('user_favorites')
          .select('*, item:pack_items(*)')
          .eq('user_id', user.id);
        
        // Mapear para extrair apenas o item de dentro do favorito
        const formattedFavs = favData?.map(f => f.item) || [];

        // 3. Carregar "Mais Curtidos" (Usando Featured como base por enquanto)
        const { data: trendData } = await supabase
          .from('pack_items')
          .select('*')
          .eq('is_featured', true)
          .limit(10);

        setNews(newsData || []);
        setFavorites(formattedFavs);
        setTrending(trendData || []);

      } catch (error) {
        console.error("Erro dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) loadData();
  }, [user]);

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-blue-600"/></div>;

  return (
    <div className="w-full animate-fadeIn pb-20">
      
      {/* Hero Header Simples */}
      <div className="relative h-[40vh] bg-gradient-to-b from-blue-900/20 to-black flex items-end p-8 md:p-12">
        <div className="max-w-4xl relative z-10">
           <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter">
             Olá, {user?.name?.split(' ')[0] || 'Criador'}
           </h1>
           <p className="text-gray-400 text-lg md:text-xl max-w-xl mb-6">
             Pronto para criar algo extraordinário hoje? Explore nossos novos packs e ferramentas de IA.
           </p>
           <div className="flex gap-4">
             <button onClick={() => changeTab('generator')} className="bg-white text-black hover:bg-gray-200 px-6 py-3 rounded-lg font-bold flex items-center transition-colors">
               <Zap size={20} className="mr-2" />
               Gerar Agora
             </button>
             <button onClick={() => changeTab('prompts')} className="bg-gray-800/80 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold backdrop-blur-md transition-colors">
               Explorar Packs
             </button>
           </div>
        </div>
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none"/>
      </div>

      {/* Conteúdo Estilo Netflix - Sobe um pouco sobre o Hero */}
      <div className="relative z-20 px-4 md:px-12 -mt-10 space-y-4">
        
        {/* Linha 1: Novidades */}
        {news.length > 0 && (
          <Row title="Novidades & Atualizações" items={news} isLarge={true} type="news" />
        )}

        {/* Linha 2: Favoritos (Só aparece se tiver) */}
        {favorites.length > 0 && (
          <Row title="Seus Favoritos" items={favorites} type="prompt" />
        )}

        {/* Linha 3: Mais Curtidos / Populares */}
        <Row title="Mais Curtidos da Semana" items={trending} type="prompt" />

      </div>
    </div>
  );
}