import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';

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
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-theme-primary rounded-full inline-block"></span>
        {title}
      </h2>
      
      <div className="relative group/slider">
        <button onClick={() => scroll('left')} className="absolute left-0 top-0 bottom-0 z-40 bg-black/50 hover:bg-black/80 w-10 hidden group-hover/slider:flex items-center justify-center text-white transition-all backdrop-blur-sm rounded-r-lg"><ChevronLeft size={28} /></button>

        <div ref={rowRef} className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-4 snap-x">
          {items.map((item) => (
            <div 
              key={item.id} 
              // Adicionado onClick
              onClick={() => onItemClick && onItemClick(item)}
              className={`
                relative flex-none snap-start transition-all duration-300 hover:scale-95 cursor-pointer overflow-hidden rounded-lg bg-theme-card
                ${isLarge ? 'w-[280px] h-[160px]' : 'w-[140px] h-[210px]'}
              `}
            >
              <img src={item.image || item.url || item.cover} alt={item.title} className="w-full h-full object-cover"/>
              {item.is_locked && <div className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full backdrop-blur-md"><Lock size={12} className="text-white"/></div>}
            </div>
          ))}
        </div>

        <button onClick={() => scroll('right')} className="absolute right-0 top-0 bottom-0 z-40 bg-black/50 hover:bg-black/80 w-10 hidden group-hover/slider:flex items-center justify-center text-white transition-all backdrop-blur-sm rounded-l-lg"><ChevronRight size={28} /></button>
      </div>
    </div>
  );
}