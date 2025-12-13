import React from 'react';
import { X, Copy, Heart, Lock, Key, Eye } from 'lucide-react';

export default function PromptModal({ item, onClose, onCopy, onFavorite, isLiked }) {
  if (!item) return null;

  return (
    <div 
        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center animate-fadeIn md:p-8"
        onClick={onClose}
    >
      <div 
        className="w-full h-full md:h-auto md:max-h-[90vh] md:max-w-6xl bg-theme-sidebar md:border md:border-white/10 md:rounded-2xl md:shadow-2xl flex flex-col md:flex-row overflow-hidden relative"
        onClick={e => e.stopPropagation()}
      >
        
        <button 
            type="button" 
            onClick={onClose} 
            className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm border border-white/10 transition-colors"
        >
            <X size={24} />
        </button>

        {/* --- ÁREA DA IMAGEM --- */}
        <div className="flex-1 md:w-3/5 bg-black relative flex items-center justify-center overflow-hidden min-h-0">
             <img 
                src={item.url} 
                alt={item.title} 
                className="w-full h-full object-contain select-none" 
                draggable="false" 
                onContextMenu={(e) => e.preventDefault()}
            />
        </div>

        {/* --- ÁREA DE CONTEÚDO --- */}
        {/* ALTERAÇÃO 1: Reduzi max-h no mobile de 45vh para 40vh (sobra mais imagem) */}
        <div className="shrink-0 md:shrink md:w-2/5 bg-theme-sidebar border-t border-white/10 flex flex-col max-h-[40vh] md:max-h-full md:h-full">
            
            {/* ALTERAÇÃO 2: Removi 'overflow-y-auto' daqui. Agora o container é fixo e 'hidden'. */}
            <div className="p-5 md:p-8 flex flex-col h-full gap-4 overflow-hidden">
                <h2 className="text-xl md:text-2xl font-bold text-white md:mt-2 shrink-0">{item.title}</h2>
                
                {/* ALTERAÇÃO 3: 
                    - Adicionei 'flex-1' para forçar a caixa a ocupar O RESTO do espaço (sem empurrar botões).
                    - Adicionei 'overflow-y-auto' AQUI. Só o texto rola.
                */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent min-h-[0px]">
                    {/* ALTERAÇÃO 4: Fonte menor no mobile (text-xs) */}
                    <p className="text-gray-300 font-mono text-xs md:text-sm leading-relaxed whitespace-pre-wrap">
                        {item.prompt}
                    </p>
                </div>

                {/* Botões de Ação (Ficam fixos pois o pai não rola mais) */}
                <div className="flex flex-col gap-3 mt-auto pt-2 shrink-0">
                    <button 
                        type="button"
                        onClick={(e) => onCopy(item.prompt)}
                        className="w-full bg-theme-primary hover:bg-theme-primary/90 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-theme-primary/20 transition-all"
                    >
                        <Copy size={20} /> COPIAR PROMPT
                    </button>
                    
                    <button 
                        type="button"
                        onClick={(e) => onFavorite(item)}
                        className={`w-full py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${isLiked ? 'text-red-500 hover:bg-red-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                        {isLiked ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                    </button>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}