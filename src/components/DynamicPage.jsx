import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Play, Link as LinkIcon, Loader2 } from 'lucide-react';

// Adicionamos a prop 'user' aqui 👇
export default function DynamicPage({ pageId, children, user }) {
  const [config, setConfig] = useState(null);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: pageData } = await supabase.from('pages_config').select('*').eq('page_id', pageId).single();
      setConfig(pageData);

      const { data: blockData } = await supabase.from('page_content')
        .select('*')
        .eq('page_id', pageId)
        .order('order_index', { ascending: true });
      setContent(blockData || []);
      
      setLoading(false);
    };
    load();
  }, [pageId]);

  // --- FUNÇÃO MÁGICA DE SUBSTITUIÇÃO ---
  const replaceVariables = (text) => {
    if (!text) return '';
    // Pega o primeiro nome ou "Visitante"
    const firstName = user?.name ? user.name.split(' ')[0] : 'Visitante';
    // Troca {name} pelo nome real
    return text.replace(/{name}/g, firstName);
  };

  if (loading) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-theme-primary"/></div>;

  return (
    <div className="w-full animate-fadeIn pb-24">
      
      {/* CABEÇALHO DINÂMICO */}
      {config?.show_header && (
        <div className="relative w-full h-[40vh] min-h-[350px] overflow-hidden flex items-center justify-center text-center px-6">
            {config.cover_url && (
                <>
                    <img src={config.cover_url} className="absolute inset-0 w-full h-full object-cover" alt="Cover"/>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-theme-bg"></div>
                </>
            )}
            
            <div className="relative z-10 max-w-4xl">
                {/* Aqui aplicamos a substituição 👇 */}
                <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter drop-shadow-lg uppercase">
                    {replaceVariables(config.title || pageId)}
                </h1>
                <p className="text-gray-200 text-lg md:text-xl drop-shadow-md font-medium">
                    {replaceVariables(config.subtitle)}
                </p>
            </div>
        </div>
      )}

      {/* BLOCOS DE CONTEÚDO */}
      <div className="max-w-6xl mx-auto px-6 mt-8 space-y-12">
        {content.map(block => (
            <div key={block.id} className="animate-fadeIn">
                
                {block.type === 'video' && (
                    <div className="w-full max-w-4xl mx-auto">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-theme-primary/20 p-2 rounded-lg"><Play className="text-theme-primary" size={20}/></div>
                            <h3 className="text-xl font-bold text-white">{replaceVariables(block.title)}</h3>
                        </div>
                        <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-800">
                            <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${block.media_url}`} title={block.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                        </div>
                    </div>
                )}

                {block.type === 'banner_large' && (
                    <a href={block.action_link || '#'} target="_blank" rel="noreferrer" className={`relative w-full h-64 md:h-80 rounded-2xl overflow-hidden group block border border-gray-800 hover:border-theme-primary transition-all ${!block.action_link && 'cursor-default pointer-events-none'}`}>
                        <img src={block.media_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={block.title}/>
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90 flex flex-col justify-end p-8">
                            <h3 className="text-3xl font-bold text-white mb-2">{replaceVariables(block.title)}</h3>
                            <p className="text-gray-300 mb-4">{replaceVariables(block.subtitle)}</p>
                            {block.action_link && (
                                <span className="inline-block bg-theme-primary text-white px-6 py-2 rounded-lg font-bold text-sm uppercase tracking-wider w-fit">
                                    {block.action_label || 'Acessar'}
                                </span>
                            )}
                        </div>
                    </a>
                )}

                {block.type === 'banner_small' && (
                     <a href={block.action_link || '#'} target="_blank" rel="noreferrer" className="flex items-center gap-6 p-6 bg-theme-surface border border-gray-700 rounded-xl hover:border-theme-primary transition-all group max-w-2xl mx-auto">
                        {block.media_url && <img src={block.media_url} className="w-20 h-20 object-cover rounded-lg" alt="Icon"/>}
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-theme-primary transition-colors">{replaceVariables(block.title)}</h3>
                            <p className="text-gray-400 text-sm">{replaceVariables(block.subtitle)}</p>
                        </div>
                        {block.action_link && <LinkIcon className="text-gray-500 group-hover:text-white"/>}
                     </a>
                )}

            </div>
        ))}
        
        {children}
      </div>
    </div>
  );
}