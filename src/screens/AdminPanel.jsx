import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Plus, Edit3, Trash2, X, ChevronLeft, UploadCloud, Loader2, Save, LayoutDashboard, Zap, LayoutGrid, Play, Heart } from 'lucide-react';

// --- Componente de Upload ---
function ImageUploader({ currentImage, onUploadComplete, label }) {
  const [uploading, setUploading] = useState(false);
  const uploadImage = async (event) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;
      const file = event.target.files[0];
      const fileName = `${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from('uploads').upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage.from('uploads').getPublicUrl(fileName);
      onUploadComplete(data.publicUrl);
    } catch (error) { alert('Erro upload: ' + error.message); } finally { setUploading(false); }
  };
  return (
    <div className="mb-4">
      <label className="text-gray-400 text-xs font-bold uppercase mb-2 block">{label}</label>
      <div className="flex items-center gap-3">
         <label className="cursor-pointer bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center">
             {uploading ? <Loader2 size={16} className="animate-spin mr-2"/> : <UploadCloud size={16} className="mr-2"/>}
             {uploading ? '...' : 'Escolher'}
             <input type="file" accept="image/*" onChange={uploadImage} className="hidden" disabled={uploading}/>
         </label>
         {currentImage && <img src={currentImage} className="h-12 w-12 rounded object-cover border border-gray-700"/>}
      </div>
    </div>
  );
}

// --- Painel Admin Principal ---
export default function AdminPanel({ showToast }) {
  // Abas mapeadas exatamente como no menu
  const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'generator', label: 'Gerador', icon: Zap },
    { id: 'prompts', label: 'Prompts', icon: LayoutGrid },
    { id: 'tutorials', label: 'Tutoriais', icon: Play },
    { id: 'favorites', label: 'Favoritos', icon: Heart },
  ];

  const [activeTab, setActiveTab] = useState('dashboard');
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedPack, setSelectedPack] = useState(null); // Apenas para aba Prompts
  const [genSettings, setGenSettings] = useState(null); // Apenas para aba Gerador

  // --- Função de Carregamento de Dados ---
  const fetchData = async () => {
    setItems([]);
    
    if (activeTab === 'dashboard') {
        // Dashboard gerencia Notícias (News)
        const { data } = await supabase.from('news').select('*').order('id', {ascending: false});
        setItems(data || []);
    } 
    else if (activeTab === 'generator') {
        // Gerador gerencia Settings (apenas 1 linha)
        const { data } = await supabase.from('generator_settings').select('*').single();
        setGenSettings(data || { youtube_id: '', link_prompt_tool: '', link_image_tool: '' });
    }
    else if (activeTab === 'prompts') {
        if (selectedPack) {
            // Se entrou num pack, lista os items
            const { data } = await supabase.from('pack_items').select('*').eq('pack_id', selectedPack.id).order('id', {ascending: false});
            setItems(data || []);
        } else {
            // Lista Packs
            const { data } = await supabase.from('products').select('*').order('id', {ascending: false});
            setItems(data || []);
        }
    }
    else if (activeTab === 'tutorials') {
        const { data } = await supabase.from('tutorials_videos').select('*').order('id', {ascending: true});
        setItems(data || []);
    }
    else if (activeTab === 'favorites') {
        // Lista todos os favoritos (Monitoramento)
        const { data } = await supabase.from('user_favorites').select('*, profile:profiles(email), item:pack_items(title)').limit(50);
        setItems(data || []);
    }
  };

  useEffect(() => { fetchData(); }, [activeTab, selectedPack]);

  // --- Funções CRUD ---
  const handleSave = async (e) => {
    e.preventDefault();
    let table = '';
    let payload = { ...editingItem };

    if (activeTab === 'dashboard') table = 'news';
    if (activeTab === 'tutorials') table = 'tutorials_videos';
    if (activeTab === 'prompts') {
        if (selectedPack) { table = 'pack_items'; payload.pack_id = selectedPack.id; }
        else table = 'products';
    }

    const { error } = await supabase.from(table).upsert(payload);
    if (!error) { showToast("Salvo!"); setEditingItem(null); fetchData(); } 
    else alert("Erro: " + error.message);
  };

  const handleDelete = async (id) => {
    if(!confirm("Excluir item?")) return;
    let table = '';
    if (activeTab === 'dashboard') table = 'news';
    if (activeTab === 'tutorials') table = 'tutorials_videos';
    if (activeTab === 'prompts') table = selectedPack ? 'pack_items' : 'products';
    if (activeTab === 'favorites') table = 'user_favorites';

    await supabase.from(table).delete().eq('id', id);
    fetchData();
  };

  // Salvar Gerador (Lógica separada pois é update único)
  const saveGenerator = async () => {
    const { error } = await supabase.from('generator_settings').upsert(genSettings);
    if(!error) showToast("Configurações do Gerador salvas!");
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 pb-24 animate-fadeIn">
      <h1 className="text-3xl font-bold text-white mb-8">Painel Admin</h1>

      {/* Menu de Abas (Igual ao Menu Lateral) */}
      <div className="flex gap-2 mb-8 overflow-x-auto border-b border-gray-800 pb-1">
        {TABS.map(tab => (
            <button 
                key={tab.id} 
                onClick={() => { setActiveTab(tab.id); setSelectedPack(null); setEditingItem(null); }}
                className={`
                    flex items-center gap-2 px-6 py-3 font-bold text-sm transition-all rounded-t-lg
                    ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}
                `}
            >
                <tab.icon size={18}/> {tab.label}
            </button>
        ))}
      </div>

      {/* --- CONTEÚDO DAS ABAS --- */}

      {/* 1. DASHBOARD (Gerenciar Novidades) */}
      {activeTab === 'dashboard' && (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Novidades do Dashboard</h2>
                <button onClick={() => setEditingItem({})} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold flex items-center"><Plus size={18} className="mr-2"/> Nova Notícia</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {items.map(item => (
                    <div key={item.id} className="bg-gray-900 border border-gray-800 p-4 rounded-xl relative group">
                        <img src={item.image} className="w-full h-32 object-cover rounded mb-3 bg-black"/>
                        <h3 className="font-bold text-white truncate">{item.title}</h3>
                        <div className="flex gap-2 mt-4">
                            <button onClick={()=>setEditingItem(item)} className="bg-blue-600 p-2 rounded text-white flex-1"><Edit3 size={16} className="mx-auto"/></button>
                            <button onClick={()=>handleDelete(item.id)} className="bg-red-600 p-2 rounded text-white flex-1"><Trash2 size={16} className="mx-auto"/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* 2. GERADOR (Configurações Únicas) */}
      {activeTab === 'generator' && genSettings && (
        <div className="max-w-2xl">
            <h2 className="text-xl font-bold text-white mb-6">Configurar Tela Gerador</h2>
            <div className="space-y-6 bg-gray-900 p-8 rounded-xl border border-gray-800">
                <div>
                    <label className="text-gray-400 text-xs font-bold uppercase mb-2 block">ID do Vídeo YouTube</label>
                    <input type="text" value={genSettings.youtube_id || ''} onChange={e => setGenSettings({...genSettings, youtube_id: e.target.value})} className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white"/>
                    <p className="text-xs text-gray-500 mt-1">Apenas o código final (ex: dQw4w9WgXcQ)</p>
                </div>
                <div>
                    <label className="text-gray-400 text-xs font-bold uppercase mb-2 block">Link Botão Prompt</label>
                    <input type="text" value={genSettings.link_prompt_tool || ''} onChange={e => setGenSettings({...genSettings, link_prompt_tool: e.target.value})} className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white"/>
                </div>
                <div>
                    <label className="text-gray-400 text-xs font-bold uppercase mb-2 block">Link Botão Imagem</label>
                    <input type="text" value={genSettings.link_image_tool || ''} onChange={e => setGenSettings({...genSettings, link_image_tool: e.target.value})} className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white"/>
                </div>
                <button onClick={saveGenerator} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg flex items-center"><Save size={18} className="mr-2"/> Salvar Configurações</button>
            </div>
        </div>
      )}

      {/* 3. PROMPTS (Packs > Items) */}
      {activeTab === 'prompts' && (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-4">
                    {selectedPack && <button onClick={() => setSelectedPack(null)} className="bg-gray-800 p-2 rounded-full hover:bg-gray-700"><ChevronLeft/></button>}
                    {selectedPack ? `Editando: ${selectedPack.title}` : 'Gerenciar Packs'}
                </h2>
                <button onClick={() => setEditingItem({})} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold flex items-center"><Plus size={18} className="mr-2"/> Novo {selectedPack ? 'Prompt' : 'Pack'}</button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {items.map(item => (
                    <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden group hover:border-blue-500 transition-all cursor-pointer relative">
                        {/* Se for Pack, clica para entrar. Se for Item, não faz nada no clique do card */}
                        <div onClick={() => !selectedPack && setSelectedPack(item)} className="aspect-[3/4] relative bg-black">
                            <img src={item.cover || item.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"/>
                            {!selectedPack && <div className="absolute bottom-0 w-full p-2 bg-black/80 text-white text-xs font-bold text-center">{item.title}</div>}
                        </div>
                        
                        {/* Botões de Ação Overlay */}
                        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => {e.stopPropagation(); setEditingItem(item)}} className="bg-blue-600 p-1.5 rounded text-white shadow-lg"><Edit3 size={14}/></button>
                            <button onClick={(e) => {e.stopPropagation(); handleDelete(item.id)}} className="bg-red-600 p-1.5 rounded text-white shadow-lg"><Trash2 size={14}/></button>
                        </div>
                        {selectedPack && <div className="p-2 text-xs text-gray-400 bg-gray-900 truncate">{item.title}</div>}
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* 4. TUTORIAIS */}
      {activeTab === 'tutorials' && (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Vídeos de Tutorial</h2>
                <button onClick={() => setEditingItem({})} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold flex items-center"><Plus size={18} className="mr-2"/> Novo Vídeo</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {items.map(item => (
                    <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden group">
                        <div className="aspect-video bg-black relative">
                            <img src={item.thumbnail} className="w-full h-full object-cover opacity-60"/>
                            <div className="absolute inset-0 flex items-center justify-center"><Play className="text-white"/></div>
                        </div>
                        <div className="p-4">
                            <h3 className="text-white font-bold mb-2 truncate">{item.title}</h3>
                            <div className="flex gap-2">
                                <button onClick={()=>setEditingItem(item)} className="flex-1 bg-gray-800 py-2 rounded text-blue-400 text-xs font-bold hover:bg-gray-700">EDITAR</button>
                                <button onClick={()=>handleDelete(item.id)} className="flex-1 bg-gray-800 py-2 rounded text-red-400 text-xs font-bold hover:bg-gray-700">EXCLUIR</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* 5. FAVORITOS (Monitoramento) */}
      {activeTab === 'favorites' && (
        <div>
            <h2 className="text-xl font-bold text-white mb-6">Monitoramento de Favoritos</h2>
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-black text-white uppercase font-bold">
                        <tr>
                            <th className="p-4">Usuário (Email)</th>
                            <th className="p-4">Item Favoritado</th>
                            <th className="p-4">Data</th>
                            <th className="p-4 text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {items.map(fav => (
                            <tr key={fav.id} className="hover:bg-gray-800/50">
                                <td className="p-4">{fav.profile?.email || 'N/A'}</td>
                                <td className="p-4 text-white font-medium">{fav.item?.title || 'Item excluído'}</td>
                                <td className="p-4">{new Date(fav.created_at).toLocaleDateString()}</td>
                                <td className="p-4 text-right">
                                    <button onClick={()=>handleDelete(fav.id)} className="text-red-500 hover:text-white"><Trash2 size={16}/></button>
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-gray-500">Nenhum favorito registrado.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {/* --- MODAL DE EDIÇÃO (Genérico) --- */}
      {editingItem && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-gray-900 w-full max-w-2xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                    <h3 className="font-bold text-white uppercase tracking-wider">Editor de {activeTab}</h3>
                    <button onClick={() => setEditingItem(null)}><X className="text-gray-400 hover:text-white"/></button>
                </div>
                <form onSubmit={handleSave} className="p-6 overflow-y-auto custom-scrollbar space-y-4">
                    
                    {/* Campos Comuns */}
                    {(activeTab !== 'favorites') && (
                        <div>
                            <label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Título</label>
                            <input className="w-full bg-black border border-gray-700 p-3 rounded text-white" value={editingItem.title || ''} onChange={e => setEditingItem({...editingItem, title: e.target.value})} required/>
                        </div>
                    )}

                    {/* Dashboard (News) */}
                    {activeTab === 'dashboard' && (
                        <>
                            <ImageUploader label="Imagem da Notícia" currentImage={editingItem.image} onUploadComplete={url => setEditingItem({...editingItem, image: url})}/>
                            <div><label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Conteúdo</label><textarea rows={3} className="w-full bg-black border border-gray-700 p-3 rounded text-white" value={editingItem.content || ''} onChange={e => setEditingItem({...editingItem, content: e.target.value})}/></div>
                            <div><label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Data (Texto)</label><input className="w-full bg-black border border-gray-700 p-3 rounded text-white" value={editingItem.date || ''} onChange={e => setEditingItem({...editingItem, date: e.target.value})}/></div>
                        </>
                    )}

                    {/* Tutoriais */}
                    {activeTab === 'tutorials' && (
                        <>
                            <ImageUploader label="Thumbnail" currentImage={editingItem.thumbnail} onUploadComplete={url => setEditingItem({...editingItem, thumbnail: url})}/>
                            <div><label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Link do Vídeo (Youtube/Vimeo)</label><input className="w-full bg-black border border-gray-700 p-3 rounded text-white" value={editingItem.video_url || ''} onChange={e => setEditingItem({...editingItem, video_url: e.target.value})}/></div>
                            <div><label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Link Botão Ação</label><input className="w-full bg-black border border-gray-700 p-3 rounded text-white" value={editingItem.link_action || ''} onChange={e => setEditingItem({...editingItem, link_action: e.target.value})}/></div>
                            <div><label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Texto Botão</label><input className="w-full bg-black border border-gray-700 p-3 rounded text-white" value={editingItem.link_label || ''} onChange={e => setEditingItem({...editingItem, link_label: e.target.value})}/></div>
                        </>
                    )}

                    {/* Prompts (Packs ou Items) */}
                    {activeTab === 'prompts' && !selectedPack && (
                        <>
                            <ImageUploader label="Capa do Pack" currentImage={editingItem.cover} onUploadComplete={url => setEditingItem({...editingItem, cover: url})}/>
                            <div><label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Descrição</label><input className="w-full bg-black border border-gray-700 p-3 rounded text-white" value={editingItem.description || ''} onChange={e => setEditingItem({...editingItem, description: e.target.value})}/></div>
                            <div><label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Preço</label><input className="w-full bg-black border border-gray-700 p-3 rounded text-white" value={editingItem.price || ''} onChange={e => setEditingItem({...editingItem, price: e.target.value})}/></div>
                        </>
                    )}
                    {activeTab === 'prompts' && selectedPack && (
                        <>
                            <ImageUploader label="Imagem do Prompt" currentImage={editingItem.url} onUploadComplete={url => setEditingItem({...editingItem, url: url})}/>
                            <div><label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Prompt (Comando)</label><textarea rows={4} className="w-full bg-black border border-gray-700 p-3 rounded text-white font-mono text-sm" value={editingItem.prompt || ''} onChange={e => setEditingItem({...editingItem, prompt: e.target.value})}/></div>
                            <div className="flex items-center gap-2 mt-4"><input type="checkbox" checked={editingItem.is_featured || false} onChange={e => setEditingItem({...editingItem, is_featured: e.target.checked})} /> <span className="text-white text-sm">Destaque (Aparece no Dashboard?)</span></div>
                        </>
                    )}

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={() => setEditingItem(null)} className="px-4 py-2 text-gray-400 font-bold hover:text-white">Cancelar</button>
                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-500">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}