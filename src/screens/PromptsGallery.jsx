import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Heart, Copy, Lock, Sparkles, ChevronLeft, Crown } from 'lucide-react';
import Modal from '../components/Modal';

// --- 1. Componente Visual do Bloqueio (O Cadeado Vazado) ---
const LockedCard = ({ item }) => (
  <div className="relative w-full h-full overflow-hidden rounded-xl bg-black/50 group">
    {/* Imagem de Fundo (Com Blur e Escura) */}
    <img 
      src={item.url} 
      className="absolute inset-0 w-full h-full object-cover filter blur-lg opacity-40 scale-110" 
      alt="Locked"
    />
    <div className="absolute inset-0 bg-black/40" />

    {/* O Recorte do Cadeado (Máscara SVG) */}
    <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-24 h-32">
            <svg width="0" height="0">
              <defs>
                <clipPath id="lockClip" clipPathUnits="objectBoundingBox">
                   <path d="M0.5,0 C0.35,0,0.22,0.12,0.22,0.28 V0.4 H0.15 C0.07,0.4,0,0.47,0,0.56 V0.9 C0,0.98,0.07,1,0.15,1 H0.85 C0.93,1,1,0.98,1,0.9 V0.56 C1,0.47,0.93,0.4,0.85,0.4 H0.78 V0.28 C0.78,0.12,0.65,0,0.5,0 M0.5,0.78 C0.45,0.78,0.4,0.73,0.4,0.68 C0.4,0.63,0.45,0.58,0.5,0.58 C0.55,0.58,0.6,0.63,0.6,0.68 C0.6,0.73,0.55,0.78,0.5,0.78 M0.35,0.4 V0.28 C0.35,0.2,0.42,0.12,0.5,0.12 C0.58,0.12,0.65,0.2,0.65,0.28 V0.4 H0.35" />
                </clipPath>
              </defs>
            </svg>
            
            {/* A Imagem Nítida que aparece DENTRO do cadeado */}
            <div 
              className="absolute inset-0 w-full h-full bg-cover bg-center"
              style={{ 
                backgroundImage: `url(${item.url})`,
                clipPath: 'url(#lockClip)', 
                WebkitClipPath: 'path("M48,0 C33.6,0,21.12,11.52,21.12,26.88 V38.4 H14.4 C6.72,38.4,0,45.12,0,53.76 V86.4 C0,94.08,6.72,96,14.4,96 H81.6 C89.28,96,96,94.08,96,86.4 V53.76 C96,45.12,89.28,38.4,81.6,38.4 H74.88 V26.88 C74.88,11.52,62.4,0,48,0 M48,74.88 C43.2,74.88,38.4,70.08,38.4,65.28 C38.4,60.48,43.2,55.68,48,55.68 C52.8,55.68,57.6,60.48,57.6,65.28 C57.6,70.08,52.8,74.88,48,74.88 M33.6,38.4 V26.88 C33.6,19.2,40.32,11.52,48,11.52 C55.68,11.52,62.4,19.2,62.4,26.88 V38.4 H33.6") scale(0.25)' 
              }} 
            />
            
            {/* Contorno Neon */}
            <Lock className="w-full h-full text-blue-500 opacity-80 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]" strokeWidth={1} />
        </div>
    </div>

    {/* Etiqueta PRO */}
    <div className="absolute top-2 right-2 flex items-center gap-1 bg-gradient-to-r from-purple-600 to-blue-600 px-2 py-1 rounded text-[10px] font-black text-white shadow-lg">
      <Crown size={10} /> PRO
    </div>
  </div>
);

