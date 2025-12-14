import React from 'react';
import { X, Copy, Heart, Lock, Key, Eye } from 'lucide-react';

export default function PromptModal({ item, onClose, onCopy, onFavorite, isLiked }) {
  if (!item) return null;

  return (
    <div 
        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center animate-fadeIn p-4 md:p-8"
        onClick={onClose}
    >
      <div 
        className="w-full h-full md:w-full md:h-[80vh] md:max-w-6xl bg-theme-sidebar md:border md:border-white/10 md:rounded-2xl md:shadow-2xl flex flex-col md:flex-row overflow-hidden relative"
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
        {/* ALTERAÇÃO 1: Mobile agora ocupa 70% da altura (h-[70%]) */}
        <div className="h-[70%] md:h-full w-full md:w-3/5 bg-black relative flex items-center justify-center overflow-hidden shrink-0">
             <img 
                src={item.url} 
                alt={item.title} 
                className="w-full h-full object-contain select-none" 
                draggable="false" 
                onContextMenu={(e) => e.preventDefault()}
            />
        </div>

        {/* --- ÁREA DE CONTEÚDO --- */}
        {/* ALTERAÇÃO 2: Mobile agora ocupa 30% da altura (h-[30%]) */}
        <div className="h-[30%] md:h-full w-full md:w-2/5 bg-theme-sidebar border-t md:border-t-0 md:border-l border-white/10 flex flex-col min-h-0">
            
            {/* Reduzi o padding no mobile para p-4 (era p-5) para ganhar espaço */}
            <div className="flex flex-col h-full p-4 md:p-8 overflow-hidden gap-3">
                
                {/* Título */}
                <h2 className="text-base md:text-2xl font-bold text-white shrink-0 truncate pr-8">{item.title}</h2>
                
                {/* Caixa de Texto */}
                <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 overflow-y-auto custom-scrollbar min-h-0">
                    {/* ALTERAÇÃO 3: Fonte reduzida para text-[10px] no mobile */}
                    <p className="text-gray-300 font-mono text-[10px] md:text-sm leading-relaxed whitespace-pre-wrap">
                        {item.prompt}
                    </p>
                </div>

                {/* Botões */}
                <div className="flex flex-col gap-2 shrink-0 pt-1">
                    <button 
                        type="button"
                        onClick={(e) => onCopy(item.prompt)}
                        /* ALTERAÇÃO 4: Botão mais compacto no mobile (py-2.5) */
                        className="w-full bg-theme-primary hover:bg-theme-primary/90 text-white py-2.5 md:py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-theme-primary/20 transition-all text-xs md:text-base"
                    >
                        <Copy size={16} className="md:w-5 md:h-5" /> COPIAR PROMPT
                    </button>
                    
                    <button 
                        type="button"
                        onClick={(e) => onFavorite(item)}
                        className={`w-full py-2 md:py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors text-[10px] md:text-sm ${isLiked ? 'text-red-500 hover:bg-red-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <Heart size={16} className="md:w-5 md:h-5" fill={isLiked ? "currentColor" : "none"} />
                        {isLiked ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                    </button>
                </div>

            </div>
        </div>

      </div>
    </div>
  );
}