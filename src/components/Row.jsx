import React from 'react';
import Card from './Card'; // Importa a peça que criamos acima
import { ChevronRight } from 'lucide-react';

export default function Row({ title, items, isLarge = false, type = 'prompt', onCardClick }) {
  
  // Se a lista estiver vazia, não mostra nada
  if (!items || items.length === 0) return null;

  return (
    <div className="mb-8 animate-fadeIn">
      {/* Título do Trilho (Ex: "Tendências", "Novos Packs") */}
      <div className="flex items-center justify-between mb-4 px-2 group cursor-pointer">
        <h2 className="text-xl font-bold text-white group-hover:text-blue-500 transition-colors">
          {title}
        </h2>
        
        <div className="text-xs text-gray-500 group-hover:text-white flex items-center transition-colors font-semibold uppercase tracking-wider opacity-0 group-hover:opacity-100">
          Ver tudo <ChevronRight size={14} className="ml-1"/>
        </div>
      </div>

      {/* Container de Rolagem Horizontal */}
      <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-6 px-2 scrollbar-hide scroll-smooth">
        {items.map((item) => (
          <Card 
            key={item.id} 
            item={item} 
            isLarge={isLarge} 
            type={type}
            onClick={onCardClick} 
          />
        ))}
      </div>
    </div>
  );
}