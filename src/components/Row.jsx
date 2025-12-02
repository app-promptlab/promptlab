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
    <div className="mb-8 group">
      <h2 className="text-xl font-bold text-white mb-4 px-6 md:px-0 flex items-center gap-2">
        <span className="w-1 h-6 bg-blue-600 rounded-full inline-block"></span>
        {title}
      </h2>
      
      <div className="relative group/slider">
        {/* Botão Esquerda */}
        <button 
          onClick={() => scroll('left')} 
          className="absolute left-0 top-0 bottom-0 z-40 bg-black/50 hover:bg-black/80 w-12 hidden group-hover/slider:flex items-center justify-center text-white transition-all backdrop-blur-sm"
        >
          <ChevronLeft size={32} />
        </button>

        {/* Lista Horizontal */}
        <div 
          ref={rowRef}
          className="flex items-center gap-4 overflow-x-auto scrollbar-hide px-6 md:px-0 pb-4 snap-x"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item) => (
            <div 
              key={item.id} 
              className={`
                relative flex-none snap-start transition-all duration-300 hover:scale-105 cursor-pointer border border-gray-800 rounded-lg overflow-hidden
                ${isLarge ? 'w-[300px] h-[170px]' : 'w-[160px] h-[240px]'}
              `}
            >
              {/* Imagem */}
              <img 
                src={item.image || item.url || item.cover || item.thumbnail} 
                alt={item.title}
                className="w-full h-full object-cover"
              />

              {/* Overlay Gradiente */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90">
                <div className="absolute bottom-0 p-3 w-full">
                   <h4 className="text-white font-bold text-sm truncate">{item.title}</h4>
                   {type === 'tutorial' && <div className="flex items-center text-blue-400 text-xs mt-1"><PlayCircle size={12} className="mr-1"/> Assistir</div>}
                </div>
              </div>

              {/* Badge de Bloqueio (Visual Apenas) */}
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
          className="absolute right-0 top-0 bottom-0 z-40 bg-black/50 hover:bg-black/80 w-12 hidden group-hover/slider:flex items-center justify-center text-white transition-all backdrop-blur-sm"
        >
          <ChevronRight size={32} />
        </button>
      </div>
    </div>
  );
}