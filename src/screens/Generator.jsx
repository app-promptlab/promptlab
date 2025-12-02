import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Zap, Link as LinkIcon, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';

export default function Generator() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca as configurações do banco
    supabase.from('generator_settings').select('*').single().then(({ data, error }) => {
        if (data) setData(data);
        setLoading(false);
    });
  }, []);

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600"/></div>;

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-8 animate-fadeIn pb-24">
      {/* Cabeçalho */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter">
          GERADOR DE <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">PROMPT</span>
        </h1>
        <p className="text-gray-400">Crie comandos perfeitos em segundos.</p>
      </div>

      {/* Seção 1: Vídeo Tutorial (Dinâmico) */}
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-600/20 p-2 rounded-lg"><Zap className="text-blue-400" size={24}/></div>
          <h2 className="text-2xl font-bold text-white">Como <span className="text-blue-400">instalar e usar</span> o Gerador</h2>
        </div>
        
        <div className="w-full aspect-video bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl relative group">
          <iframe 
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${data?.youtube_id || ''}`} 
            title="Tutorial Gerador"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          ></iframe>
        </div>
      </div>

      {/* Seção 2: Botões de Ação (Dinâmicos) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        <a href={data?.link_prompt_tool || '#'} target="_blank" rel="noreferrer" className="group relative overflow-hidden bg-gray-900 border border-gray-700 hover:border-blue-500 rounded-2xl p-8 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-[0_0_30px_rgba(37,99,235,0.2)]">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"/>
            <Zap size={48} className="text-blue-500 mb-4 group-hover:scale-110 transition-transform"/>
            <span className="text-xl font-bold text-white mb-2">Gerador de Prompt</span>
            <span className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2 group-hover:bg-blue-500 transition-colors">
              ACESSAR AGORA <LinkIcon size={14}/>
            </span>
        </a>

        <a href={data?.link_image_tool || '#'} target="_blank" rel="noreferrer" className="group relative overflow-hidden bg-gray-900 border border-gray-700 hover:border-purple-500 rounded-2xl p-8 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"/>
            <div className="mb-4 relative"><Zap size={48} className="text-purple-500 group-hover:scale-110 transition-transform"/></div>
            <span className="text-xl font-bold text-white mb-2">Gerador de Imagem</span>
            <span className="bg-purple-600 text-white px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2 group-hover:bg-purple-500 transition-colors">
              ACESSAR AGORA <LinkIcon size={14}/>
            </span>
        </a>
      </div>

      {/* Seção 3: Tutorial Mobile (Estático - Instrucional) */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8 md:p-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white mb-2">Como <span className="text-purple-400">adicionar</span> ao seu ChatGPT</h2>
          <p className="text-gray-400">Fixe nosso GPT na sua barra lateral para acesso rápido.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-center">
          <div className="flex flex-col items-center">
             <span className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Passo 01</span>
             <div className="relative w-64 h-[400px] bg-black border-4 border-gray-800 rounded-[2rem] overflow-hidden flex items-center justify-center">
                <div className="text-center p-4">
                    <div className="text-white font-bold mb-2">Toque no Nome</div>
                    <ArrowRight className="rotate-90 text-red-500 mx-auto" size={32}/>
                </div>
             </div>
          </div>
          <div className="flex flex-col items-center">
             <span className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Passo 02</span>
             <div className="relative w-64 h-[400px] bg-black border-4 border-gray-800 rounded-[2rem] overflow-hidden flex items-center justify-center">
                <div className="text-center p-4">
                    <div className="text-white font-bold mb-2">Keep in sidebar</div>
                    <CheckCircle className="text-blue-500 mx-auto" size={32}/>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}