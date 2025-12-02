import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Play, MessageSquare, Zap } from 'lucide-react';

export default function TutorialsPage() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    // Carrega vídeos ordenados (assumindo que a ordem de criação define a timeline)
    supabase.from('tutorials_videos').select('*').order('id', { ascending: true }).then(({data}) => setVideos(data || []));
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-10 animate-fadeIn pb-32">
      
      {/* 1. CABEÇALHO */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter uppercase">Tutoriais</h1>
        <p className="text-gray-500 font-bold tracking-widest text-sm uppercase">Domine a criação com IA</p>
      </div>

      {/* 2. FERRAMENTAS DE CRIAÇÃO (Botões Grandes) */}
      <div className="mb-20">
        <h2 className="text-center text-xl font-bold text-orange-500 mb-2 uppercase">Ferramentas de Criação</h2>
        <p className="text-center text-gray-400 text-xs mb-8 max-w-lg mx-auto">Escolha a ferramenta que deseja dominar:</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
             <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl flex flex-col items-center hover:border-blue-500 transition-colors group cursor-pointer">
                <MessageSquare size={40} className="text-blue-500 mb-4 group-hover:scale-110 transition-transform"/>
                <h3 className="text-2xl font-black text-white mb-1">CHATGPT</h3>
                <p className="text-blue-500 text-xs font-bold uppercase tracking-wider">Fotos Cinematográficas</p>
             </div>
             <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl flex flex-col items-center hover:border-purple-500 transition-colors group cursor-pointer">
                <Zap size={40} className="text-purple-500 mb-4 group-hover:scale-110 transition-transform"/>
                <h3 className="text-2xl font-black text-white mb-1">GEMINI IA</h3>
                <p className="text-purple-500 text-xs font-bold uppercase tracking-wider">Fotos Realistas</p>
             </div>
        </div>
      </div>

      {/* 3. TIMELINE DE AULAS */}
      <div className="relative">
          {/* Linha Vertical Central (Desktop) ou Lateral (Mobile) */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 via-purple-600 to-gray-800 rounded-full md:-ml-0.5"></div>

          <div className="space-y-16">
            {videos.map((video, index) => (
               <div key={video.id} className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 relative ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                   
                   {/* Ponto na Linha */}
                   <div className="absolute left-6 md:left-1/2 w-4 h-4 bg-white rounded-full border-4 border-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.8)] z-10 md:-ml-2 transform -translate-x-1.5 md:translate-x-0 mt-8 md:mt-0"></div>

                   {/* Texto (Lado A) */}
                   <div className="w-full md:w-1/2 pl-16 md:pl-0 md:text-right flex flex-col justify-center">
                       <div className={`${index % 2 !== 0 ? 'md:text-left' : ''}`}>
                           <h3 className="text-2xl font-bold text-white mb-2">{video.title}</h3>
                           <p className="text-gray-400 text-sm leading-relaxed mb-4">Aprenda passo a passo como utilizar este recurso para maximizar seus resultados na plataforma.</p>
                           {video.link_action && (
                               <a href={video.link_action} target="_blank" className="text-blue-500 font-bold text-xs uppercase hover:text-white transition-colors">
                                   {video.link_label || 'Acessar Material'} &rarr;
                               </a>
                           )}
                       </div>
                   </div>

                   {/* Vídeo (Lado B) */}
                   <div className="w-full md:w-1/2 pl-12 md:pl-0">
                       <div className="aspect-video bg-black rounded-xl border border-gray-800 overflow-hidden shadow-2xl relative group hover:border-blue-500 transition-all">
                           <img src={video.thumbnail} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="Thumb"/>
                           <a href={video.video_url} target="_blank" className="absolute inset-0 flex items-center justify-center">
                               <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                   <Play className="ml-1 fill-white text-white"/>
                               </div>
                           </a>
                       </div>
                   </div>

               </div>
            ))}
          </div>
      </div>

    </div>
  );
}