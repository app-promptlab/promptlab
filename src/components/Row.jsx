import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Lock, Key, Heart, Eye } from 'lucide-react';

export default function Row({ title, items = [], isLarge = false, onItemClick, onFavorite }) {
  const rowRef = useRef(null);

  const scroll = (direction) => {
    const { current } = rowRef;
    if (current) {
      current.scrollBy({ left: direction === 'left' ? -300 : 300, behavior: 'smooth' });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="mb-8 group">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 px-4 md:px-0">
        <span className="w-1 h-6 bg-theme-primary rounded-full inline-block"></span>
        {title}
      </h2>
      
      <div className="relative group/slider">
        <button onClick={() => scroll('left')} className="absolute left-0 top-0 bottom-0 z-40 bg-black/50 hover:bg-black/80 w-10 hidden group-hover/slider:flex items-center justify-center text-white transition-all backdrop-blur-sm rounded-r-lg"><ChevronLeft size={28} /></button>

        <div ref={rowRef} className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-4 snap-x px-4 md:px-0">
          {items.map((item) => (
            <div 
              key={item.id} 
              onClick={() => onItemClick && onItemClick(item)}
              onContextMenu={(e) => e.preventDefault()}
              className={`
                relative flex-none snap-start transition-all duration-300 cursor-pointer overflow-hidden rounded-lg bg-theme-card border border-white/5 group
                ${isLarge ? 'w-[280px] h-[160px]' : 'w-[140px] h-[210px]'}
                ${item.is_locked ? 'hover:border-theme-primary hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]' : ''}
              `}
            >
              {/* IMAGEM BLINDADA COM EFEITOS DE HOVER */}
              <img 
                src={item.image || item.url || item.cover} 
                alt={item.title} 
                draggable="false"
                onContextMenu={(e) => e.preventDefault()}
                className={`w-full h-full object-cover select-none transition-all duration-500
                  ${!item.is_locked && !isLarge ? 'group-hover:scale-110 group-hover:brightness-50 group-hover:blur-[2px]' : ''}
                `}
              />

              {/* === ESTADO BLOQUEADO (PRO) === */}
              {item.is_locked && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-all group-hover:scale-110">
                    <div className="absolute inset-0 bg-black/20"></div>

                    <div className="relative z-10">
                        {/* Cadeado Branco (some no hover) */}
                        <Lock size={isLarge ? 48 : 32} className="text-white/90 drop-shadow-lg group-hover:opacity-0 transition-opacity absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2" strokeWidth={2.5} />
                        
                        {/* Chave Roxa (aparece no hover) */}
                        <Key size={isLarge ? 48 : 32} className="text-theme-primary drop-shadow-lg opacity-0 group-hover:opacity-100 transition-opacity absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2" strokeWidth={2.5} />
                    </div>
                     
                     <div className="mt-10 md:mt-14 flex flex-col items-center z-10">
                         {/* Texto Locked (some no hover) */}
                         <span className="text-[10px] font-bold text-white uppercase tracking-widest mt-2 drop-shadow-md group-hover:hidden">Locked</span>
                         
                         {/* Texto DESBLOQUEAR (aparece no hover piscando) */}
                         <span className="text-[10px] text-theme-primary font-bold uppercase tracking-widest hidden group-hover:block animate-pulse drop-shadow-md mt-2">DESBLOQUEAR</span>
                     </div>
                </div>
              )}

              {/* === ESTADO LIBERADO (HOVER INTERATIVO) === */}
              {!item.is_locked && !isLarge && (
                <>
                    {/* Botão de Favoritar (Coração) */}
                    <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); onFavorite && onFavorite(item); }} 
                        className={`absolute top-2 right-2 p-1.5 backdrop-blur-md rounded-full transition-all hover:scale-110 shadow-lg z-30 cursor-pointer border border-white/10 
                        ${item.is_liked ? 'bg-red-500 text-white opacity-100' : 'bg-black/30 text-white hover:bg-white/20 opacity-0 group-hover:opacity-100'}`}
                    >
                        <Heart size={14} fill={item.is_liked ? "currentColor" : "none"} />
                    </button>

                    {/* Ícone de Olho + Abrir (Centro) */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <div className="flex flex-col items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            <Eye size={32} className="text-white drop-shadow-lg" />
                            <span className="text-white font-bold text-[10px] tracking-widest drop-shadow-lg">ABRIR</span>
                        </div>
                    </div>
                </>
              )}
            </div>
          ))}
        </div>

        <button onClick={() => scroll('right')} className="absolute right-0 top-0 bottom-0 z-40 bg-black/50 hover:bg-black/80 w-10 hidden group-hover/slider:flex items-center justify-center text-white transition-all backdrop-blur-sm rounded-l-lg"><ChevronRight size={28} /></button>
      </div>
    </div>
  );
}