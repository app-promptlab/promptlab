import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Copy, Heart, Lock, X, Loader2, Image as ImageIcon } from 'lucide-react';

// --- CONFIGURAÇÃO ---
const LINK_CHECKOUT = "https://pay.kiwify.com.br/hgxpno4"; // Seu link de Prompts
// --------------------

export default function PromptsGallery({ user, showToast, onlyFavorites = false }) {
  const [prompts, setPrompts] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null); // Para o Modal

  // Verifica acesso
  const hasAccess = user?.plan === 'admin' || user?.has_prompts;

  useEffect(() => {
    fetchData();
  }, [user, onlyFavorites]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Buscar Prompts
      let query = supabase
        .from('pack_items')
        .select('*')
        .order('order_index', { ascending: true });

      const { data: promptsData, error: promptsError } = await query;
      if (promptsError) throw promptsError;

      // 2. Buscar Favoritos do usuário para pintar o coração
      const { data: favsData, error: favsError } = await supabase
        .from('user_favorites')
        .select('pack_item_id')
        .eq('user_id', user.id);

      if (favsError && favsError.code !== 'PGRST116') console.error(favsError);
      
      const favSet = new Set(favsData?.map(f => f.pack_item_id) || []);
      setFavorites(favSet);

      // Se a aba for "Favoritos", filtrar localmente
      if (onlyFavorites) {
        setPrompts(promptsData.filter(p => favSet.has(p.id)));
      } else {
        setPrompts(promptsData || []);
      }

    } catch (error) {
      console.error('Erro:', error);
      showToast('Erro ao carregar galeria');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (e, item) => {
    e.stopPropagation(); // Não abrir o modal
    const isFav = favorites.has(item.id);
    const newFavs = new Set(favorites);

    try {
      if (isFav) {
        // Remover
        await supabase.from('user_favorites').delete().eq('user_id', user.id).eq('pack_item_id', item.id);
        newFavs.delete(item.id);
        showToast('Removido dos favoritos');
      } else {
        // Adicionar
        await supabase.from('user_favorites').insert({ user_id: user.id, pack_item_id: item.id });
        newFavs.add(item.id);
        showToast('Salvo nos favoritos!');
      }
      setFavorites(newFavs);
      
      // Se estiver na tela de favoritos e remover, atualiza a lista visualmente
      if (onlyFavorites && isFav) {
        setPrompts(prev => prev.filter(p => p.id !== item.id));
      }

    } catch (error) {
      console.error(error);
      showToast('Erro ao atualizar favorito');
    }
  };

  const copyToClipboard = (e, text) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    showToast('Prompt copiado!');
  };

  // Renderização do Modal de Detalhes
  const Modal = () => {
    if (!selectedItem) return null;
    const isFav = favorites.has(selectedItem.id);

    return (
      <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" onClick={() => setSelectedItem(null)}>
        <div className="bg-theme-sidebar border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl" onClick={e => e.stopPropagation()}>
            
            {/* Imagem Grande */}
            <div className="w-full md:w-1/2 bg-black flex items-center justify-center relative">
                <img src={selectedItem.url} alt={selectedItem.title} className="max-h-[50vh] md:max-h-full w-full object-contain" />
            </div>

            {/* Painel Lateral */}
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col bg-theme-sidebar">
                <div className="flex justify-between items-start mb-6">
                    <h2 className="text-2xl font-bold text-white">{selectedItem.title}</h2>
                    <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-white transition-colors">
                        <X size={28} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto mb-6 bg-black/20 rounded-xl p-4 border border-white/5">
                    <p className="text-gray-300 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                        {selectedItem.prompt}
                    </p>
                </div>

                <div className="flex gap-3 mt-auto">
                    <button 
                        onClick={(e) => copyToClipboard(e, selectedItem.prompt)}
                        className="flex-1 bg-theme-primary hover:bg-theme-primary/90 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95"
                    >
                        <Copy size={18} /> Copiar Prompt
                    </button>
                    <button 
                        onClick={(e) => toggleFavorite(e, selectedItem)}
                        className={`px-4 py-3 rounded-xl border-2 font-bold transition-all active:scale-95 ${isFav ? 'bg-red-500/10 border-red-500 text-red-500' : 'border-white/10 text-gray-400 hover:text-white hover:border-white'}`}
                    >
                        <Heart size={24} fill={isFav ? "currentColor" : "none"} />
                    </button>
                </div>
            </div>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full text-theme-primary">
        <Loader2 size={48} className="animate-spin"/>
    </div>
  );

  return (
    <div className="p-4 md:p-8 pb-20">
      
      {/* Título simples */}
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-6 pl-2 border-l-4 border-theme-primary">
        {onlyFavorites ? 'Meus Favoritos' : 'Galeria de Inspiração'}
      </h1>

      {/* Grid estilo Pinterest (Masonry-like com aspect ratio vertical) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {prompts.map((item) => {
            const isLocked = !item.is_free && !hasAccess;
            const isFav = favorites.has(item.id);

            return (
                <div 
                    key={item.id} 
                    onClick={() => {
                        if (isLocked) window.open(LINK_CHECKOUT, '_blank');
                        else setSelectedItem(item);
                    }}
                    className={`group relative rounded-xl overflow-hidden bg-white/5 border border-white/5 transition-all duration-300 cursor-pointer aspect-[2/3] ${isLocked ? 'hover:border-theme-primary/50' : ''}`}
                >
                    {/* Imagem */}
                    {item.url ? (
                        <img 
                            src={item.url} 
                            alt={item.title} 
                            className={`w-full h-full object-cover transition-transform duration-500 
                                ${isLocked 
                                    ? 'filter brightness-[0.25] blur-[2px]' 
                                    : 'group-hover:scale-110 group-hover:brightness-50 group-hover:blur-[2px]'
                                }
                            `} 
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-700">
                            <ImageIcon size={32} />
                        </div>
                    )}

                    {/* INTERAÇÃO: ITEM LIBERADO (Aparece no Hover) */}
                    {!isLocked && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 gap-4">
                            <button 
                                onClick={(e) => copyToClipboard(e, item.prompt)}
                                className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-theme-primary hover:scale-110 transition-all shadow-lg"
                                title="Copiar"
                            >
                                <Copy size={20} />
                            </button>
                            <button 
                                onClick={(e) => toggleFavorite(e, item)}
                                className={`p-3 backdrop-blur-md rounded-full transition-all hover:scale-110 shadow-lg ${isFav ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                title="Favoritar"
                            >
                                <Heart size={20} fill={isFav ? "currentColor" : "none"} />
                            </button>
                        </div>
                    )}

                    {/* INTERAÇÃO: ITEM BLOQUEADO (Cadeado Vazado) */}
                    {isLocked && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            {/* O cadeado "vazado" (outline) */}
                            <Lock size={48} className="text-white/30" strokeWidth={1.5} />
                            {/* Dica sutil visual de que é clicável */}
                            <div className="mt-2 text-[10px] text-white/30 uppercase tracking-[0.2em] font-light">Locked</div>
                        </div>
                    )}
                </div>
            );
        })}
      </div>

      {prompts.length === 0 && !loading && (
            <div className="text-center py-20 text-gray-500 flex flex-col items-center">
                <p>Nenhum prompt encontrado.</p>
                {onlyFavorites && <p className="text-sm mt-2">Explore a galeria e salve seus favoritos!</p>}
            </div>
      )}

      {/* Modal Overlay */}
      <Modal />

    </div>
  );
}