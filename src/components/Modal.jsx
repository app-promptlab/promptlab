import React from 'react';
import { X, Copy, Heart } from 'lucide-react';

export default function Modal({ item, onClose, onCopy }) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
        <div 
            className="w-full max-w-4xl rounded-2xl border border-theme-primary/50 shadow-2xl overflow-hidden flex flex-col md:flex-row bg-theme-modal" 
            onClick={e => e.stopPropagation()}
        >
            <div className="md:w-1/2 bg-black flex items-center justify-center">
                <img src={item.url} className="w-full h-full object-contain max-h-[60vh] md:max-h-[80vh]"/>
            </div>
            
            <div className="md:w-1/2 p-8 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                    <h3 className="text-2xl font-bold text-theme-text">{item.title || 'Prompt'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-theme-primary transition-colors"><X size={28}/></button>
                </div>
                
                <div className="bg-black/30 border border-white/10 p-6 rounded-xl flex-1 overflow-y-auto custom-scrollbar mb-6">
                    <p className="text-theme-text/80 font-mono text-sm leading-relaxed">{item.prompt}</p>
                </div>
                
                <button onClick={() => onCopy(item.prompt)} className="w-full bg-theme-primary hover:opacity-90 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center mb-3">
                    <Copy className="mr-2"/> COPIAR PROMPT
                </button>
                
                <button className="w-full border border-white/10 text-theme-text font-bold py-3 rounded-xl hover:bg-white/5 transition-all flex items-center justify-center">
                    <Heart className="mr-2"/> FAVORITAR
                </button>
            </div>
        </div>
    </div>
  );
}