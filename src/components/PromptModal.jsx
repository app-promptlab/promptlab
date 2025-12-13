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
        className="w-full h-full md:h-auto md:max-h-[85vh] md:max-w-6xl bg-theme-sidebar md:border md:border-white/10 md:rounded-2xl md:shadow-2xl flex flex-col md:flex-row overflow-hidden relative"
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
        <div className="h-[50%] w-full md:h-full md:w-3/5 bg-black relative flex items-center justify-center overflow-hidden shrink-0">
             <img 
                src={item.url} 
                alt={item.title} 
                className="w-full h-full object-contain select-none" 
                draggable="false" 
                onContextMenu={(e) => e.preventDefault()}
            />
        </div>

        {/* --- ÁREA DE CONTEÚDO (DIREITA NO DESKTOP) --- */}
        {/* 'md:h-full' garante que esta coluna respeite a altura máxima do card (85vh) */}
        <div className="h-[50%] w-full md:h-full md:w-2/5 bg-theme-sidebar border-t md:border-t-0 md:border-l border-white/10 flex flex-col min-h-0">
            
            {/* Container interno flexível: 
                - h-full: Ocupa toda a altura da coluna
                - overflow-hidden: Impede que filhos empurrem o layout
            */}
            <div className="flex flex-col h-full p-5 md:p-8 overflow-hidden gap-4">
                
                {/* 1. Título (Fixo) */}
                <h2 className="text-lg md:text-2xl font-bold text-white shrink-0 truncate pr-8">{item.title}</h2>
                
                {/* 2. Caixa de Texto (FLEXÍVEL - Onde a mágica acontece) 
                    - flex-1: Ocupa todo o espaço que sobra entre o título e os botões
                    - min-h-0: Permite que o flexbox encolha se necessário (crucial para scroll funcionar)
                    - overflow-y-auto: A barra de rolagem aparece AQUI, não na janela inteira
                */}
                <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 overflow-y-auto custom-scrollbar min-h-0">
                    <p className="text-gray-300 font-mono text-xs md:text-sm leading-relaxed whitespace-pre-wrap">
                        {item.prompt}
                    </p>
                </div>

                {/* 3. Botões (Fixo no Rodapé) 
                    - shrink-0: Garante que nunca serão esmagados ou empurrados para fora
                */}
                <div className="flex flex-col gap-3 shrink-0 pt-2">
                    <button 
                        type="button"
                        onClick={(e) => onCopy(item.prompt)}
                        className="w-full bg-theme-primary hover:bg-theme-primary/90 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-theme-primary/20 transition-all text-sm md:text-base"
                    >
                        <Copy size={20} /> COPIAR PROMPT
                    </button>
                    
                    <button 
                        type="button"
                        onClick={(e) => onFavorite(item)}
                        className={`w-full py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors text-xs md:text-sm ${isLiked ? 'text-red-500 hover:bg-red-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
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