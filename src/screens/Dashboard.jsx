import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Row from '../components/Row';
import DynamicPage from '../components/DynamicPage';
import PromptModal from '../components/PromptModal'; 

// Link para redirecionar usuários Free que tentarem acessar conteúdo pago
const LINK_CHECKOUT = "https://pay.kiwify.com.br/hgxpno4"; 

export default function Dashboard({ user, showToast }) {
  const [news, setNews] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [trending, setTrending] = useState([]);
  const [modalItem, setModalItem] = useState(null);
  const [likedIds, setLikedIds] = useState(new Set()); 

  // Verifica se o usuário tem permissão VIP (Admin ou comprou o pacote de prompts)
  const hasAccess = user?.plan === 'admin' || user?.has_prompts;

  useEffect(() => {
    const loadData = async () => {
      const { data: newsData } = await supabase.from('news').select('*').limit(5);
      const { data: favData } = await supabase.from('user_favorites').select('*, item:pack_items(*)').eq('user_id', user.id);
      const { data: trendData } = await supabase.from('pack_items').select('*').eq('is_featured', true).limit(10);
      
      setNews(newsData || []);
      setFavorites(favData?.map(f => f.item) || []);
      
      // SEGURANÇA VISUAL:
      // Processamos os dados para adicionar a flag 'is_locked'.
      // Isso faz o componente Row desenhar o cadeado em cima da imagem.
      const processedTrending = (trendData || []).map(item => ({
        ...item,
        is_locked: !item.is_free && !hasAccess
      }));

      setTrending(processedTrending);
      setLikedIds(new Set(favData?.map(f => f.item_id))); 
    };
    if (user) loadData();
  }, [user, hasAccess]); 

  // SEGURANÇA DE ACESSO:
  // Essa função age como um "porteiro". Ela verifica o crachá antes de abrir o modal.
  const handlePromptClick = (item) => {
    // Se o item é pago E o usuário não tem acesso...
    if (!item.is_free && !hasAccess) {
        // ...Manda para a loja!
        window.open(LINK_CHECKOUT, '_blank');
    } else {
        // ...Caso contrário, libera o acesso.
        setModalItem(item);
    }
  };

  const toggleFavorite = async (item) => {
    const isLiked = likedIds.has(item.id);
    const newSet = new Set(likedIds);
    if (isLiked) newSet.delete(item.id); else newSet.add(item.id);
    setLikedIds(newSet);
    
    const msg = isLiked ? "Removido dos favoritos" : "Adicionado aos favoritos!";
    if(showToast) showToast(msg);

    if (isLiked) await supabase.from('user_favorites').delete().match({ user_id: user.id, item_id: item.id });
    else await supabase.from('user_favorites').insert({ user_id: user.id, item_id: item.id });
  };

  return (
    <DynamicPage pageId="dashboard" user={user}>
        {/* FULL BLEED: px-0 no mobile, md:px-12 no Desktop */}
        <div className="space-y-6 mt-4 md:mt-8 px-0 md:px-12 pb-20">
            {news.length > 0 && <Row title="Novidades" items={news} isLarge={true} type="news" />}
            
            {/* Favoritos também passam pela verificação de clique por segurança extra */}
            {favorites.length > 0 && <Row title="Meus Favoritos" items={favorites} type="prompt" onItemClick={handlePromptClick} />}
            
            {/* AQUI A CORREÇÃO PRINCIPAL: Trocamos 'setModalItem' por 'handlePromptClick' */}
            <Row title="Populares da Semana" items={trending} type="prompt" onItemClick={handlePromptClick} />
        </div>

        <PromptModal 
            item={modalItem} 
            onClose={() => setModalItem(null)} 
            onCopy={(text) => { 
                navigator.clipboard.writeText(text); 
                if(showToast) showToast("Copiado!"); 
            }}
            onFavorite={toggleFavorite}
            isLiked={modalItem ? likedIds.has(modalItem.id) : false}
        />
    </DynamicPage>
  );
}