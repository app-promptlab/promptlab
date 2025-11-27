import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Heart, Copy, Sparkles, ChevronRight } from 'lucide-react';
import Modal from '../components/Modal';

export default function PromptsGallery({ user, onPurchase }) {
    const [prompts, setPrompts] = useState([]);
    const [packs, setPacks] = useState([]);
    const [modalItem, setModalItem] = useState(null);

    useEffect(() => { 
        supabase.from('products').select('*').limit(10).then(({data}) => setPacks(data || []));
        supabase.from('pack_items').select('*').limit(50).then(({data}) => setPrompts(data || [])); 
    }, []);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        alert("Copiado!"); // Aqui você pode usar o Toast se passar via props
    };

    return (
        <div className="max-w-7xl mx-auto animate-fadeIn px-6 pb-20 pt-8">
             {/* PACKS (PRATELEIRA) */}
             <div className="mb-12">
                 <h2 className="text-xl font-bold text-gray-400 uppercase tracking-widest mb-6 border-l-4 border-blue-600 pl-3">Nossas Séries</h2>
                 <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                     {packs.map(pack => (
                         <div key={pack.id} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer group relative">
                             <img src={pack.cover} className="aspect-[2/3] w-full object-cover"/>
                             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                 <span className="text-white text-xs font-bold border border-white px-2 py-1 rounded">Ver Pack</span>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>

             {/* PROMPTS FREE */}
             <div>
                 <h2 className="text-3xl font-bold text-white mb-8 flex items-center"><Sparkles className="mr-2 text-blue-500"/> Feed de Prompts</h2>
                 <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
                     {prompts.filter(i => !i.pack_id).map(item => (
                         <div key={item.id} onClick={() => setModalItem(item)} className="aspect-[3/4] bg-gray-900 rounded-xl overflow-hidden relative group hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:border-2 border-blue-500 transition-all duration-300 border border-gray-800 cursor-pointer">
                             <img src={item.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>
                             
                             {/* Hover Actions */}
                             <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all">
                                 <div className="bg-black/60 text-white p-1.5 rounded-full hover:bg-blue-600"><Heart size={16}/></div>
                             </div>
                             <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-all">
                                 <div className="bg-blue-600 text-white px-4 py-1.5 rounded-full font-bold text-xs shadow-lg flex items-center">
                                     <Copy size={12} className="mr-1"/> VER
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>

             {/* MODAL */}
             <Modal item={modalItem} onClose={() => setModalItem(null)} onCopy={handleCopy} />
        </div>
    );
}