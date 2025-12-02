import React from 'react';
import { Zap, Link as LinkIcon, Smartphone, CheckCircle, ArrowRight } from 'lucide-react';

export default function Generator() {
  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-8 animate-fadeIn pb-24">
      
      {/* Cabeçalho */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter">
          GERADOR DE <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">PROMPT</span>
        </h1>
        <p className="text-gray-400">Crie comandos perfeitos em segundos.</p>
      </div>

      {/* Seção 1: Vídeo Tutorial */}
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-600/20 p-2 rounded-lg"><Zap className="text-blue-400" size={24}/></div>
          <h2 className="text-2xl font-bold text-white">Como <span className="text-blue-400">instalar e usar</span> o Gerador</h2>
        </div>
        
        <div className="w-full aspect-video bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl relative group">
          {/* Substitua o SRC do iframe pelo seu vídeo real depois */}
          <iframe 
            className="w-full h-full"
            src="https://www.youtube.com/embed/VIDEO_ID_AQUI" 
            title="Tutorial Gerador"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          ></iframe>
        </div>
      </div>

      {/* Seção 2: Botões de Ação */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        <a href="#" target="_blank" className="group relative overflow-hidden bg-gray-900 border border-gray-700 hover:border-blue-500 rounded-2xl p-8 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-[0_0_30px_rgba(37,99,235,0.2)]">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"/>
            <Zap size={48} className="text-blue-500 mb-4 group-hover:scale-110 transition-transform"/>
            <span className="text-xl font-bold text-white mb-2">Gerador de Prompt</span>
            <span className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2 group-hover:bg-blue-500 transition-colors">
              ACESSAR AGORA <LinkIcon size={14}/>
            </span>
        </a>

        <a href="#" target="_blank" className="group relative overflow-hidden bg-gray-900 border border-gray-700 hover:border-purple-500 rounded-2xl p-8 flex flex-col items-center justify-center transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"/>
            <div className="mb-4 relative">
              <Zap size={48} className="text-purple-500 group-hover:scale-110 transition-transform"/>
            </div>
            <span className="text-xl font-bold text-white mb-2">Gerador de Imagem</span>
            <span className="bg-purple-600 text-white px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2 group-hover:bg-purple-500 transition-colors">
              ACESSAR AGORA <LinkIcon size={14}/>
            </span>
        </a>
      </div>

      {/* Seção 3: Tutorial Mobile (Passo a Passo) */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8 md:p-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white mb-2">
            Como <span className="text-purple-400">adicionar</span> ao seu ChatGPT pelo celular
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Tenha o poder do PromptLab na palma da sua mão. Fixe nosso GPT na sua barra lateral para acesso rápido.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-center">
          {/* Passo 01 */}
          <div className="flex flex-col items-center">
             <span className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Passo 01</span>
             <div className="relative w-64 h-[500px] bg-black border-4 border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                {/* Simulação da UI do ChatGPT */}
                <div className="absolute top-0 w-full h-full bg-gray-800 flex flex-col items-center pt-10">
                    <div className="w-full px-6 flex justify-between items-center text-gray-400 mb-4">
                        <div className="w-6 h-6 rounded bg-gray-600"/>
                        <div className="font-bold text-white">Gerador de Prompt <span className="text-[10px] text-gray-500">v1.0</span></div>
                        <div className="w-6 h-6 rounded bg-gray-600"/>
                    </div>
                    {/* Seta Indicativa */}
                    <div className="absolute top-14 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce">
                        <div className="text-red-500 font-bold text-xs mb-1">CLIQUE AQUI</div>
                        <ArrowRight className="rotate-90 text-red-500" size={32}/>
                    </div>
                </div>
             </div>
             <p className="mt-4 text-gray-400 text-sm text-center">Toque no nome do GPT no topo.</p>
          </div>

          {/* Passo 02 */}
          <div className="flex flex-col items-center">
             <span className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Passo 02</span>
             <div className="relative w-64 h-[500px] bg-black border-4 border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                {/* UI Menu Aberto */}
                <div className="absolute inset-0 bg-black/90 flex items-center justify-center">
                    <div className="bg-gray-800 w-5/6 rounded-xl p-4 space-y-3">
                        <div className="h-8 bg-gray-700 rounded flex items-center px-3 text-gray-400 text-xs">Compartilhar</div>
                        <div className="h-8 bg-gray-700 rounded flex items-center px-3 text-gray-400 text-xs">Ver detalhes</div>
                        <div className="h-8 bg-gray-700 rounded flex justify-between items-center px-3 text-white text-xs font-bold border border-blue-500/50 relative overflow-hidden">
                           Keep in Sidebar 
                           <div className="absolute inset-0 bg-blue-500/20 animate-pulse"/>
                           <CheckCircle size={14} className="text-blue-500"/>
                        </div>
                    </div>
                    {/* Seta Indicativa */}
                    <div className="absolute top-[60%] right-8 flex flex-col items-center">
                        <ArrowRight className="rotate-180 text-red-500 mb-1" size={32}/>
                    </div>
                </div>
             </div>
             <p className="mt-4 text-gray-400 text-sm text-center">Selecione "Keep in sidebar".</p>
          </div>
        </div>
      </div>

    </div>
  );
}