// --- 2. Componente Principal ---
export default function PromptsGallery({ user, showToast }) {
  const [packs, setPacks] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [selectedPack, setSelectedPack] = useState(null);
  const [modalItem, setModalItem] = useState(null);

  // Carrega dados do Supabase
  useEffect(() => {
    const load = async () => {
      const { data: pData } = await supabase.from('products').select('*');
      setPacks(pData || []);
      const { data: iData } = await supabase.from('pack_items').select('*');
      setPrompts(iData || []);
    };
    load();
  }, []);

  // Lógica de Filtro
  const filteredPrompts = selectedPack ? prompts.filter(p => p.pack_id === selectedPack.id) : prompts;
  
  // Verifica Plano
  const isPro = user?.plan === 'pro' || user?.plan === 'admin' || user?.plan === 'gold';

  // Lógica Favoritar
  const toggleFavorite = async (e, item) => {
    e.stopPropagation();
    const { error } = await supabase.from('user_favorites').insert({ user_id: user.id, item_id: item.id });
    if(error) {
        await supabase.from('user_favorites').delete().match({ user_id: user.id, item_id: item.id });
        if(showToast) showToast("Removido dos favoritos");
    } else {
        if(showToast) showToast("Favoritado!");
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto animate-fadeIn px-4 pb-20 pt-8">
      
      {/* SEÇÃO 1: PACKS (Carrossel/Grid de Cima) */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4 border-l-4 border-blue-600 pl-4">
           <h2 className="text-xl font-bold text-gray-200 uppercase tracking-widest">PACKS</h2>
           {selectedPack && (
             <button onClick={() => setSelectedPack(null)} className="text-blue-500 text-sm font-bold flex items-center hover:text-white transition-colors">
               <ChevronLeft size={16}/> Voltar para todos
             </button>
           )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {packs.map(pack => (
            <div 
              key={pack.id} 
              onClick={() => setSelectedPack(pack)}
              className={`
                aspect-[2/3] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 relative group
                ${selectedPack?.id === pack.id ? 'ring-2 ring-blue-500 scale-95' : 'hover:scale-95 opacity-90 hover:opacity-100'}
              `}
            >
              <img src={pack.cover} className="w-full h-full object-cover" alt={pack.title}/>
              {/* Sombra no título */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-2 inset-x-2 text-center text-xs font-bold text-white truncate drop-shadow-md">
                {pack.title}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SEÇÃO 2: FEED DE PROMPTS (Ajustado sem bordas e gap-2) */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Sparkles className="mr-2 text-blue-500" size={20} /> 
          {selectedPack ? selectedPack.title : 'Feed de Prompts'}
        </h2>

        {/* Grid "colado" (gap-2) e sem bordas extras */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {filteredPrompts.map((item, index) => {
             // Lógica de Bloqueio (3 Grátis por Pack)
             let isLocked = false;
             if (!isPro) {
                if (selectedPack) { 
                    // Dentro do Pack: A partir do 4º item (index 3) bloqueia
                    if (index >= 3) isLocked = true; 
                } else { 
                    // Feed Geral: Bloqueia aleatoriamente (pares) para incentivar upgrade
                    if (index % 2 !== 0) isLocked = true; 
                }
             }

             // Renderiza Bloqueado
             if (isLocked) {
                return (
                    <div key={item.id} className="aspect-[3/4] cursor-pointer" onClick={() => alert("Conteúdo exclusivo PRO. Assine para liberar!")}>
                        <LockedCard item={item} />
                    </div>
                );
             }

             // Renderiza Liberado (Limpo, sem bordas, fundo preto puro)
             return (
               <div 
                 key={item.id} 
                 onClick={() => setModalItem(item)}
                 className="aspect-[3/4] rounded-xl overflow-hidden relative group cursor-pointer bg-black"
               >
                 <img src={item.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={item.title}/>
                 
                 {/* Overlay Hover - Só aparece ao passar o mouse */}
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                    <button 
                        onClick={(e) => toggleFavorite(e, item)} 
                        className="absolute top-2 right-2 text-white hover:text-red-500 transition-colors drop-shadow-md"
                    >
                        <Heart size={20} />
                    </button>
                    
                    <div className="flex items-center justify-center gap-2 text-white font-bold text-xs tracking-wider">
                        <Copy size={12}/> VER
                    </div>
                 </div>
               </div>
             );
          })}
        </div>
      </div>

      {/* Modal para ver os detalhes */}
      <Modal 
        item={modalItem} 
        onClose={() => setModalItem(null)} 
        onCopy={(text) => { 
            navigator.clipboard.writeText(text); 
            if(showToast) showToast("Copiado!"); 
        }} 
      />
    </div>
  );
}