import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Copy, Heart, Lock, X, Loader2, Image as ImageIcon, Grid, Layers, Users, User } from 'lucide-react';

const LINK_CHECKOUT = "https://pay.kiwify.com.br/hgxpno4"; 

export default function PromptsGallery({ user, showToast, onlyFavorites = false }) {
  const [prompts, setPrompts] = useState([]);
  const [packs, setPacks] = useState([]); 
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const [activePack, setActivePack] = useState('all'); 
  const [genderFilter, setGenderFilter] = useState('all'); 
  const [showAllPacksModal, setShowAllPacksModal] = useState(false); 

  const hasAccess = user?.plan === 'admin' || user?.has_prompts;

  useEffect(() => {
    fetchData();
  }, [user, onlyFavorites, activePack]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (packs.length === 0) {
          const { data: packsData } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
          setPacks(packsData || []);
      }

      let query = supabase
        .from('pack_items')
        .select('*')
        .order('order_index', { ascending: true });

      if (activePack !== 'all') {
          query = query.eq('pack_id', activePack);
      }

      const { data: promptsData, error: promptsError } = await query;
      if (promptsError) throw promptsError;

      const { data: favsData } = await supabase
        .from('user_favorites')
        .select('item_id')
        .eq('user_id', user.id);
      
      const favSet = new Set(favsData?.map(f => String(f.item_id)) || []);
      setFavorites(favSet);

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

  // Lógica de Filtragem Local (Gênero)
  const filteredPrompts = prompts.filter(item => {
      if (genderFilter === 'all') return true;
      return item.gender === genderFilter;
  });

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

  const FilterButton = ({ label, value, icon: Icon }) => (
      <button 
        onClick={() => setGenderFilter(value)}
        className={`
            px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all border
            ${genderFilter === value 
                ? 'bg-theme-primary text-white border-theme-primary shadow-[0_0_10px_rgba(168,85,247,0.4)]' 
                : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'}
        `}
      >
          {Icon && <Icon size={12} />}
          {label}
      </button>
  );

  const PackStory = ({ pack, isAll = false, isViewAll = false, isActive }) => {
      const sizeClasses = "w-20 h-28 md:w-28 md:h-40"; 

      if (isViewAll) {
          return (
            <button onClick={() => setShowAllPacksModal(true)} className="flex flex-col items-center gap-2 min-w-[max-content] cursor-pointer group p-1">
                <div className={`${sizeClasses} rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center bg-white/5 group-hover:bg-white/10 transition-all hover:scale-105`}>
                    <Grid size={24} className="text-gray-400 group-hover:text-white"/>
                </div>
                <span className="text-[10px] text-gray-400 font-bold uppercase truncate w-24 text-center">Ver Todos</span>
            </button>
          );
      }

      return (
        <button 
            onClick={() => setActivePack(isAll ? 'all' : pack.id)}
            className={`flex flex-col items-center gap-2 min-w-[max-content] cursor-pointer group transition-transform duration-300 p-1 ${isActive ? 'scale-105' : 'hover:scale-105'}`}
        >
            <div className={`rounded-xl transition-all duration-300 ${isActive ? 'ring-2 ring-theme-primary ring-offset-2 ring-offset-theme-bg' : ''}`}>
                <div className={`${sizeClasses} rounded-xl overflow-hidden relative bg-gray-900 border ${isActive ? 'border-transparent' : 'border-transparent group-hover:border-white/30'}`}>
                    {isAll ? (
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
                            <Layers size={32} className={isActive ? 'text-theme-primary' : 'text-gray-400'} />
                        </div>
                    ) : (
                        <img src={pack.cover} alt={pack.title} className="w-full h-full object-cover select-none pointer-events-none" draggable="false" onContextMenu={(e) => e.preventDefault()} />
                    )}
                    
                    {isActive && (
                        <div className="absolute inset-0 bg-theme-primary/10 pointer-events-none"></div>
                    )}
                </div>
            </div>
            
            <span className={`text-[10px] font-bold uppercase truncate w-24 text-center transition-colors ${isActive ? 'text-theme-primary' : 'text-gray-400 group-hover:text-white'}`}>
                {isAll ? 'Tudo' : pack.title}
            </span>
        </button>
      );
  };

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
                          <img src={pack.cover} className="w-full h-full object-cover select-none pointer-events-none" draggable="false" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-3">
                              <span className="text-white font-bold text-sm">{pack.title}</span>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      );
  };

  // --- NOVO MODAL CINEMATOGRÁFICO ---
  const ModalDetails = () => {
    if (!selectedItem) return null;
    const isFav = favorites.has(String(selectedItem.id));

    return (
      <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" onClick={() => setSelectedItem(null)}>
        {/* LAYOUT: Mobile=Vertical(max-w-md), Desktop=Horizontal(max-w-6xl + flex-row) */}
        <div 
            className="bg-theme-sidebar border border-white/10 rounded-2xl w-full max-w-md md:max-w-6xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl relative transition-all" 
            onClick={e => e.stopPropagation()}
        >
            <button 
                type="button" 
                onClick={() => setSelectedItem(null)} 
                className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm transition-colors border border-white/10"
            >
                <X size={20} />
            </button>

            {/* ESQUERDA (PC) / TOPO (Mobile) : IMAGEM */}
            <div className="w-full md:w-3/5 bg-black relative flex items-center justify-center overflow-hidden min-h-[40vh] md:min-h-full" onContextMenu={(e) => e.preventDefault()}>
                <img 
                    src={selectedItem.url} 
                    alt={selectedItem.title} 
                    // CORREÇÃO: object-contain garante que a imagem NUNCA será cortada
                    className="w-full h-full object-contain select-none max-h-[50vh] md:max-h-full" 
                    draggable="false" 
                    onContextMenu={(e) => e.preventDefault()}
                />
            </div>

            {/* DIREITA (PC) / BAIXO (Mobile) : CONTEÚDO */}
            <div className="w-full md:w-2/5 p-6 md:p-8 bg-theme-sidebar border-t md:border-t-0 md:border-l border-white/10 flex flex-col gap-4 md:gap-6 overflow-y-auto">
                <h2 className="text-xl md:text-2xl font-bold text-white md:mt-4 text-center md:text-left">{selectedItem.title}</h2>
                
                {/* Caixa de Prompt */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex-1 min-h-[120px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                    <p className="text-gray-300 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                        {selectedItem.prompt}
                    </p>
                </div>

                {/* Botões de Ação */}
                <div className="flex flex-col gap-3 mt-auto">
                    <button 
                        type="button"
                        onClick={(e) => copyToClipboard(e, selectedItem.prompt)}
                        className="w-full bg-theme-primary hover:bg-theme-primary/90 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-theme-primary/20"
                    >
                        <Copy size={20} /> COPIAR PROMPT
                    </button>
                    
                    <button 
                        type="button"
                        onClick={(e) => toggleFavorite(e, selectedItem)}
                        className={`w-full py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${isFav ? 'text-red-500 hover:bg-red-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <Heart size={20} fill={isFav ? "currentColor" : "none"} />
                        {isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                    </button>
                </div>
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 pb-20">
      
      {/* --- CARROSSEL DE PACKS --- */}
      {!onlyFavorites && (
          <div className="mb-0"> 
              <h2 className="text-white font-bold text-lg mb-0 pl-1">Packs</h2>
              <div className="flex gap-2 overflow-x-auto px-4 pt-4 pb-2 scrollbar-hide items-start"> 
                  <PackStory isAll isActive={activePack === 'all'} />
                  {packs.slice(0, 6).map(pack => (
                      <PackStory key={pack.id} pack={pack} isActive={activePack === pack.id} />
                  ))}
                  <PackStory isViewAll />
              </div>
          </div>
      )}

      {/* CABEÇALHO COM TÍTULO E FILTROS */}
      <div className="mb-4 pl-2 border-l-4 border-theme-primary">
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            {onlyFavorites ? 'Meus Favoritos' : (activePack === 'all' ? 'Prompts' : `Pack: ${packs.find(p => p.id === activePack)?.title || 'Selecionado'}`)}
          </h1>
          
          {/* BARRA DE FILTROS DE GÊNERO */}
          {!onlyFavorites && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
                  <FilterButton label="Todos" value="all" icon={Layers} />
                  <FilterButton label="Elas" value="female" icon={User} />
                  <FilterButton label="Eles" value="male" icon={User} />
                  <FilterButton label="Casais" value="couple" icon={Users} />
              </div>
          )}
      </div>

      {loading ? (
          <div className="flex items-center justify-center h-40 text-theme-primary"><Loader2 size={48} className="animate-spin"/></div>
      ) : (
          <>
            {/* Grade Compacta */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                {filteredPrompts.map((item) => {
                    const isLocked = !item.is_free && !hasAccess;
                    const isFav = favorites.has(String(item.id));
                    const imgClasses = `w-full h-full object-cover transition-transform duration-500 ${isLocked ? 'filter brightness-[0.25] blur-[2px]' : 'group-hover:scale-110 group-hover:brightness-50 group-hover:blur-[2px]'}`;

                    return (
                        <div 
                            key={item.id} 
                            onClick={() => { if (isLocked) window.open(LINK_CHECKOUT, '_blank'); else setSelectedItem(item); }} 
                            onContextMenu={(e) => e.preventDefault()} 
                            className={`group relative rounded-xl overflow-hidden bg-white/5 border border-white/5 transition-all duration-300 cursor-pointer aspect-[2/3] ${isLocked ? 'hover:border-theme-primary/50' : ''}`}
                        >
                            {item.url ? (
                                <img 
                                    src={item.url} 
                                    alt={item.title} 
                                    className={`${imgClasses} pointer-events-none select-none`} 
                                    draggable="false"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-700"><ImageIcon size={32} /></div>
                            )}
                            
                            {!isLocked && (
                                <>
                                    <button type="button" onClick={(e) => toggleFavorite(e, item)} className={`absolute top-2 right-2 p-2 backdrop-blur-md rounded-full transition-all hover:scale-110 shadow-lg z-30 cursor-pointer border border-white/10 ${isFav ? 'bg-red-500 text-white opacity-100' : 'bg-black/30 text-white hover:bg-white/20 opacity-0 group-hover:opacity-100'}`}>
                                        <Heart size={18} fill={isFav ? "currentColor" : "none"} />
                                    </button>
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
            {filteredPrompts.length === 0 && (
                <div className="text-center py-20 text-gray-500 flex flex-col items-center">
                    <p>Nenhum prompt encontrado para este filtro.</p>
                </div>
            )}
          </>
      )}

      <ModalDetails />
      <AllPacksModal />
    </div>
  );
}