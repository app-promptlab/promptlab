import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Hero from '../components/Hero';
import Row from '../components/Row';
import { Zap, Images, Search, ShoppingBag, FileText, Play } from 'lucide-react';

export default function Dashboard({ user, settings, changeTab }) {
  const [featuredPrompts, setFeaturedPrompts] = useState([]);
  const [featuredTutorials, setFeaturedTutorials] = useState([]);
  const [news, setNews] = useState([]);

  useEffect(() => {
      supabase.from('pack_items').select('*').eq('is_featured', true).limit(10).then(({data}) => setFeaturedPrompts(data || []));
      supabase.from('tutorials_videos').select('*').eq('is_featured', true).limit(10).then(({data}) => setFeaturedTutorials(data || []));
      supabase.from('news').select('*').limit(2).order('id', {ascending:false}).then(({data}) => setNews(data || []));
  }, []);

  return (
    <div className="w-full animate-fadeIn pb-20">
      {/* Banner Hero */}
      <Hero settings={settings} />
      
      <div className="max-w-full mx-auto px-6 -mt-8 relative z-10 space-y-12">
          {/* Boas Vindas */}
          <div className="flex justify-between items-end pb-4 border-b border-gray-800">
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">Olá, {user.name.split(' ')[0]}</h2>
              <p className="text-gray-400">O que vamos criar hoje?</p>
            </div>
          </div>

          {/* Trilhos (Carrosséis) */}
          <Row title="Destaques da Semana" items={featuredPrompts} type="prompt" />
          <Row title="Aulas Recomendadas" items={featuredTutorials} type="tutorial" isLarge />

          {/* Atalhos Rápidos */}
          <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center"><Zap className="mr-2 text-green-500"/> Ferramentas Rápidas</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button onClick={() => changeTab('generator')} className="bg-gray-900 hover:bg-gray-800 border border-gray-800 p-4 rounded-xl flex flex-col items-center gap-2 transition-all hover:border-green-500 group"><Zap className="text-green-500 group-hover:scale-110 transition-transform"/> <span className="text-white font-bold text-sm">Gerador Texto</span></button>
                  <button onClick={() => changeTab('generator')} className="bg-gray-900 hover:bg-gray-800 border border-gray-800 p-4 rounded-xl flex flex-col items-center gap-2 transition-all hover:border-blue-500 group"><Images className="text-blue-500 group-hover:scale-110 transition-transform"/> <span className="text-white font-bold text-sm">Criar Imagem</span></button>
                  <button onClick={() => changeTab('prompts')} className="bg-gray-900 hover:bg-gray-800 border border-gray-800 p-4 rounded-xl flex flex-col items-center gap-2 transition-all hover:border-purple-500 group"><Search className="text-purple-500 group-hover:scale-110 transition-transform"/> <span className="text-white font-bold text-sm">Buscar Prompt</span></button>
                  <button onClick={() => changeTab('loja')} className="bg-gray-900 hover:bg-gray-800 border border-gray-800 p-4 rounded-xl flex flex-col items-center gap-2 transition-all hover:border-orange-500 group"><ShoppingBag className="text-orange-500 group-hover:scale-110 transition-transform"/> <span className="text-white font-bold text-sm">Comprar Packs</span></button>
              </div>
          </div>

          {/* Feed de Notícias */}
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