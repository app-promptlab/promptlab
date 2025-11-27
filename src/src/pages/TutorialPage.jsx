import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Play } from 'lucide-react';

export default function TutorialsPage() {
    const [tutorials, setTutorials] = useState([]);
    useEffect(() => { supabase.from('tutorials_videos').select('*').order('id', { ascending: true }).then(({ data }) => setTutorials(data || [])); }, []);
    return (
        <div className="max-w-3xl mx-auto pb-20 animate-fadeIn px-6 pt-8">
             <div className="text-center mb-12">
                 <h2 className="text-5xl font-black text-white mb-2 tracking-tighter">TUTORIAIS</h2>
                 <p className="text-blue-600 font-bold tracking-[0.2em] text-sm uppercase mb-8">Ferramentas de Criação</p>
                 <div className="flex justify-center gap-4">
                     <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded uppercase text-sm shadow-lg">CHATGPT</button>
                     <button className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-8 py-3 rounded uppercase text-sm border border-blue-500/30">MIDJOURNEY</button>
                 </div>
             </div>
             <div className="space-y-12">
                 {tutorials.map(video => (
                     <div key={video.id} className="bg-black border border-gray-800 rounded-2xl overflow-hidden shadow-2xl hover:border-blue-900 transition-all">
                         <div className="p-4 flex items-center border-b border-gray-900"><div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div><h3 className="text-white font-bold text-lg">{video.title}</h3></div>
                         <div className="relative aspect-video group cursor-pointer overflow-hidden">
                             <img src={video.thumbnail} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"/>
                             <div className="absolute inset-0 flex items-center justify-center"><div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform"><Play className="ml-1 text-white fill-white w-8 h-8"/></div></div>
                             <a href={video.video_url} target="_blank" className="absolute inset-0 z-10"></a>
                         </div>
                         <div className="p-6 text-center bg-gray-900"><a href={video.link_action || '#'} target="_blank" className="text-blue-500 hover:text-white font-bold text-sm uppercase tracking-wider border-b-2 border-blue-500/30 pb-1 hover:border-white transition-colors">{video.link_label || 'Acessar Recurso'}</a></div>
                     </div>
                 ))}
             </div>
        </div>
    );
}