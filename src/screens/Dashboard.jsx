import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Row from '../components/Row';
import { Zap, Loader2, Play } from 'lucide-react';

export default function Dashboard({ user, changeTab }) {
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // 1. Novidades
        const { data: newsData } = await supabase.from('news').select('*').limit(5);
        // 2. Favoritos
        const { data: favData } = await supabase.from('user_favorites').select('*, item:pack_items(*)').eq('user_id', user.id);
        const formattedFavs = favData?.map(f => f.item) || [];
        // 3. Mais Curtidos (Trending)
        const { data: trendData } = await supabase.from('pack_items').select('*').eq('is_featured', true).limit(10);

        setNews(newsData || []);
        setFavorites(formattedFavs);
        setTrending(trendData || []);
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    if (user) loadData();
  }, [user]);

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-blue-600"/></div>;

  return (
    <div className="w-full animate-fadeIn pb-20">
      
      {/* --- HERO SECTION (Restaurado) --- */}
      <div className="relative w-full h-[50vh] min-h-[400px] overflow-hidden">
         {/* Capa de Fundo Fixa */}
         <img 
            src="https://egeomuvpkfjpvllzrugc.supabase.co/storage/v1/object/public/promptlab/capa.jfif" 
            className="w-full h-full object-cover"
            alt="Capa"
         />
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black"></div>
         
         {/* Conteúdo Centralizado */}
         <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 mt-10">
            <img 
                src="https://egeomuvpkfjpvllzrugc.supabase.co/storage/v1/object/public/promptlab/logoslogan1.png" 
                className="h-32 md:h-40 object-contain drop-shadow-2xl mb-6 hover:scale-105 transition-transform duration-700"
                alt="PromptLab Logo"
            />
            
            {/* Botões de Ação Rápida no Hero */}
            <div className="flex gap-4 mt-4">
                <button onClick={() => changeTab('generator')} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-all flex items-center">
                    <Zap className="mr-2" size={18}/> CRIAR AGORA
                </button>
                <button onClick={() => changeTab('tutorials')} className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-8 py-3 rounded-full font-bold transition-all flex items-center">
                    <Play className="mr-2 fill-white" size={18}/> AULAS
                </button>
            </div>
         </div>
      </div>

      {/* --- CONTEÚDO ESTILO NETFLIX --- */}
      <div className="relative z-20 px-4 md:px-12 -mt-20 space-y-2">
        {/* Linha 1: Novidades */}
        {news.length > 0 && (
          <Row title="Novidades" items={news} isLarge={true} type="news" />
        )}

        {/* Linha 2: Favoritos */}
        {favorites.length > 0 && (
          <Row title="Meus Favoritos" items={favorites} type="prompt" />
        )}

        {/* Linha 3: Trending */}
        <Row title="Populares da Semana" items={trending} type="prompt" />
      </div>
    </div>
  );
}