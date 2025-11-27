import React from 'react';
import { ShoppingBag, Images } from 'lucide-react';

export default function StorePage({ packs, onPurchase }) {
    return (
        <div className="max-w-7xl mx-auto animate-fadeIn px-6 pt-8">
             <h2 className="text-3xl font-bold text-white mb-8">Loja Oficial</h2>
             
             <div className="mb-12 bg-gradient-to-r from-gray-900 to-black border border-blue-900/30 rounded-2xl p-8 flex items-center justify-between relative overflow-hidden shadow-2xl">
                <div className="z-10">
                    <h3 className="text-2xl font-bold text-white mb-2">Acesso Creator Vitalício</h3>
                    <p className="text-gray-400 max-w-md mb-6">Desbloqueie todos os geradores e ferramentas de IA da plataforma com um único pagamento.</p>
                    <button onClick={() => onPurchase('access-generators')} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-transform active:scale-95">
                        Comprar Acesso - R$ 49,90
                    </button>
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none"></div>
             </div>

             <div className="flex items-center justify-between mb-6">
                 <h3 className="text-2xl font-bold text-white flex items-center">
                    <Images size={24} className="text-blue-500 mr-3"/> Packs Disponíveis
                 </h3>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                 {packs.map(pack => (
                     <div key={pack.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-blue-600 transition-all cursor-pointer group shadow-lg">
                         <div className="aspect-square relative overflow-hidden">
                             <img src={pack.cover} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                             <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                                 <h4 className="text-white font-bold text-sm md:text-base leading-tight">{pack.title}</h4>
                                 <p className="text-blue-500 font-bold text-xs mt-1">{pack.price}</p>
                             </div>
                         </div>
                         <button onClick={() => onPurchase(pack.id, pack.checkout_url)} className="w-full bg-blue-600 text-white font-bold py-2 text-sm hover:bg-blue-500 transition-colors">COMPRAR</button>
                     </div>
                 ))}
             </div>
        </div>
    );
}