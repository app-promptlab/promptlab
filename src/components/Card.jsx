import React from 'react';
import { Play, Heart, Copy, Images } from 'lucide-react';

// Este componente recebe os dados do item (item) e se ele deve ser grande ou pequeno (isLarge)
export default function Card({ item, isLarge = false, onClick, type = 'prompt' }) {
  
  // Decide qual imagem mostrar (alguns itens tem 'cover', outros 'url' ou 'thumbnail')
  const imageSrc = item.cover || item.url || item.thumbnail || item.image;
  const title = item.title || 'Sem título';

  return (
    <div 
      onClick={() => onClick && onClick(item)}
      className={`
        relative group cursor-pointer transition-all duration-300 ease-in-out
        ${isLarge ? 'min-w-[280px] h-[380px]' : 'min-w-[200px] h-[120px] md:h-[140px]'}
        bg-gray-900 border border-gray-800 rounded-xl overflow-hidden
        hover:scale-105 hover:border-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] z-10 hover:z-20
      `}
    >
      {/* Imagem de Fundo */}
      <img 
        src={imageSrc} 
        alt={title} 
        className="w-full h-full object-cover transition-transform duration-500 group-hover:opacity-80"
      />

      {/* Overlay Escuro (Gradiente) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />

      {/* Conteúdo que aparece no Hover ou Fixo */}
      <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        <h4 className="text-white font-bold text-sm md:text-base leading-tight drop-shadow-md mb-1">
          {title}
        </h4>
        
        {/* Se for Pack, mostra preço. Se for Prompt, mostra ações */}
        {type === 'pack' && item.price && (
          <p className="text-blue-400 text-xs font-bold">{item.price}</p>
        )}

        {/* Ícones de Ação (Aparecem só ao passar o mouse) */}
        <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           {type === 'tutorial' && <div className="bg-white text-black p-1.5 rounded-full"><Play size={12} fill="black"/></div>}
           {type === 'prompt' && <div className="bg-blue-600 text-white p-1.5 rounded-full"><Copy size={12}/></div>}
           <span className="text-[10px] text-gray-300 uppercase tracking-widest font-bold">
             {type === 'pack' ? 'Ver Série' : type === 'tutorial' ? 'Assistir' : 'Detalhes'}
           </span>
        </div>
      </div>
    </div>
  );
}