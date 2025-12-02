import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Zap, Link as LinkIcon, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';

export default function Generator() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('generator_settings').select('*').single().then(({ data }) => {
        setData(data || {});
        setLoading(false);
    });
  }, []);

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600"/></div>;

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-8 animate-fadeIn pb-24">
      
      {/* 1. CABEÇALHO EDITÁVEL */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter uppercase">
          {data.title || 'GERADOR DE PROMPT'}
        </h1>
        <p className="text-gray-400">{data.subtitle || 'Crie comandos perfeitos.'}</p>
      </div>

      {/* 2. VÍDEO E LINKS */}
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-600/20 p-2 rounded-lg"><Zap className="text-blue-400" size={24}/></div>
          <h2 className="text-2xl font-bold text-white">Tutorial e Acesso</h2>
        </div>
        
        <div className="w-full aspect-video bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl relative group mb-8">
          <iframe 
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${data.youtube_id || ''}`} 
            title="Tutorial"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          ></iframe>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <a href={data.link_prompt_tool || '#'} target="_blank" rel="noreferrer" className="group relative overflow-hidden bg-gray-900 border border-gray-700 hover:border-blue-500 rounded-2xl p-8 flex flex-col items-center justify-center transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"/>
                <Zap size={40} className="text-blue-500 mb-4 group-hover:scale-110 transition-transform"/>
                <span className="text-xl font-bold text-white mb-2">Gerador de Prompt</span>
                <span className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2">ACESSAR AGORA <LinkIcon size={14}/></span>
            </a>
            <a href={data.link_image_tool || '#'} target="_blank" rel="noreferrer" className="group relative overflow-hidden bg-gray-900 border border-gray-700 hover:border-purple-500 rounded-2xl p-8 flex flex-col items-center justify-center transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"/>
                <div className="mb-4"><Zap size={40} className="text-purple-500 group-hover:scale-110 transition-transform"/></div>
                <span className="text-xl font-bold text-white mb-2">Gerador de Imagem</span>
                <span className="bg-purple-600 text-white px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2">ACESSAR AGORA <LinkIcon size={14}/></span>
            </a>
        </div>
      </div>

      {/* 3. TUTORIAL MOBILE EDITÁVEL */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8 md:p-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white mb-2">{data.tutorial_title || 'Como adicionar ao celular'}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-center">
          
          {/* Passo 01 */}
          <div className="flex flex-col items-center">
             <span className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">{data.step1_label || 'Passo 01'}</span>
             <div className="relative w-64 h-[400px] bg-black border-4 border-gray-800 rounded-[2rem] overflow-hidden flex items-center justify-center shadow-2xl">
                {data.step1_image ? (
                    <img src={data.step1_image} className="w-full h-full object-cover" alt="Passo 1" />
                ) : (
                    <div className="text-center p-4">
                        <div className="text-white font-bold mb-2">{data.step1_text}</div>
                        <ArrowRight className="rotate-90 text-red-500 mx-auto" size={32}/>
                    </div>
                )}
             </div>
             {!data.step1_image && <p className="mt-4 text-gray-400 text-sm">{data.step1_text}</p>}
          </div>

          {/* Passo 02 */}
          <div className="flex flex-col items-center">
             <span className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">{data.step2_label || 'Passo 02'}</span>
             <div className="relative w-64 h-[400px] bg-black border-4 border-gray-800 rounded-[2rem] overflow-hidden flex items-center justify-center shadow-2xl">
                {data.step2_image ? (
                    <img src={data.step2_image} className="w-full h-full object-cover" alt="Passo 2" />
                ) : (
                    <div className="text-center p-4">
                        <div className="text-white font-bold mb-2">{data.step2_text}</div>
                        <CheckCircle className="text-blue-500 mx-auto" size={32}/>
                    </div>
                )}
             </div>
             {!data.step2_image && <p className="mt-4 text-gray-400 text-sm">{data.step2_text}</p>}
          </div>

        </div>
      </div>

    </div>
  );
}