import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Copy, Heart, Lock, ShoppingCart, Loader2, Image as ImageIcon } from 'lucide-react';

// --- CONFIGURAÇÃO ---
// Coloque aqui o mesmo link de checkout do produto "Pack de Prompts" que está no App.jsx
const LINK_CHECKOUT = "https://pay.kiwify.com.br/hgxpno4";
// --------------------

export default function PromptsGallery({ user, showToast, onlyFavorites = false }) {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Todos');

  // Verifica se o usuário tem acesso total (Admin ou comprou o pack)
  const hasAccess = user?.plan === 'admin' || user?.has_prompts;

  useEffect(() => {
    fetchPrompts();
  }, [user, onlyFavorites]);

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('pack_items') // Usando a tabela que vi na sua imagem
        .select('*')
        .order('order_index', { ascending: true }); // Ordena pela coluna que vi na tabela

      if (onlyFavorites) {
        // Lógica de favoritos (se tiver tabela de favoritos, ajustamos depois)
        // Por enquanto, vou simular que não filtra nada se não tiver a tabela conectada
      }

      const { data, error } = await query;
      if (error) throw error;
      setPrompts(data || []);
    } catch (error) {
      console.error('Erro ao buscar prompts:', error);
      showToast('Erro ao carregar galeria');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Prompt copiado!');
  };

  // Filtragem simples no front-end (Categorias simuladas por enquanto)
  const categories = ['Todos', 'Retratos', 'Paisagens', 'Cyberpunk', 'Natal'];
  
  // Se não tiver coluna de categoria, filtra nada. Se tiver, ajustamos.
  const filteredPrompts = filter === 'Todos' 
    ? prompts 
    : prompts.filter(p => p.title?.includes(filter) || p.prompt?.includes(filter));

  if (loading) return (
    <div className="flex items-center justify-center h-full text-theme-primary">
        <Loader2 size={48} className="animate-spin"/>
    </div>
  );

  return (
    <div className="p-6 md:p-10 pb-20">
      
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {onlyFavorites ? 'Meus Favoritos' : 'Galeria de Prompts'}
          </h1>
          <p className="text-gray-400">
            {onlyFavorites 
              ? 'Sua coleção pessoal de prompts salvos.' 
              : 'Explore nossa coleção oficial. Copie, cole e crie.'}
          </p>
        </div>
        
        {!onlyFavorites && (
             <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                            filter === cat 
                            ? 'bg-theme-primary text-white' 
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
             </div>
        )}
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPrompts.map((item) => {
            // LÓGICA DE BLOQUEIO:
            // Bloqueado se: (Não é grátis) E (Usuário não tem acesso)
            const isLocked = !item.is_free && !hasAccess;

            return (
                <div key={item.id} className="group relative bg-theme-sidebar border border-white/5 rounded-2xl overflow-hidden hover:border-theme-primary/30 transition-all hover:shadow-xl hover:shadow-black/50 flex flex-col">
                    
                    {/* Imagem do Card */}
                    <div className="relative aspect-square overflow-hidden bg-black/20">
                        {item.url ? (
                            <img 
                                src={item.url} 
                                alt={item.title} 
                                className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isLocked ? 'blur-md opacity-50' : ''}`} 
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600">
                                <ImageIcon size={48} />
                            </div>
                        )}

                        {/* Badge Grátis/Pro */}
                        <div className="absolute top-3 left-3 z-10">
                            {item.is_free ? (
                                <span className="bg-green-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide shadow-lg">
                                    Grátis
                                </span>
                            ) : (
                                !hasAccess && (
                                    <span className="bg-black/60 backdrop-blur-md text-white border border-white/20 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide flex items-center gap-1">
                                        <Lock size={10} /> Premium
                                    </span>
                                )
                            )}
                        </div>

                        {/* OVERLAY DE BLOQUEIO (Cadeado + Botão) */}
                        {isLocked && (
                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                                <Lock size={32} className="text-white mb-3" />
                                <p className="text-white font-bold text-center text-sm mb-3">Conteúdo Exclusivo</p>
                                <a 
                                    href={LINK_CHECKOUT}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-theme-primary hover:bg-theme-primary/90 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-transform hover:scale-105"
                                >
                                    <ShoppingCart size={14} />
                                    Desbloquear
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Conteúdo do Card */}
                    <div className="p-4 flex flex-col flex-1">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-white truncate pr-2">{item.title || 'Sem título'}</h3>
                            {/* Botão Favoritar (Simulado) */}
                            <button className="text-gray-500 hover:text-red-500 transition-colors">
                                <Heart size={18} />
                            </button>
                        </div>

                        {/* Área do Prompt */}
                        <div className="relative bg-black/30 rounded-lg p-3 mt-auto border border-white/5 group-hover:border-white/10 transition-colors">
                            <p className={`text-xs text-gray-400 line-clamp-3 font-mono ${isLocked ? 'blur-sm select-none opacity-50' : ''}`}>
                                {isLocked 
                                    ? 'Este prompt é exclusivo para membros PRO. Desbloqueie para visualizar o comando completo.' 
                                    : (item.prompt || 'Sem prompt cadastrado...')}
                            </p>

                            {/* Botão Copiar (Só aparece se desbloqueado) */}
                            {!isLocked && (
                                <button 
                                    onClick={() => copyToClipboard(item.prompt)}
                                    className="absolute top-2 right-2 p-1.5 bg-white/10 hover:bg-theme-primary hover:text-white rounded-md text-gray-400 transition-all opacity-0 group-hover:opacity-100"
                                    title="Copiar Prompt"
                                >
                                    <Copy size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                </div>
            );
        })}
      </div>

        {filteredPrompts.length === 0 && !loading && (
            <div className="text-center py-20 text-gray-500">
                <p>Nenhum prompt encontrado nesta categoria.</p>
            </div>
        )}
    </div>
  );
}