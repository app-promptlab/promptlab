import React from 'react';
import { X, Copy, Heart } from 'lucide-react';

export default function Modal({ item, onClose, onCopy }) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
        <div className="bg-gray-900 w-full max-w-4xl rounded-2xl border border-blue-500/50 shadow-2xl overflow-hidden flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>
            
            {/* Imagem Grande */}
            <div className="md:w-1/2 bg-black flex items-center justify-center">
                <img src={item.url || item.cover} className="w-full h-full object-contain max-h-[50vh] md:max-h-[80vh]" alt={item.title}/>
            </div>
            
            {/* Conteúdo */}
            <div className="md:w-1/2 p-8 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                    <h3 className="text-2xl font-bold text-white">{item.title || 'Prompt'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={28}/></button>
                </div>
                
                {/* Texto do Prompt */}
                <div className="bg-black border border-gray-800 p-6 rounded-xl flex-1 overflow-y-auto custom-scrollbar mb-6">
                    <p className="text-gray-300 font-mono text-sm leading-relaxed">
                        {item.prompt || item.description || "Sem descrição disponível."}
                    </p>
                </div>
                
                {/* Botões de Ação */}
                <button onClick={() => onCopy(item.prompt)} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-blue-600/40 transition-all flex items-center justify-center mb-3">
                    <Copy className="mr-2"/> COPIAR PROMPT
                </button>
                <button className="w-full border border-gray-700 text-gray-400 font-bold py-3 rounded-xl hover:bg-gray-800 hover:text-white transition-all flex items-center justify-center">
                    <Heart className="mr-2"/> ADICIONAR AOS FAVORITOS
                </button>
            </div>
        </div>
    </div>
  );
}