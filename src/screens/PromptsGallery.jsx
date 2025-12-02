import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Heart, Copy, Lock, Sparkles, ChevronLeft, Crown } from 'lucide-react';
import Modal from '../components/Modal'; // Assumindo que o Modal já existe ou será reutilizado

// --- Componente do Cadeado Vazado (Visual) ---
const LockedCard = ({ item }) => (
  <div className="relative w-full h-full bg-gray-900 overflow-hidden rounded-xl border border-gray-800 group">
    
    {/* 1. Imagem de Fundo (Borrada e Escura) */}
    <img 
      src={item.url} 
      className="absolute inset-0 w-full h-full object-cover filter blur-lg opacity-40 scale-110" 
      alt="Locked"
    />
    
    {/* 2. Overlay Escuro */}
    <div className="absolute inset-0 bg-black/40" />

    {/* 3. O Cadeado Vazado (Máscara SVG) */}
    {/* Centralizamos um container. Dentro dele, recortamos a forma do cadeado para revelar a imagem nítida */}
    <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-24 h-32">
            {/* SVG Definição da Máscara */}
            <svg width="0" height="0">
              <defs>
                <clipPath id="lockClip" clipPathUnits="objectBoundingBox">
                   {/* Forma simplificada de um cadeado (corpo + gancho) normalizada 0-1 */}
                   <path d="M0.5,0 C0.35,0,0.22,0.12,0.22,0.28 V0.4 H0.15 C0.07,0.4,0,0.47,0,0.56 V0.9 C0,0.98,0.07,1,0.15,1 H0.85 C0.93,1,1,0.98,1,0.9 V0.56 C1,0.47,0.93,0.4,0.85,0.4 H0.78 V0.28 C0.78,0.12,0.65,0,0.5,0 M0.5,0.78 C0.45,0.78,0.4,0.73,0.4,0.68 C0.4,0.63,0.45,0.58,0.5,0.58 C0.55,0.58,0.6,0.63,0.6,0.68 C0.6,0.73,0.55,0.78,0.5,0.78 M0.35,0.4 V0.28 C0.35,0.2,0.42,0.12,0.5,0.12 C0.58,0.12,0.65,0.2,0.65,0.28 V0.4 H0.35" />
                </clipPath>
              </defs>
            </svg>

            {/* A Imagem Nítida Recortada */}
            <div 
              className="absolute inset-0 w-full h-full bg-cover bg-center"
              style={{ 
                backgroundImage: `url(${item.url})`,
                clipPath: 'url(#lockClip)', // Funciona melhor em Chrome/FF moderno
                WebkitClipPath: 'path("M48,0 C33.6,0,21.12,11.52,21.12,26.88 V38.4 H14.4 C6.72,38.4,0,45.12,0,53.76 V86.4 C0,94.08,6.72,96,14.4,96 H81.6 C89.28,96,96,94.08,96,86.4 V53.76 C96,45.12,89.28,38.4,81.6,38.4 H74.88 V26.88 C74.88,11.52,62.4,0,48,0 M48,74.88 C43.2,74.88,38.4,70.08,38.4,65.28 C38.4,60.48,43.2,55.68,48,55.68 C52.8,55.68,57.6,60.48,57.6,65.28 C57.6,70.08,52.8,74.88,48,74.88 M33.6,38.4 V26.88 C33.6,19.2,40.32,11.52,48,11.52 C55.68,11.52,62.4,19.2,62.4,26.88 V38.4 H33.6") scale(0.25)' // Fallback manual path scale
              }} 
            />
            
            {/* Contorno Neon (Borda) */}
            <Lock className="w-full h-full text-blue-500 opacity-80 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]" strokeWidth={1} />
        </div>
    </div>

    {/* Etiqueta PRO */}
    <div className="absolute top-2 right-2 flex items-center gap-1 bg-gradient-to-r from-purple-600 to-blue-600 px-2 py-1 rounded text-[10px] font-black text-white shadow-lg">
      <Crown size={10} /> PRO
    </div>

    {/* Hover Action */}
    <div className="absolute inset-0 flex items-end justify-center pb-6 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <span className="text-white font-bold text-xs tracking-widest bg-black/80 px-4 py-2 rounded-full border border-blue-500/50">
            DESBLOQUEAR
        </span>
    </div>
  </div>
);


