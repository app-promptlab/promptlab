import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Lock, PlayCircle } from 'lucide-react';

export default function Row({ title, items = [], isLarge = false, type = 'prompt' }) {
  const rowRef = useRef(null);

  const scroll = (direction) => {
    const { current } = rowRef;
    if (current) {
      current.scrollBy({ left: direction === 'left' ? -300 : 300, behavior: 'smooth' });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="mb-8 group px-4 md:px-0">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-blue-600 rounded-full inline-block"></span>
        {title}
      </h2>
      
      <div className="relative group/slider">
        {/* Botão Esquerda */}
        <button 
          onClick={() => scroll('left')} 
          className="absolute left-0 top-0 bottom-0 z-40 bg-black/50 hover:bg-black/80 w-10 hidden group-hover/slider:flex items-center justify-center text-white transition-all backdrop-blur-sm rounded-r-lg"
        >
          <ChevronLeft size={28} />
        </button>

        {/* Lista Horizontal */}
        <div 
          ref={rowRef}
          // Alteração: gap-2 (antes era gap-4) e scrollbar escondida
          className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-4 snap-x"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item) => (
            <div 
              key={item.id} 
              // Alteração: border removida, rounded-lg mantido, largura ajustada
              className={`
                relative flex-none snap-start transition-all duration-300 hover:scale-95 cursor-pointer overflow-hidden rounded-lg bg-gray-900
                ${isLarge ? 'w-[280px] h-[160px]' : 'w-[140px] h-[210px]'}
              `}
            >
              {/* Imagem */}
              <img 
                src={item.image || item.url || item.cover || item.thumbnail} 
                alt={item.title}
                className="w-full h-full object-cover"
              />

              {/* Título Removido Visualmente (apenas gradiente leve para profundidade) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Badge de Bloqueio */}
              {item.is_locked && (
                <div className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full backdrop-blur-md">
                   <Lock size={12} className="text-white"/>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Botão Direita */}
        <button 
          onClick={() => scroll('right')} 
          className="absolute right-0 top-0 bottom-0 z-40 bg-black/50 hover:bg-black/80 w-10 hidden group-hover/slider:flex items-center justify-center text-white transition-all backdrop-blur-sm rounded-l-lg"
        >
          <ChevronRight size={28} />
        </button>
      </div>
    </div>
  );
}