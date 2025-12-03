import React, { useState } from 'react';
import { X, Copy, Heart, Check } from 'lucide-react';

export default function Modal({ item, onClose, onCopy, onFavorite, isLiked }) {
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const handleCopyClick = () => {
    // Chama a função do pai que já tem a lógica segura de copy
    onCopy(item.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
        <div 
            className="w-full max-w-4xl rounded-2xl border border-theme-primary/50 shadow-2xl overflow-hidden flex flex-col md:flex-row bg-theme-modal" 
            onClick={e => e.stopPropagation()}
        >
            <div className="md:w-1/2 bg-black flex items-center justify-center relative">
                <img src={item.url} className="w-full h-full object-contain max-h-[60vh] md:max-h-[80vh]" alt={item.title}/>
            </div>
            
            <div className="md:w-1/2 p-8 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                    <h3 className="text-2xl font-bold text-theme-card-text">{item.title || 'Prompt'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-theme-primary transition-colors"><X size={28}/></button>
                </div>
                
                <div className="bg-black/30 border border-white/10 p-6 rounded-xl flex-1 overflow-y-auto custom-scrollbar mb-6">
                    <p className="text-theme-card-text/80 font-mono text-sm leading-relaxed">{item.prompt}</p>
                </div>
                
                <button 
                    onClick={handleCopyClick} 
                    className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center mb-3 ${copied ? 'bg-green-600 text-white' : 'bg-theme-primary hover:opacity-90 text-white'}`}
                >
                    {copied ? <Check className="mr-2"/> : <Copy className="mr-2"/>} 
                    {copied ? 'COPIADO!' : 'COPIAR PROMPT'}
                </button>
                
                <button 
                    onClick={() => onFavorite(item)}
                    className={`w-full border font-bold py-3 rounded-xl transition-all flex items-center justify-center ${isLiked ? 'bg-theme-surface text-red-500 border-red-500' : 'border-white/10 text-theme-card-text hover:bg-white/5'}`}
                >
                    <Heart className={`mr-2 ${isLiked ? 'fill-current' : ''}`}/> 
                    {isLiked ? 'REMOVER DOS FAVORITOS' : 'ADICIONAR AOS FAVORITOS'}
                </button>
            </div>
        </div>
    </div>
  );
}