import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Plus, Edit3, Trash2, X, ChevronLeft, UploadCloud, Loader2, Save, LayoutDashboard, Zap, LayoutGrid, Play, Heart } from 'lucide-react';

// --- Componente Interno de Upload ---
function ImageUploader({ currentImage, onUploadComplete, label }) {
  const [uploading, setUploading] = useState(false);
  
  const uploadImage = async (event) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;
      
      const file = event.target.files[0];
      // Gera nome único para evitar cache ou conflito
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
      
      const { error } = await supabase.storage.from('uploads').upload(fileName, file);
      if (error) throw error;
      
      const { data } = supabase.storage.from('uploads').getPublicUrl(fileName);
      onUploadComplete(data.publicUrl);
    } catch (error) { 
      alert('Erro upload: ' + error.message); 
    } finally { 
      setUploading(false); 
    }
  };

  return (
    <div className="mb-4">
      <label className="text-gray-400 text-xs font-bold uppercase mb-2 block">{label}</label>
      <div className="flex items-center gap-3">
         <label className={`cursor-pointer bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center transition-all ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
             {uploading ? <Loader2 size={16} className="animate-spin mr-2"/> : <UploadCloud size={16} className="mr-2"/>}
             {uploading ? 'Enviando...' : 'Escolher Arquivo'}
             <input type="file" accept="image/*" onChange={uploadImage} className="hidden" disabled={uploading}/>
         </label>
         {currentImage && (
            <div className="relative group">
                <img src={currentImage} className="h-12 w-12 rounded object-cover border border-gray-700" alt="Preview"/>
            </div>
         )}
      </div>
    </div>
  );
}

// --- Painel Admin Principal ---
export default function AdminPanel({ showToast }) {
  // Configuração das Abas
  const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'generator', label: 'Gerador', icon: Zap },
    { id: 'prompts', label: 'Prompts', icon: LayoutGrid },
    { id: 'tutorials', label: 'Tutoriais', icon: Play },
    { id: 'favorites', label: 'Favoritos', icon: Heart },
  ];

  const [activeTab, setActiveTab] = useState('dashboard');
  const [items, setItems] = useState([]); // Lista genérica (News, Packs, Videos)
  const [editingItem, setEditingItem] = useState(null); // Item sendo editado no Modal
  const [selectedPack, setSelectedPack] = useState(null); // Controle de navegação (Pack -> Items)
  
  // Estado específico para a aba Gerador (Objeto único)
  const [genSettings, setGenSettings] = useState({
    title: '', subtitle: '', youtube_id: '', 
    link_prompt_tool: '', link_image_tool: '',
    tutorial_title: '', 
    step1_label: '', step1_text: '', step1_image: '',
    step2_label: '', step2_text: '', step2_image: ''
  });

  // --- Carregamento de Dados ---
  const fetchData = async () => {
    setItems([]);
    
    try {
        if (activeTab === 'dashboard') {
            const { data } = await supabase.from('news').select('*').order('id', {ascending: false});
            setItems(data || []);
        } 
        else if (activeTab === 'generator') {
            const { data } = await supabase.from('generator_settings').select('*').single();
            if (data) setGenSettings(data);
        }
        else if (activeTab === 'prompts') {
            if (selectedPack) {
                const { data } = await supabase.from('pack_items').select('*').eq('pack_id', selectedPack.id).order('id', {ascending: false});
                setItems(data || []);
            } else {
                const { data } = await supabase.from('products').select('*').order('id', {ascending: false});
                setItems(data || []);
            }
        }
        else if (activeTab === 'tutorials') {
            const { data } = await supabase.from('tutorials_videos').select('*').order('id', {ascending: true});
            setItems(data || []);
        }
        else if (activeTab === 'favorites') {
            const { data } = await supabase.from('user_favorites').select('*, profile:profiles(email), item:pack_items(title)').limit(50).order('created_at', {ascending: false});
            setItems(data || []);
        }
    } catch (error) {
        console.error("Erro ao buscar dados:", error);
    }
  };

  useEffect(() => { fetchData(); }, [activeTab, selectedPack]);

  // --- Salvar (Modal Genérico) ---
  const handleSave = async (e) => {
    e.preventDefault();
    let table = '';
    let payload = { ...editingItem };

    // Remove campos de relacionamento para não dar erro no update
    delete payload.profile; 
    delete payload.item;

    if (activeTab === 'dashboard') table = 'news';
    if (activeTab === 'tutorials') table = 'tutorials_videos';
    if (activeTab === 'prompts') {
        if (selectedPack) { 
            table = 'pack_items'; 
            payload.pack_id = selectedPack.id; 
        } else { 
            table = 'products'; 
        }
    }

    const { error } = await supabase.from(table).upsert(payload);
    if (!error) { 
        showToast("Item salvo com sucesso!"); 
        setEditingItem(null); 
        fetchData(); 
    } else {
        alert("Erro ao salvar: " + error.message);
    }
  };

  // --- Salvar Gerador (Específico) ---
  const saveGenerator = async () => {
    const { error } = await supabase.from('generator_settings').upsert(genSettings);
    if (!error) showToast("Configurações do Gerador salvas!");
    else alert("Erro: " + error.message);
  };

  // --- Excluir ---
  const handleDelete = async (id) => {
    if(!confirm("Tem certeza que deseja excluir este item?")) return;
    let table = '';
    
    if (activeTab === 'dashboard') table = 'news';
    if (activeTab === 'tutorials') table = 'tutorials_videos';
    if (activeTab === 'prompts') table = selectedPack ? 'pack_items' : 'products';
    if (activeTab === 'favorites') table = 'user_favorites';

    const { error } = await supabase.from(table).delete().eq('id', id);
    if(!error) {
        showToast("Item excluído.");
        fetchData();
    } else {
        alert("Erro ao excluir: " + error.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 pb-24 animate-fadeIn">
      <h1 className="text-3xl font-bold text-white mb-8">Painel Admin</h1>

      {/* Navegação de Abas */}
      <div className="flex gap-2 mb-8 overflow-x-auto border-b border-gray-800 pb-1 scrollbar-hide">
        {TABS.map(tab => (
            <button 
                key={tab.id} 
                onClick={() => { setActiveTab(tab.id); setSelectedPack(null); setEditingItem(null); }}
                className={`
                    flex items-center gap-2 px-6 py-3 font-bold text-sm transition-all rounded-t-lg whitespace-nowrap
                    ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}
                `}
            >
                <tab.icon size={18}/> {tab.label}
            </button>
        ))}
      </div>

      {/* ================= CONTEÚDO DAS ABAS ================= */}

      {/* 1. DASHBOARD (NEWS) */}
      {activeTab === 'dashboard' && (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Novidades do Dashboard</h2>
                <button onClick={() => setEditingItem({})} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold flex items-center shadow-lg"><Plus size={18} className="mr-2"/> Nova Notícia</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {items.map(item => (
                    <div key={item.id} className="bg-gray-900 border border-gray-800 p-4 rounded-xl relative group">
                        <div className="h-32 bg-black rounded mb-3 overflow-hidden">
                            <img src={item.image} className="w-full h-full object-cover" alt="News"/>
                        </div>
                        <h3 className="font-bold text-white truncate">{item.title}</h3>
                        <p className="text-gray-500 text-xs mb-3">{item.date}</p>
                        <div className="flex gap-2">
                            <button onClick={()=>setEditingItem(item)} className="bg-blue-600/20 hover:bg-blue-600 text-blue-500 hover:text-white p-2 rounded flex-1 transition-colors"><Edit3 size={16} className="mx-auto"/></button>
                            <button onClick={()=>handleDelete(item.id)} className="bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white p-2 rounded flex-1 transition-colors"><Trash2 size={16} className="mx-auto"/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* 2. GERADOR (SETTINGS COMPLETO) */}
      {activeTab === 'generator' && (
        <div className="max-w-5xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Editar Página Gerador</h2>
                <button onClick={saveGenerator} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg flex items-center shadow-lg sticky top-4 z-10"><Save size={18} className="mr-2"/> Salvar Alterações</button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Coluna Esquerda: Principal */}
                <div className="space-y-6 bg-gray-900 p-6 rounded-xl border border-gray-800">
                    <h3 className="text-blue-500 font-bold uppercase text-xs tracking-wider mb-4 border-b border-gray-800 pb-2">Cabeçalho & Mídia</h3>
                    <div>
                        <label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Título Principal</label>
                        <input type="text" value={genSettings.title || ''} onChange={e => setGenSettings({...genSettings, title: e.target.value})} className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white focus:border-blue-500 outline-none"/>
                    </div>
                    <div>
                        <label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Subtítulo</label>
                        <input type="text" value={genSettings.subtitle || ''} onChange={e => setGenSettings({...genSettings, subtitle: e.target.value})} className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white focus:border-blue-500 outline-none"/>
                    </div>
                    <div>
                        <label className="text-gray-400 text-xs font-bold uppercase mb-1 block">ID do YouTube (ex: dQw4w9WgXcQ)</label>
                        <input type="text" value={genSettings.youtube_id || ''} onChange={e => setGenSettings({...genSettings, youtube_id: e.target.value})} className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white focus:border-blue-500 outline-none"/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div>
                            <label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Link Botão Prompt</label>
                            <input type="text" value={genSettings.link_prompt_tool || ''} onChange={e => setGenSettings({...genSettings, link_prompt_tool: e.target.value})} className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white focus:border-blue-500 outline-none"/>
                        </div>
                        <div>
                            <label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Link Botão Imagem</label>
                            <input type="text" value={genSettings.link_image_tool || ''} onChange={e => setGenSettings({...genSettings, link_image_tool: e.target.value})} className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white focus:border-blue-500 outline-none"/>
                        </div>
                    </div>
                </div>

                {/* Coluna Direita: Tutorial Mobile */}
                <div className="space-y-6 bg-gray-900 p-6 rounded-xl border border-gray-800">
                    <h3 className="text-purple-500 font-bold uppercase text-xs tracking-wider mb-4 border-b border-gray-800 pb-2">Tutorial Mobile</h3>
                    <div>
                        <label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Título do Tutorial</label>
                        <input type="text" value={genSettings.tutorial_title || ''} onChange={e => setGenSettings({...genSettings, tutorial_title: e.target.value})} className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white focus:border-purple-500 outline-none"/>
                    </div>
                    
                    {/* Passo 1 */}
                    <div className="p-4 bg-black/40 rounded-lg border border-gray-800">
                        <div className="flex justify-between mb-2"><span className="text-white font-bold text-xs">Passo 01</span></div>
                        <ImageUploader label="Imagem (Print Celular)" currentImage={genSettings.step1_image} onUploadComplete={url => setGenSettings({...genSettings, step1_image: url})}/>
                        <label className="text-gray-400 text-xs font-bold uppercase mb-1 block mt-2">Texto Instrução</label>
                        <input type="text" value={genSettings.step1_text || ''} onChange={e => setGenSettings({...genSettings, step1_text: e.target.value})} className="w-full bg-gray-900 border border-gray-700 p-2 rounded text-white text-sm"/>
                    </div>

                    {/* Passo 2 */}
                    <div className="p-4 bg-black/40 rounded-lg border border-gray-800">
                        <div className="flex justify-between mb-2"><span className="text-white font-bold text-xs">Passo 02</span></div>
                        <ImageUploader label="Imagem (Print Celular)" currentImage={genSettings.step2_image} onUploadComplete={url => setGenSettings({...genSettings, step2_image: url})}/>
                        <label className="text-gray-400 text-xs font-bold uppercase mb-1 block mt-2">Texto Instrução</label>
                        <input type="text" value={genSettings.step2_text || ''} onChange={e => setGenSettings({...genSettings, step2_text: e.target.value})} className="w-full bg-gray-900 border border-gray-700 p-2 rounded text-white text-sm"/>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* 3. PROMPTS (PACKS & ITEMS) */}
      {activeTab === 'prompts' && (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-4">
                    {selectedPack && (
                        <button onClick={() => setSelectedPack(null)} className="bg-gray-800 p-2 rounded-full hover:bg-gray-700 text-white transition-colors">
                            <ChevronLeft size={20}/>
                        </button>
                    )}
                    {selectedPack ? `Editando: ${selectedPack.title}` : 'Gerenciar Packs'}
                </h2>
                <button onClick={() => setEditingItem({})} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold flex items-center shadow-lg"><Plus size={18} className="mr-2"/> Novo {selectedPack ? 'Prompt' : 'Pack'}</button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {items.map(item => (
                    <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden group hover:border-blue-500 transition-all cursor-pointer relative shadow-lg">
                        <div onClick={() => !selectedPack && setSelectedPack(item)} className="aspect-[3/4] relative bg-black">
                            <img src={item.cover || item.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Cover"/>
                            {!selectedPack && <div className="absolute bottom-0 w-full p-2 bg-black/80 text-white text-xs font-bold text-center truncate">{item.title}</div>}
                        </div>
                        
                        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => {e.stopPropagation(); setEditingItem(item)}} className="bg-blue-600 p-1.5 rounded text-white shadow-lg hover:scale-110 transition-transform"><Edit3 size={14}/></button>
                            <button onClick={(e) => {e.stopPropagation(); handleDelete(item.id)}} className="bg-red-600 p-1.5 rounded text-white shadow-lg hover:scale-110 transition-transform"><Trash2 size={14}/></button>
                        </div>
                        {selectedPack && <div className="p-2 text-xs text-gray-400 bg-gray-900 truncate border-t border-gray-800">{item.title}</div>}
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
                <button onClick={() => setEditingItem({})} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold flex items-center shadow-lg"><Plus size={18} className="mr-2"/> Novo Vídeo</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {items.map(item => (
                    <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden group hover:border-blue-500 transition-colors">
                        <div className="aspect-video bg-black relative">
                            <img src={item.thumbnail} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" alt="Thumb"/>
                            <div className="absolute inset-0 flex items-center justify-center"><Play className="text-white fill-white opacity-80"/></div>
                        </div>
                        <div className="p-4">
                            <h3 className="text-white font-bold mb-2 truncate">{item.title}</h3>
                            <div className="flex gap-2">
                                <button onClick={()=>setEditingItem(item)} className="flex-1 bg-gray-800 py-2 rounded text-blue-400 text-xs font-bold hover:bg-gray-700 transition-colors">EDITAR</button>
                                <button onClick={()=>handleDelete(item.id)} className="flex-1 bg-gray-800 py-2 rounded text-red-400 text-xs font-bold hover:bg-gray-700 transition-colors">EXCLUIR</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* 5. FAVORITOS (VIEW ONLY) */}
      {activeTab === 'favorites' && (
        <div>
            <h2 className="text-xl font-bold text-white mb-6">Monitoramento de Favoritos</h2>
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-black text-white uppercase font-bold text-xs tracking-wider">
                            <tr>
                                <th className="p-4">Usuário</th>
                                <th className="p-4">Item Favoritado</th>
                                <th className="p-4">Data</th>
                                <th className="p-4 text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {items.map(fav => (
                                <tr key={fav.id} className="hover:bg-gray-800/50 transition-colors">
                                    <td className="p-4">{fav.profile?.email || 'Usuário Removido'}</td>
                                    <td className="p-4 text-white font-medium">{fav.item?.title || 'Item Removido'}</td>
                                    <td className="p-4">{new Date(fav.created_at).toLocaleDateString()}</td>
                                    <td className="p-4 text-right">
                                        <button onClick={()=>handleDelete(fav.id)} className="text-red-500 hover:text-white transition-colors"><Trash2 size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                            {items.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-gray-600">Nenhum favorito registrado.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}

      {/* ================= MODAL DE EDIÇÃO GENÉRICO ================= */}
      {editingItem && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-gray-900 w-full max-w-2xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                    <h3 className="font-bold text-white uppercase tracking-wider">
                        {editingItem.id ? 'Editar' : 'Novo'} Item
                    </h3>
                    <button onClick={() => setEditingItem(null)}><X className="text-gray-400 hover:text-white"/></button>
                </div>
                
                <form onSubmit={handleSave} className="p-6 overflow-y-auto custom-scrollbar space-y-4">
                    
                    {/* Campos Padrão (Título) */}
                    {(activeTab !== 'favorites') && (
                        <div>
                            <label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Título</label>
                            <input className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white focus:border-blue-500 outline-none" value={editingItem.title || ''} onChange={e => setEditingItem({...editingItem, title: e.target.value})} required/>
                        </div>
                    )}

                    {/* CAMPOS ESPECÍFICOS: DASHBOARD */}
                    {activeTab === 'dashboard' && (
                        <>
                            <ImageUploader label="Imagem da Notícia" currentImage={editingItem.image} onUploadComplete={url => setEditingItem({...editingItem, image: url})}/>
                            <div><label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Conteúdo</label><textarea rows={3} className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white" value={editingItem.content || ''} onChange={e => setEditingItem({...editingItem, content: e.target.value})}/></div>
                            <div><label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Data Exibida</label><input className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white" value={editingItem.date || ''} onChange={e => setEditingItem({...editingItem, date: e.target.value})}/></div>
                        </>
                    )}

                    {/* CAMPOS ESPECÍFICOS: TUTORIAIS */}
                    {activeTab === 'tutorials' && (
                        <>
                            <ImageUploader label="Thumbnail" currentImage={editingItem.thumbnail} onUploadComplete={url => setEditingItem({...editingItem, thumbnail: url})}/>
                            <div><label className="text-gray-400 text-xs font-bold uppercase mb-1 block">URL do Vídeo</label><input className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white" value={editingItem.video_url || ''} onChange={e => setEditingItem({...editingItem, video_url: e.target.value})}/></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Link Botão</label><input className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white" value={editingItem.link_action || ''} onChange={e => setEditingItem({...editingItem, link_action: e.target.value})}/></div>
                                <div><label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Texto Botão</label><input className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white" value={editingItem.link_label || ''} onChange={e => setEditingItem({...editingItem, link_label: e.target.value})}/></div>
                            </div>
                        </>
                    )}

                    {/* CAMPOS ESPECÍFICOS: PACKS */}
                    {activeTab === 'prompts' && !selectedPack && (
                        <>
                            <ImageUploader label="Capa do Pack" currentImage={editingItem.cover} onUploadComplete={url => setEditingItem({...editingItem, cover: url})}/>
                            <div><label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Descrição</label><input className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white" value={editingItem.description || ''} onChange={e => setEditingItem({...editingItem, description: e.target.value})}/></div>
                            <div><label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Preço (Display)</label><input className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white" value={editingItem.price || ''} onChange={e => setEditingItem({...editingItem, price: e.target.value})}/></div>
                            <div><label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Link Checkout</label><input className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white" value={editingItem.checkout_url || ''} onChange={e => setEditingItem({...editingItem, checkout_url: e.target.value})}/></div>
                        </>
                    )}

                    {/* CAMPOS ESPECÍFICOS: PROMPT ITEMS */}
                    {activeTab === 'prompts' && selectedPack && (
                        <>
                            <ImageUploader label="Imagem Gerada" currentImage={editingItem.url} onUploadComplete={url => setEditingItem({...editingItem, url: url})}/>
                            <div><label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Prompt (Comando)</label><textarea rows={5} className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white font-mono text-sm" value={editingItem.prompt || ''} onChange={e => setEditingItem({...editingItem, prompt: e.target.value})}/></div>
                            <div className="flex items-center gap-3 bg-gray-800 p-3 rounded-lg">
                                <input type="checkbox" id="featured" checked={editingItem.is_featured || false} onChange={e => setEditingItem({...editingItem, is_featured: e.target.checked})} className="w-5 h-5 rounded accent-blue-600"/> 
                                <label htmlFor="featured" className="text-white text-sm cursor-pointer select-none">Destaque (Aparece nos Trending?)</label>
                            </div>
                        </>
                    )}

                    <div className="pt-6 flex justify-end gap-3 border-t border-gray-800">
                        <button type="button" onClick={() => setEditingItem(null)} className="px-6 py-2 text-gray-400 font-bold hover:text-white transition-colors">Cancelar</button>
                        <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2 rounded-lg font-bold shadow-lg transition-transform active:scale-95">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}