import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Copy, Heart, Lock, X, Loader2, Image as ImageIcon, Grid, Layers, CheckCircle } from 'lucide-react';

const LINK_CHECKOUT = "https://pay.kiwify.com.br/hgxpno4"; 

export default function PromptsGallery({ user, showToast, onlyFavorites = false }) {
  const [prompts, setPrompts] = useState([]);
  const [packs, setPacks] = useState([]); // Lista de Packs (Stories)
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Filtros
  const [activePack, setActivePack] = useState('all'); // 'all' ou ID do pack
  const [showAllPacksModal, setShowAllPacksModal] = useState(false); // Modal "Ver Todos"

  const hasAccess = user?.plan === 'admin' || user?.has_prompts;

  useEffect(() => {
    fetchData();
  }, [user, onlyFavorites, activePack]); // Recarrega se mudar o pack

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Busca os Packs (Products) para o carrossel (Só precisa buscar uma vez)
      if (packs.length === 0) {
          const { data: packsData } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false }); // Mais recentes primeiro
          setPacks(packsData || []);
      }

      // 2. Monta a Query dos Prompts
      let query = supabase
        .from('pack_items')
        .select('*')
        .order('order_index', { ascending: true });

      // --- FILTRO DE PACK (A Mágica acontece aqui) ---
      if (activePack !== 'all') {
          query = query.eq('pack_id', activePack);
      }

      const { data: promptsData, error: promptsError } = await query;
      if (promptsError) throw promptsError;

      // 3. Busca Favoritos
      const { data: favsData } = await supabase
        .from('user_favorites')
        .select('item_id')
        .eq('user_id', user.id);
      
      const favSet = new Set(favsData?.map(f => String(f.item_id)) || []);
      setFavorites(favSet);

      // 4. Aplica filtro de Favoritos (se estiver na aba favoritos)
      if (onlyFavorites) {
        setPrompts(promptsData.filter(p => favSet.has(String(p.id))));
      } else {
        setPrompts(promptsData || []);
      }

    } catch (error) {
      console.error('Erro ao carregar:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (e, item) => {
    e.preventDefault(); 
    e.stopPropagation();

    const itemId = String(item.id);
    const isFav = favorites.has(itemId);
    const newFavs = new Set(favorites);

    if (isFav) {
        newFavs.delete(itemId);
        if (onlyFavorites) setPrompts(prev => prev.filter(p => String(p.id) !== itemId));
    } else {
        newFavs.add(itemId);
    }
    setFavorites(newFavs);

    try {
      if (isFav) {
        await supabase.from('user_favorites').delete().eq('user_id', user.id).eq('item_id', item.id);
      } else {
        await supabase.from('user_favorites').insert({ user_id: user.id, item_id: item.id });
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      showToast("Erro ao salvar. Tente novamente.");
    }
  };

  const copyToClipboard = (e, text) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    showToast('Prompt copiado!');
  };

  // --- COMPONENTES VISUAIS ---

  // Card do Pack (Estilo Stories)
  const PackStory = ({ pack, isAll = false, isViewAll = false, isActive }) => {
      if (isViewAll) {
          return (
            <button onClick={() => setShowAllPacksModal(true)} className="flex flex-col items-center gap-2 min-w-[70px] cursor-pointer group">
                <div className="w-[70px] h-[95px] rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center bg-white/5 group-hover:bg-white/10 transition-all">
                    <Grid size={24} className="text-gray-400 group-hover:text-white"/>
                </div>
                <span className="text-[10px] text-gray-400 font-bold uppercase truncate w-full text-center">Ver Todos</span>
            </button>
          );
      }

      return (
        <button 
            onClick={() => setActivePack(isAll ? 'all' : pack.id)}
            className={`flex flex-col items-center gap-2 min-w-[70px] cursor-pointer group transition-transform hover:scale-105 ${isActive ? 'scale-105' : ''}`}
        >
            <div className={`w-[70px] h-[95px] rounded-xl overflow-hidden relative border-2 ${isActive ? 'border-theme-primary shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'border-transparent group-hover:border-white/30'}`}>
                {isAll ? (
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
                        <Layers size={24} className={isActive ? 'text-theme-primary' : 'text-gray-400'} />
                    </div>
                ) : (
                    <img src={pack.cover} alt={pack.title} className="w-full h-full object-cover" />
                )}
                
                {/* Overlay Ativo */}
                {isActive && (
                    <div className="absolute inset-0 bg-theme-primary/20 flex items-center justify-center">
                        <CheckCircle size={20} className="text-white drop-shadow-md" />
                    </div>
                )}
            </div>
            <span className={`text-[10px] font-bold uppercase truncate w-[76px] text-center ${isActive ? 'text-theme-primary' : 'text-gray-400 group-hover:text-white'}`}>
                {isAll ? 'Tudo' : pack.title}
            </span>
        </button>
      );
  };

  // Modal Ver Todos os Packs
  const AllPacksModal = () => {
      if (!showAllPacksModal) return null;
      return (
          <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex flex-col p-6 animate-fadeIn">
              <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-white">Todos os Packs</h2>
                  <button onClick={() => setShowAllPacksModal(false)} className="bg-white/10 p-2 rounded-full text-white hover:bg-white/20">
                      <X size={24} />
                  </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 overflow-y-auto pb-20">
                  {packs.map(pack => (
                      <div 
                        key={pack.id} 
                        onClick={() => { setActivePack(pack.id); setShowAllPacksModal(false); }}
                        className={`relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer group border-2 ${activePack === pack.id ? 'border-theme-primary' : 'border-transparent hover:border-white/30'}`}
                      >
                          <img src={pack.cover} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-3">
                              <span className="text-white font-bold text-sm">{pack.title}</span>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      );
  };

  const ModalDetails = () => {
    if (!selectedItem) return null;
    const isFav = favorites.has(String(selectedItem.id));

    return (
      <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" onClick={() => setSelectedItem(null)}>
        <div className="bg-theme-sidebar border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-full md:w-1/2 bg-black flex items-center justify-center relative group">
                <img src={selectedItem.url} alt={selectedItem.title} className="max-h-[50vh] md:max-h-full w-full object-contain" />
                <button type="button" onClick={(e) => toggleFavorite(e, selectedItem)} className={`absolute top-4 right-4 p-3 backdrop-blur-md rounded-full transition-all hover:scale-110 shadow-lg border border-white/10 z-50 cursor-pointer ${isFav ? 'bg-red-500 text-white' : 'bg-black/40 text-white hover:bg-white/20'}`}>
                    <Heart size={24} fill={isFav ? "currentColor" : "none"} />
                </button>
            </div>
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col bg-theme-sidebar">
                <div className="flex justify-between items-start mb-6">
                    <h2 className="text-2xl font-bold text-white">{selectedItem.title}</h2>
                    <button type="button" onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-white transition-colors"><X size={28} /></button>
                </div>
                <div className="flex-1 overflow-y-auto mb-6 bg-black/20 rounded-xl p-4 border border-white/5">
                    <p className="text-gray-300 font-mono text-sm leading-relaxed whitespace-pre-wrap">{selectedItem.prompt}</p>
                </div>
                <button type="button" onClick={(e) => copyToClipboard(e, selectedItem.prompt)} className="w-full bg-theme-primary hover:bg-theme-primary/90 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg">
                    <Copy size={18} /> COPIAR PROMPT
                </button>
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 pb-20">
      
      {/* --- CARROSSEL DE PACKS (STORIES) --- */}
      {!onlyFavorites && (
          <div className="mb-10">
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide items-start">
                  {/* Botão TUDO */}
                  <PackStory isAll isActive={activePack === 'all'} />

                  {/* Lista de Packs (Limitado a 6 para não poluir, o resto vai no Ver Todos) */}
                  {packs.slice(0, 6).map(pack => (
                      <PackStory key={pack.id} pack={pack} isActive={activePack === pack.id} />
                  ))}

                  {/* Botão VER TODOS */}
                  <PackStory isViewAll />
              </div>
          </div>
      )}

      <h1 className="text-2xl md:text-3xl font-bold text-white mb-6 pl-2 border-l-4 border-theme-primary flex items-center gap-3">
        {onlyFavorites ? 'Meus Favoritos' : (activePack === 'all' ? 'Galeria de Inspiração' : `Pack: ${packs.find(p => p.id === activePack)?.title || 'Selecionado'}`)}
      </h1>

      {loading ? (
          <div className="flex items-center justify-center h-40 text-theme-primary"><Loader2 size={48} className="animate-spin"/></div>
      ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {prompts.map((item) => {
                    const isLocked = !item.is_free && !hasAccess;
                    const isFav = favorites.has(String(item.id));
                    const imgClasses = `w-full h-full object-cover transition-transform duration-500 ${isLocked ? 'filter brightness-[0.25] blur-[2px]' : 'group-hover:scale-110 group-hover:brightness-50 group-hover:blur-[2px]'}`;

                    return (
                        <div key={item.id} onClick={() => { if (isLocked) window.open(LINK_CHECKOUT, '_blank'); else setSelectedItem(item); }} className={`group relative rounded-xl overflow-hidden bg-white/5 border border-white/5 transition-all duration-300 cursor-pointer aspect-[2/3] ${isLocked ? 'hover:border-theme-primary/50' : ''}`}>
                            {item.url ? <img src={item.url} alt={item.title} className={imgClasses} /> : <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-700"><ImageIcon size={32} /></div>}
                            
                            {!isLocked && (
                                <>
                                    <button type="button" onClick={(e) => toggleFavorite(e, item)} className={`absolute top-3 right-3 p-2 backdrop-blur-md rounded-full transition-all hover:scale-110 shadow-lg z-50 cursor-pointer border border-white/10 ${isFav ? 'bg-red-500 text-white opacity-100' : 'bg-black/30 text-white hover:bg-white/20 opacity-0 group-hover:opacity-100'}`}>
                                        <Heart size={20} fill={isFav ? "currentColor" : "none"} />
                                    </button>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                        <button type="button" onClick={(e) => copyToClipboard(e, item.prompt)} className="px-6 py-2 bg-white/10 backdrop-blur-md rounded-full text-white font-bold hover:bg-theme-primary hover:scale-110 transition-all shadow-lg pointer-events-auto flex items-center gap-2 border border-white/10">
                                            <Copy size={18} /> COPIAR
                                        </button>
                                    </div>
                                </>
                            )}
                            {isLocked && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <Lock size={48} className="text-white/30" strokeWidth={1.5} />
                                    <div className="mt-2 text-[10px] text-white/30 uppercase tracking-[0.2em] font-light">Locked</div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            {prompts.length === 0 && (
                <div className="text-center py-20 text-gray-500 flex flex-col items-center">
                    <p>Nenhum prompt encontrado neste pacote.</p>
                </div>
            )}
          </>
      )}

      <ModalDetails />
      <AllPacksModal />
    </div>
  );
}