export default function PromptsGallery({ user, showToast }) {
  const [packs, setPacks] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [selectedPack, setSelectedPack] = useState(null);
  const [modalItem, setModalItem] = useState(null);

  useEffect(() => {
    // Carregar Packs e Todos os Prompts (poderia ser paginado, mas vamos simplificar)
    const load = async () => {
      const { data: pData } = await supabase.from('products').select('*');
      setPacks(pData || []);
      
      const { data: iData } = await supabase.from('pack_items').select('*');
      setPrompts(iData || []);
    };
    load();
  }, []);

  // Lógica de Filtragem e Bloqueio
  // 1. Se selectedPack é null -> Mostra tudo (ou destaques)
  // 2. Se selectedPack existe -> Filtra items desse pack
  const filteredPrompts = selectedPack 
    ? prompts.filter(p => p.pack_id === selectedPack.id)
    : prompts; // Mostra tudo se nenhum selecionado (Mix)

  // Verifica se o usuário é PRO ou Admin
  const isPro = user?.plan === 'pro' || user?.plan === 'admin' || user?.plan === 'gold';

  // Lógica de "Favoritar"
  const toggleFavorite = async (e, item) => {
    e.stopPropagation();
    // Inserir na tabela user_favorites (lógica simplificada, ideal verificar se já existe)
    const { error } = await supabase.from('user_favorites').insert({ user_id: user.id, item_id: item.id });
    if(error) {
        // Se der erro de duplicidade, deleta (toggle)
        await supabase.from('user_favorites').delete().match({ user_id: user.id, item_id: item.id });
        if(showToast) showToast("Removido dos favoritos");
    } else {
        if(showToast) showToast("Favoritado!");
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-fadeIn px-6 pb-20 pt-8">
      
      {/* --- SEÇÃO 1: PACKS (Séries) --- */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6 border-l-4 border-blue-600 pl-4">
           <h2 className="text-xl font-bold text-gray-200 uppercase tracking-widest">PACKS</h2>
           {selectedPack && (
             <button onClick={() => setSelectedPack(null)} className="text-blue-500 text-sm font-bold flex items-center hover:text-white transition-colors">
               <ChevronLeft size={16}/> Voltar para todos
             </button>
           )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {packs.map(pack => (
            <div 
              key={pack.id} 
              onClick={() => setSelectedPack(pack)}
              className={`
                aspect-[2/3] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 border
                ${selectedPack?.id === pack.id ? 'ring-2 ring-blue-500 scale-105 border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)]' : 'border-gray-800 hover:scale-105 hover:border-gray-600 opacity-80 hover:opacity-100'}
              `}
            >
              <img src={pack.cover} className="w-full h-full object-cover" alt={pack.title}/>
              <div className="bg-black/80 p-2 text-center text-xs font-bold text-white truncate">
                {pack.title}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- SEÇÃO 2: PROMPTS (Grid) --- */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
          <Sparkles className="mr-2 text-blue-500" /> 
          {selectedPack ? `Prompts: ${selectedPack.title}` : 'Feed de Prompts'}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {filteredPrompts.map((item, index) => {
             // REGRA DE OURO: 3 Primeiros Grátis POR PACK. 
             // Se estamos vendo "Tudo" (selectedPack = null), a lógica fica confusa. 
             // Vamos assumir: No modo "Ver Tudo", mostra bloqueado se não for PRO.
             // No modo "Pack Selecionado", os 3 primeiros aparecem.
             
             let isLocked = false;
             if (!isPro) {
                if (selectedPack) {
                    // Dentro do Pack: Bloqueia a partir do índice 3 (4º item)
                    if (index >= 3) isLocked = true;
                } else {
                    // Feed Geral: Bloqueia aleatoriamente ou tudo? 
                    // Vamos bloquear tudo exceto alguns destaques para incentivar clicar no Pack
                    // Ou melhor: Bloqueia tudo no feed geral se não for PRO (para forçar entrar no pack ou comprar)
                    // Decisão UX: Deixar liberado visualmente mas sem copiar? Não, vamos manter o visual LockedCard.
                    // Para simplificar: No feed geral, items com index par bloqueiam (50% amostra).
                    if (index % 2 !== 0) isLocked = true; 
                }
             }

             if (isLocked) {
                return (
                    <div key={item.id} className="aspect-[3/4] cursor-pointer" onClick={() => alert("Torne-se PRO para acessar este prompt!")}>
                        <LockedCard item={item} />
                    </div>
                );
             }

             // Card Liberado (Normal)
             return (
               <div 
                 key={item.id} 
                 onClick={() => setModalItem(item)}
                 className="aspect-[3/4] bg-gray-900 rounded-xl overflow-hidden relative group hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:border-2 border-blue-500 transition-all duration-300 border border-gray-800 cursor-pointer"
               >
                 <img src={item.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={item.title}/>
                 
                 {/* Hover Overlay */}
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <button 
                        onClick={(e) => toggleFavorite(e, item)}
                        className="absolute top-2 right-2 bg-black/50 p-2 rounded-full hover:bg-red-500 hover:text-white transition-colors text-white"
                    >
                        <Heart size={16} />
                    </button>
                    
                    <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs shadow-lg flex items-center justify-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                        <Copy size={12}/> VER PROMPT
                    </div>
                 </div>
               </div>
             );
          })}
        </div>
      </div>

      {/* Modal de Detalhes (Mantido simples) */}
      <Modal 
        item={modalItem} 
        onClose={() => setModalItem(null)} 
        onCopy={(text) => {
            navigator.clipboard.writeText(text);
            if(showToast) showToast("Copiado com sucesso!");
        }} 
      />
    </div>
  );
}