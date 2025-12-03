import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Heart, Copy, Sparkles, ChevronLeft, Crown, Check } from 'lucide-react';
import Modal from '../components/Modal';
import DynamicPage from '../components/DynamicPage';

const LockedCard = ({ item }) => (
  <div className="relative w-full h-full overflow-hidden rounded-xl bg-black/50 group">
    <img src={item.url} className="absolute inset-0 w-full h-full object-cover filter blur-lg opacity-40 scale-110" alt="Locked"/>
    <div className="absolute inset-0 bg-black/40" />
    <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-24 h-32">
            <svg width="0" height="0"><defs><clipPath id="lockClip" clipPathUnits="objectBoundingBox"><path d="M0.5,0 C0.35,0,0.22,0.12,0.22,0.28 V0.4 H0.15 C0.07,0.4,0,0.47,0,0.56 V0.9 C0,0.98,0.07,1,0.15,1 H0.85 C0.93,1,1,0.98,1,0.9 V0.56 C1,0.47,0.93,0.4,0.85,0.4 H0.78 V0.28 C0.78,0.12,0.65,0,0.5,0 M0.35,0.4 V0.28 C0.35,0.2,0.42,0.12,0.5,0.12 C0.58,0.12,0.65,0.2,0.65,0.28 V0.4 H0.35" /></clipPath></defs></svg>
            <div className="absolute inset-0 w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${item.url})`, clipPath: 'url(#lockClip)', WebkitClipPath: 'path("M48,0 C33.6,0,21.12,11.52,21.12,26.88 V38.4 H14.4 C6.72,38.4,0,45.12,0,53.76 V86.4 C0,94.08,6.72,96,14.4,96 H81.6 C89.28,96,96,94.08,96,86.4 V53.76 C96,45.12,89.28,38.4,81.6,38.4 H74.88 V26.88 C74.88,11.52,62.4,0,48,0 M33.6,38.4 V26.88 C33.6,19.2,40.32,11.52,48,11.52 C55.68,11.52,62.4,19.2,62.4,26.88 V38.4 H33.6") scale(0.25)' }} />
        </div>
    </div>
    <div className="absolute top-2 right-2 flex items-center gap-1 bg-gradient-to-r from-purple-600 to-blue-600 px-2 py-1 rounded text-[10px] font-black text-white shadow-lg"><Crown size={10} /> PRO</div>
  </div>
);

export default function PromptsGallery({ user, showToast, onlyFavorites = false }) {
  const [packs, setPacks] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [selectedPack, setSelectedPack] = useState(null);
  const [modalItem, setModalItem] = useState(null);
  const [likedIds, setLikedIds] = useState(new Set());
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const load = async () => {
      const { data: pData } = await supabase.from('products').select('*');
      setPacks(pData || []);
      const { data: iData } = await supabase.from('pack_items').select('*').order('order_index', { ascending: true });
      setPrompts(iData || []);
      if (user) {
        const { data: favData } = await supabase.from('user_favorites').select('item_id').eq('user_id', user.id);
        setLikedIds(new Set(favData?.map(f => f.item_id)));
      }
    };
    load();
  }, [user]);

  const toggleFavorite = async (e, item) => {
    e.stopPropagation();
    const isLiked = likedIds.has(item.id);
    const newSet = new Set(likedIds);
    if (isLiked) newSet.delete(item.id); else newSet.add(item.id);
    setLikedIds(newSet);
    if (isLiked) { await supabase.from('user_favorites').delete().match({ user_id: user.id, item_id: item.id }); if(showToast) showToast("Removido!"); } 
    else { await supabase.from('user_favorites').insert({ user_id: user.id, item_id: item.id }); if(showToast) showToast("Favoritado!"); }
  };

  const handleCopy = (e, item) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.prompt);
    setCopiedId(item.id);
    if(showToast) showToast("Prompt copiado!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  let filteredPrompts = prompts;
  if (onlyFavorites) filteredPrompts = prompts.filter(p => likedIds.has(p.id));
  else if (selectedPack) filteredPrompts = prompts.filter(p => p.pack_id === selectedPack.id);

  const isPro = user?.plan === 'pro' || user?.plan === 'admin';

  const Content = (
    <div className="max-w-[1600px] mx-auto px-4 pb-20 pt-8">
      {!onlyFavorites && (
        <div className="mb-10">
            <div className="flex items-center justify-between mb-4 border-l-4 border-blue-600 pl-4">
            <h2 className="text-xl font-bold text-gray-200 uppercase tracking-widest">PACKS</h2>
            {selectedPack && (<button onClick={() => setSelectedPack(null)} className="text-blue-500 text-sm font-bold flex items-center hover:text-white transition-colors"><ChevronLeft size={16}/> Voltar para todos</button>)}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {packs.map(pack => (
                <div key={pack.id} onClick={() => setSelectedPack(pack)} className={`aspect-[2/3] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 relative group ${selectedPack?.id === pack.id ? 'ring-2 ring-blue-500 scale-95' : 'hover:scale-95 opacity-90 hover:opacity-100'}`}>
                <img src={pack.cover} className="w-full h-full object-cover" alt={pack.title}/>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-2 inset-x-2 text-center text-xs font-bold text-white truncate drop-shadow-md">{pack.title}</div>
                </div>
            ))}
            </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">{onlyFavorites ? 'Meus Favoritos' : (selectedPack ? selectedPack.title : 'Feed de Prompts')}</h2>
        {filteredPrompts.length === 0 && onlyFavorites && <div className="text-gray-500 text-center">Nenhum favorito.</div>}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {filteredPrompts.map((item, index) => {
             let isLocked = false;
             if (!isPro && !onlyFavorites) { if (selectedPack) { if (index >= 3) isLocked = true; } else { if (index % 2 !== 0) isLocked = true; } }
             if (onlyFavorites) isLocked = false; 
             if (isLocked) return <div key={item.id} className="aspect-[3/4] cursor-pointer" onClick={() => alert("Assine o PRO!")}><LockedCard item={item} /></div>;
             
             const isLiked = likedIds.has(item.id);
             return (
               <div key={item.id} onClick={() => setModalItem(item)} className="aspect-[3/4] rounded-xl overflow-hidden relative group cursor-pointer bg-black">
                 <img src={item.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={item.title}/>
                 <button onClick={(e) => toggleFavorite(e, item)} className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-300 z-20 ${isLiked ? 'bg-black/50 text-red-500 scale-110' : 'text-white opacity-0 group-hover:opacity-100 hover:text-red-500'}`}><Heart size={20} fill={isLiked ? "currentColor" : "none"} /></button>
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                    <button onClick={(e) => handleCopy(e, item)} className={`flex items-center justify-center gap-2 text-white font-bold text-xs tracking-wider py-2 rounded-lg transition-colors ${copiedId === item.id ? 'bg-green-600' : 'hover:bg-white/20'}`}>
                        {copiedId === item.id ? <Check size={14}/> : <Copy size={14}/>} {copiedId === item.id ? 'COPIADO' : 'COPIAR'}
                    </button>
                 </div>
               </div>
             );
          })}
        </div>
      </div>
      <Modal item={modalItem} onClose={() => setModalItem(null)} onCopy={(text) => { navigator.clipboard.writeText(text); if(showToast) showToast("Copiado!"); }} />
    </div>
  );

  if (onlyFavorites) return Content;
  return <DynamicPage pageId="prompts" user={user}>{Content}</DynamicPage>;
}