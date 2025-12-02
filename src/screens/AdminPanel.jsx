import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useTheme } from '../context/ThemeContext';
import { 
  Plus, Edit3, Trash2, X, ChevronLeft, UploadCloud, Loader2, Save, 
  LayoutDashboard, Zap, LayoutGrid, Play, Heart, Palette, Smartphone 
} from 'lucide-react';

// --- Componente de Upload ---
function ImageUploader({ currentImage, onUploadComplete, label }) {
  const [uploading, setUploading] = useState(false);
  
  const uploadImage = async (event) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;
      
      const file = event.target.files[0];
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
             {uploading ? 'Enviando...' : 'Escolher'}
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
  const { config, refreshConfig } = useTheme();

  const TABS = [
    { id: 'editor', label: 'Editor Visual', icon: Palette },
    { id: 'generator', label: 'Tela Gerador', icon: Zap },
    { id: 'dashboard', label: 'Dashboard (News)', icon: LayoutDashboard },
    { id: 'prompts', label: 'Prompts & Packs', icon: LayoutGrid },
    { id: 'tutorials', label: 'Tutoriais', icon: Play },
    { id: 'favorites', label: 'Favoritos', icon: Heart },
  ];

  const [activeTab, setActiveTab] = useState('editor');
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedPack, setSelectedPack] = useState(null);
  
  // Estado para Site Config (Editor e Gerador)
  const [siteConfig, setSiteConfig] = useState(config || {});

  // --- Data Fetching ---
  const fetchData = async () => {
    setItems([]);
    try {
        if (activeTab === 'editor' || activeTab === 'generator') {
            // Garante que estamos com a config mais atual
            const { data } = await supabase.from('site_config').select('*').single();
            if (data) setSiteConfig(data);
        }
        else if (activeTab === 'dashboard') {
            const { data } = await supabase.from('news').select('*').order('id', {ascending: false});
            setItems(data || []);
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
    } catch (error) { console.error("Erro fetch:", error); }
  };

  useEffect(() => { fetchData(); }, [activeTab, selectedPack]);

  // --- Salvar Site Config (Para Editor e Gerador) ---
  const saveSiteConfig = async () => {
    const { error } = await supabase.from('site_config').update(siteConfig).eq('id', siteConfig.id);
    if (!error) {
        showToast("Configurações atualizadas!");
        refreshConfig(); // Atualiza o tema do site em tempo real
    } else {
        alert("Erro ao salvar config: " + error.message);
    }
  };

  // --- Salvar Conteúdo (News, Prompts, Tutorials) ---
  const handleSaveItem = async (e) => {
    e.preventDefault();
    let table = '';
    let payload = { ...editingItem };
    delete payload.profile; delete payload.item; // Limpeza

    if (activeTab === 'dashboard') table = 'news';
    if (activeTab === 'tutorials') table = 'tutorials_videos';
    if (activeTab === 'prompts') {
        if (selectedPack) { table = 'pack_items'; payload.pack_id = selectedPack.id; } 
        else table = 'products';
    }

    const { error } = await supabase.from(table).upsert(payload);
    if (!error) { showToast("Salvo com sucesso!"); setEditingItem(null); fetchData(); } 
    else alert("Erro: " + error.message);
  };

  const handleDelete = async (id) => {
    if(!confirm("Tem certeza que deseja excluir?")) return;
    let table = '';
    if (activeTab === 'dashboard') table = 'news';
    if (activeTab === 'tutorials') table = 'tutorials_videos';
    if (activeTab === 'prompts') table = selectedPack ? 'pack_items' : 'products';
    if (activeTab === 'favorites') table = 'user_favorites';

    const { error } = await supabase.from(table).delete().eq('id', id);
    if(!error) { showToast("Excluído!"); fetchData(); }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 pb-24 animate-fadeIn">
      <h1 className="text-3xl font-bold text-white mb-8">Painel Admin (White Label)</h1>

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

      {/* ======================= ABA: EDITOR VISUAL ======================= */}
      {activeTab === 'editor' && (
        <div className="max-w-5xl space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Identidade Visual</h2>
                <button onClick={saveSiteConfig} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg flex items-center shadow-lg sticky top-4 z-10"><Save size={18} className="mr-2"/> Salvar Tema</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Cores */}
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 space-y-4">
                    <h3 className="text-blue-500 font-bold uppercase text-xs tracking-wider mb-4 border-b border-gray-800 pb-2">Paleta de Cores</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-gray-400 text-xs font-bold block mb-1">Primária (Botões)</label><div className="flex gap-2"><input type="color" value={siteConfig.primary_color} onChange={e=>setSiteConfig({...siteConfig, primary_color: e.target.value})} className="h-10 w-10 rounded cursor-pointer border-none"/><input type="text" value={siteConfig.primary_color} onChange={e=>setSiteConfig({...siteConfig, primary_color: e.target.value})} className="flex-1 bg-black border border-gray-700 rounded px-2 text-white text-sm"/></div></div>
                        <div><label className="text-gray-400 text-xs font-bold block mb-1">Secundária (Detalhes)</label><div className="flex gap-2"><input type="color" value={siteConfig.secondary_color} onChange={e=>setSiteConfig({...siteConfig, secondary_color: e.target.value})} className="h-10 w-10 rounded cursor-pointer border-none"/><input type="text" value={siteConfig.secondary_color} onChange={e=>setSiteConfig({...siteConfig, secondary_color: e.target.value})} className="flex-1 bg-black border border-gray-700 rounded px-2 text-white text-sm"/></div></div>
                        <div><label className="text-gray-400 text-xs font-bold block mb-1">Fundo (Background)</label><div className="flex gap-2"><input type="color" value={siteConfig.background_color} onChange={e=>setSiteConfig({...siteConfig, background_color: e.target.value})} className="h-10 w-10 rounded cursor-pointer border-none"/><input type="text" value={siteConfig.background_color} onChange={e=>setSiteConfig({...siteConfig, background_color: e.target.value})} className="flex-1 bg-black border border-gray-700 rounded px-2 text-white text-sm"/></div></div>
                        <div><label className="text-gray-400 text-xs font-bold block mb-1">Superfície (Cards)</label><div className="flex gap-2"><input type="color" value={siteConfig.surface_color} onChange={e=>setSiteConfig({...siteConfig, surface_color: e.target.value})} className="h-10 w-10 rounded cursor-pointer border-none"/><input type="text" value={siteConfig.surface_color} onChange={e=>setSiteConfig({...siteConfig, surface_color: e.target.value})} className="flex-1 bg-black border border-gray-700 rounded px-2 text-white text-sm"/></div></div>
                    </div>
                    <div><label className="text-gray-400 text-xs font-bold block mb-1">Nome do App</label><input type="text" value={siteConfig.app_name} onChange={e=>setSiteConfig({...siteConfig, app_name: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-2 text-white"/></div>
                </div>

                {/* Imagens e Textos Home */}
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 space-y-4">
                    <h3 className="text-blue-500 font-bold uppercase text-xs tracking-wider mb-4 border-b border-gray-800 pb-2">Branding e Home</h3>
                    <ImageUploader label="Logo Header (Grande)" currentImage={siteConfig.logo_header_url} onUploadComplete={url => setSiteConfig({...siteConfig, logo_header_url: url})} />
                    <ImageUploader label="Logo Menu (Icone)" currentImage={siteConfig.logo_menu_url} onUploadComplete={url => setSiteConfig({...siteConfig, logo_menu_url: url})} />
                    <ImageUploader label="Capa do Topo (Hero)" currentImage={siteConfig.hero_background_url} onUploadComplete={url => setSiteConfig({...siteConfig, hero_background_url: url})} />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-gray-400 text-xs font-bold block mb-1">Título Home</label><input type="text" value={siteConfig.home_title} onChange={e=>setSiteConfig({...siteConfig, home_title: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-2 text-white"/></div>
                        <div><label className="text-gray-400 text-xs font-bold block mb-1">Subtítulo</label><input type="text" value={siteConfig.home_subtitle} onChange={e=>setSiteConfig({...siteConfig, home_subtitle: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-2 text-white"/></div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* ======================= ABA: TELA GERADOR ======================= */}
      {activeTab === 'generator' && (
        <div className="max-w-5xl space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Conteúdo do Gerador</h2>
                <button onClick={saveSiteConfig} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg flex items-center shadow-lg sticky top-4 z-10"><Save size={18} className="mr-2"/> Salvar Gerador</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Configs Principais */}
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 space-y-4">
                    <h3 className="text-purple-500 font-bold uppercase text-xs tracking-wider mb-4 border-b border-gray-800 pb-2">Cabeçalho & Links</h3>
                    <div><label className="text-gray-400 text-xs font-bold block mb-1">Título da Página</label><input type="text" value={siteConfig.generator_title} onChange={e=>setSiteConfig({...siteConfig, generator_title: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-2 text-white"/></div>
                    <div><label className="text-gray-400 text-xs font-bold block mb-1">Subtítulo</label><input type="text" value={siteConfig.generator_subtitle} onChange={e=>setSiteConfig({...siteConfig, generator_subtitle: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-2 text-white"/></div>
                    <div><label className="text-gray-400 text-xs font-bold block mb-1">ID do YouTube</label><input type="text" value={siteConfig.generator_youtube_id} onChange={e=>setSiteConfig({...siteConfig, generator_youtube_id: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-2 text-white"/></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-gray-400 text-xs font-bold block mb-1">Link Botão Prompt</label><input type="text" value={siteConfig.link_prompt_tool} onChange={e=>setSiteConfig({...siteConfig, link_prompt_tool: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-2 text-white"/></div>
                        <div><label className="text-gray-400 text-xs font-bold block mb-1">Link Botão Imagem</label><input type="text" value={siteConfig.link_image_tool} onChange={e=>setSiteConfig({...siteConfig, link_image_tool: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-2 text-white"/></div>
                    </div>
                </div>

                {/* Tutorial Mobile */}
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 space-y-4">
                    <h3 className="text-purple-500 font-bold uppercase text-xs tracking-wider mb-4 border-b border-gray-800 pb-2"><Smartphone size={16} className="inline mr-1"/> Tutorial Mobile</h3>
                    <div><label className="text-gray-400 text-xs font-bold block mb-1">Título da Seção</label><input type="text" value={siteConfig.tutorial_mobile_title} onChange={e=>setSiteConfig({...siteConfig, tutorial_mobile_title: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-2 text-white"/></div>
                    
                    <div className="bg-black/40 p-3 rounded border border-gray-700">
                        <span className="text-white text-xs font-bold mb-2 block">Passo 01</span>
                        <ImageUploader label="Imagem (Opcional)" currentImage={siteConfig.step1_image} onUploadComplete={url => setSiteConfig({...siteConfig, step1_image: url})}/>
                        <label className="text-gray-400 text-xs font-bold block mb-1 mt-2">Texto</label><input type="text" value={siteConfig.step1_text} onChange={e=>setSiteConfig({...siteConfig, step1_text: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white text-xs"/>
                    </div>

                    <div className="bg-black/40 p-3 rounded border border-gray-700">
                        <span className="text-white text-xs font-bold mb-2 block">Passo 02</span>
                        <ImageUploader label="Imagem (Opcional)" currentImage={siteConfig.step2_image} onUploadComplete={url => setSiteConfig({...siteConfig, step2_image: url})}/>
                        <label className="text-gray-400 text-xs font-bold block mb-1 mt-2">Texto</label><input type="text" value={siteConfig.step2_text} onChange={e=>setSiteConfig({...siteConfig, step2_text: e.target.value})} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white text-xs"/>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* ======================= ABA: DASHBOARD (NEWS) ======================= */}
      {activeTab === 'dashboard' && (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Gerenciar Novidades</h2>
                <button onClick={() => setEditingItem({})} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold flex items-center shadow-lg"><Plus size={18} className="mr-2"/> Nova Notícia</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {items.map(item => (
                    <div key={item.id} className="bg-gray-900 border border-gray-800 p-4 rounded-xl relative group hover:border-blue-500 transition-colors">
                        <div className="h-32 bg-black rounded mb-3 overflow-hidden">
                            <img src={item.image} className="w-full h-full object-cover" alt="news"/>
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

      {/* ======================= ABA: PROMPTS (PACKS & ITEMS) ======================= */}
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
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
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

      {/* ======================= ABA: TUTORIAIS ======================= */}
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

      {/* ======================= ABA: FAVORITOS ======================= */}
      {activeTab === 'favorites' && (
        <div>
            <h2 className="text-xl font-bold text-white mb-6">Monitoramento de Favoritos</h2>
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-black text-white uppercase font-bold text-xs tracking-wider">
                            <tr>
                                <th className="p-4">Usuário</th>
                                <th className="p-4">Item</th>
                                <th className="p-4">Data</th>
                                <th className="p-4 text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {items.map(fav => (
                                <tr key={fav.id} className="hover:bg-gray-800/50 transition-colors">
                                    <td className="p-4">{fav.profile?.email || 'N/A'}</td>
                                    <td className="p-4 text-white font-medium">{fav.item?.title || 'Removido'}</td>
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

      {/* ======================= MODAL DE EDIÇÃO GENÉRICO ======================= */}
      {editingItem && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-gray-900 w-full max-w-2xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                    <h3 className="font-bold text-white uppercase tracking-wider">
                        {editingItem.id ? 'Editar' : 'Novo'} Item
                    </h3>
                    <button onClick={() => setEditingItem(null)}><X className="text-gray-400 hover:text-white"/></button>
                </div>
                
                <form onSubmit={handleSaveItem} className="p-6 overflow-y-auto custom-scrollbar space-y-4">
                    
                    {(activeTab !== 'favorites') && (
                        <div>
                            <label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Título</label>
                            <input className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white focus:border-blue-500 outline-none" value={editingItem.title || ''} onChange={e => setEditingItem({...editingItem, title: e.target.value})} required/>
                        </div>
                    )}

                    {activeTab === 'dashboard' && (
                        <>
                            <ImageUploader label="Imagem da Notícia" currentImage={editingItem.image} onUploadComplete={url => setEditingItem({...editingItem, image: url})}/>
                            <div><label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Conteúdo</label><textarea rows={3} className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white" value={editingItem.content || ''} onChange={e => setEditingItem({...editingItem, content: e.target.value})}/></div>
                            <div><label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Data Exibida</label><input className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white" value={editingItem.date || ''} onChange={e => setEditingItem({...editingItem, date: e.target.value})}/></div>
                        </>
                    )}

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

                    {activeTab === 'prompts' && !selectedPack && (
                        <>
                            <ImageUploader label="Capa do Pack" currentImage={editingItem.cover} onUploadComplete={url => setEditingItem({...editingItem, cover: url})}/>
                            <div><label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Descrição</label><input className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white" value={editingItem.description || ''} onChange={e => setEditingItem({...editingItem, description: e.target.value})}/></div>
                            <div><label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Preço (Display)</label><input className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white" value={editingItem.price || ''} onChange={e => setEditingItem({...editingItem, price: e.target.value})}/></div>
                            <div><label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Link Checkout</label><input className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white" value={editingItem.checkout_url || ''} onChange={e => setEditingItem({...editingItem, checkout_url: e.target.value})}/></div>
                        </>
                    )}

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