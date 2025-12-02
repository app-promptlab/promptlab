import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Play } from 'lucide-react';

export default function TutorialsPage() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    supabase.from('tutorials_videos').select('*').then(({data}) => setVideos(data || []));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 pb-24 animate-fadeIn">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-white mb-2">AULAS E TUTORIAIS</h1>
        <p className="text-blue-500 font-bold tracking-widest text-sm uppercase">Domine a Inteligência Artificial</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {videos.map(video => (
            <div key={video.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-blue-500 transition-all group">
                <div className="aspect-video relative cursor-pointer">
                    <img src={video.thumbnail} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={video.title}/>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                            <Play className="ml-1 text-white fill-white" size={24}/>
                        </div>
                    </div>
                    <a href={video.video_url} target="_blank" rel="noreferrer" className="absolute inset-0 z-10"></a>
                </div>
                <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{video.title}</h3>
                    {video.link_action && (
                        <a href={video.link_action} target="_blank" rel="noreferrer" className="text-blue-500 text-sm font-bold uppercase hover:text-white transition-colors border-b border-blue-500/30 pb-1">
                            {video.link_label || 'Acessar Recurso'}
                        </a>
                    )}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}