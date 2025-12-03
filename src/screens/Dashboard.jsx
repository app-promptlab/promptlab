import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Row from '../components/Row';
import DynamicPage from '../components/DynamicPage';

export default function Dashboard({ user, changeTab }) {
  const [news, setNews] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const { data: newsData } = await supabase.from('news').select('*').limit(5);
      const { data: favData } = await supabase.from('user_favorites').select('*, item:pack_items(*)').eq('user_id', user.id);
      const { data: trendData } = await supabase.from('pack_items').select('*').eq('is_featured', true).limit(10);
      setNews(newsData || []);
      setFavorites(favData?.map(f => f.item) || []);
      setTrending(trendData || []);
    };
    if (user) loadData();
  }, [user]);

  return (
    // Passando user={user} para habilitar a variável {name}
    <DynamicPage pageId="dashboard" user={user}>
        <div className="space-y-2 mt-8">
            {news.length > 0 && <Row title="Novidades" items={news} isLarge={true} type="news" />}
            {favorites.length > 0 && <Row title="Meus Favoritos" items={favorites} type="prompt" />}
            <Row title="Populares da Semana" items={trending} type="prompt" />
        </div>
    </DynamicPage>
  );
}