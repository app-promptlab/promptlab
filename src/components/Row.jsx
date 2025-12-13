import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Lock, Key } from 'lucide-react';

export default function Row({ title, items = [], isLarge = false, onItemClick }) {
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
      {/* PADDING NO TÍTULO PARA NÃO COLAR NA BORDA */}
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 px-4 md:px-0">
        <span className="w-1 h-6 bg-theme-primary rounded-full inline-block"></span>
        {title}
      </h2>
      
      <div className="relative group/slider">
        <button onClick={() => scroll('left')} className="absolute left-0 top-0 bottom-0 z-40 bg-black/50 hover:bg-black/80 w-10 hidden group-hover/slider:flex items-center justify-center text-white transition-all backdrop-blur-sm rounded-r-lg"><ChevronLeft size={28} /></button>

        {/* PADDING NO CONTAINER DE SCROLL */}
        <div ref={rowRef} className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-4 snap-x px-4 md:px-0">
          {items.map((item) => (
            <div 
              key={item.id} 
              onClick={() => onItemClick && onItemClick(item)}
              className={`
                relative flex-none snap-start transition-all duration-300 hover:scale-95 cursor-pointer overflow-hidden rounded-lg bg-theme-card border border-white/5
                ${isLarge ? 'w-[280px] h-[160px]' : 'w-[140px] h-[210px]'}
              `}
            >
              {/* IMAGEM NÍTIDA (VITRINE) */}
              <img 
                src={item.image || item.url || item.cover} 
                alt={item.title} 
                className="w-full h-full object-cover" // Removido qualquer filtro de blur ou brightness
              />

              {/* OVERLAY DE BLOQUEIO ESTILO VITRINE */}
              {item.is_locked && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    {/* Vinheta suave para garantir contraste do cadeado */}
                    <div className="absolute inset-0 bg-black/20"></div>

                    {/* Ícone Centralizado com Sombra */}
                    <div className="relative z-10 flex flex-col items-center">
                        <Lock 
                            size={isLarge ? 48 : 32} 
                            className="text-white/90 drop-shadow-lg" 
                            strokeWidth={2.5} 
                        />
                         {/* Texto opcional 'Locked' se o card for grande o suficiente */}
                         {isLarge && (
                             <span className="text-[10px] font-bold text-white uppercase tracking-widest mt-2 drop-shadow-md">
                                 Locked
                             </span>
                         )}
                    </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <button onClick={() => scroll('right')} className="absolute right-0 top-0 bottom-0 z-40 bg-black/50 hover:bg-black/80 w-10 hidden group-hover/slider:flex items-center justify-center text-white transition-all backdrop-blur-sm rounded-l-lg"><ChevronRight size={28} /></button>
      </div>
    </div>
  );
}