import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useTheme } from '../context/ThemeContext';
import { 
  Plus, Edit3, Trash2, X, ChevronLeft, UploadCloud, Loader2, Save, 
  LayoutDashboard, Zap, LayoutGrid, Play, Heart, Palette, Smartphone, Image as ImageIcon 
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
    } catch (error) { alert('Erro upload: ' + error.message); } finally { setUploading(false); }
  };
  return (
    <div className="mb-4">
      <label className="text-gray-400 text-xs font-bold uppercase mb-2 block">{label}</label>
      <div className="flex items-center gap-3">
         <label className={`cursor-pointer bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center transition-all ${uploading?'opacity-50':''}`}>
             {uploading ? <Loader2 size={16} className="animate-spin mr-2"/> : <UploadCloud size={16} className="mr-2"/>} {uploading ? '...' : 'Escolher'}
             <input type="file" accept="image/*" onChange={uploadImage} className="hidden" disabled={uploading}/>
         </label>
         {currentImage && <div className="relative group"><img src={currentImage} className="h-12 w-12 rounded object-cover border border-gray-700" alt="Preview"/></div>}
      </div>
    </div>
  );
}

// --- Painel Admin Principal ---
export default function AdminPanel({ showToast }) {
  // CORREÇÃO 1: Usando 'identity' em vez de 'config'
  const { identity, refreshIdentity } = useTheme();

  const TABS = [
    { id: 'editor', label: 'Editor Visual', icon: Palette },
    { id: 'prompts', label: 'Gerenciar Packs', icon: LayoutGrid },
    { id: 'dashboard', label: 'Notícias', icon: LayoutDashboard },
    { id: 'tutorials', label: 'Tutoriais', icon: Play },
    { id: 'favorites', label: 'Favoritos', icon: Heart },
  ];

  const [activeTab, setActiveTab] = useState('editor');
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedPack, setSelectedPack] = useState(null);
  
  // --- Estados do Editor Visual ---
  const [selectedPage, setSelectedPage] = useState('dashboard');
  const [pageConfig, setPageConfig] = useState({});
  const [pageContent, setPageContent] = useState([]);
  const [editingBlock, setEditingBlock] = useState(null);
  
  // CORREÇÃO 2: Inicializando com identity ou objeto vazio seguro
  const [siteIdentity, setSiteIdentity] = useState(identity || {});

  // Atualiza o form se o identity mudar (ex: carregou do banco)
  useEffect(() => {
    if (identity) setSiteIdentity(identity);
  }, [identity]);

  // --- CARREGAMENTO ---
  useEffect(() => {
    if (activeTab === 'editor') {
        loadPageData();
    } else {
        fetchData();
    }
  }, [activeTab, selectedPage, selectedPack]);

  const loadPageData = async () => {
    // CORREÇÃO 3: Tabelas corretas 'pages_config' e 'page_content'
    const { data: pData } = await supabase.from('pages_config').select('*').eq('page_id', selectedPage).single();
    setPageConfig(pData || { page_id: selectedPage, show_header: true });
    
    const { data: cData } = await supabase.from('page_content').select('*').eq('page_id', selectedPage).order('order_index', {ascending: true});
    setPageContent(cData || []);
  };

  const fetchData = async () => {
    setItems([]);
    try {
        if (activeTab === 'dashboard') {
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
    } catch (error) { console.error(error); }
  };

  // --- ACTIONS (EDITOR VISUAL) ---
  const saveIdentity = async () => {
    // CORREÇÃO 4: Atualiza a tabela 'site_identity'
    const { error } = await supabase.from('site_identity').update(siteIdentity).gt('id', 0);
    if (!error) { 
        showToast("Identidade Salva!"); 
        refreshIdentity(); // Atualiza o contexto global
    } else { 
        alert(error.message); 
    }
  };

  const savePageConfig = async () => {
    const { error } = await supabase.from('pages_config').upsert(pageConfig);
    if (!error) showToast("Cabeçalho Salvo!"); else alert(error.message);
  };

  const saveBlock = async (e) => {
    e.preventDefault();
    const payload = { ...editingBlock, page_id: selectedPage };
    if (!payload.order_index) payload.order_index = pageContent.length + 1;
    const { error } = await supabase.from('page_content').upsert(payload);
    if (!error) { showToast("Bloco Salvo!"); setEditingBlock(null); loadPageData(); } else alert(error.message);
  };

  const deleteBlock = async (id) => {
    if(!confirm("Excluir bloco?")) return;
    await supabase.from('page_content').delete().eq('id', id);
    loadPageData();
  };

  // --- ACTIONS (CONTEÚDO) ---
  const handleSaveItem = async (e) => {
    e.preventDefault();
    let table = '';
    let payload = { ...editingItem };
    delete payload.profile; delete payload.item;

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

  const handleDeleteItem = async (id) => {
    if(!confirm("Excluir item?")) return;
    let table = '';
    if (activeTab === 'dashboard') table = 'news';
    if (activeTab === 'tutorials') table = 'tutorials_videos';
    if (activeTab === 'prompts') table = selectedPack ? 'pack_items' : 'products';
    if (activeTab === 'favorites') table = 'user_favorites';
    const { error } = await supabase.from(table).delete().eq('id', id);
    if(!error) { showToast("Excluído!"); fetchData(); }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 pb-32 animate-fadeIn">
      <h1 className="text-3xl font-bold text-white mb-8">Painel Admin</h1>

      {/* Menu Principal */}
      <div className="flex gap-2 mb-8 overflow-x-auto border-b border-gray-800 pb-1 scrollbar-hide">
        {TABS.map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSelectedPack(null); setEditingItem(null); }} className={`flex items-center gap-2 px-6 py-3 font-bold text-sm transition-all rounded-t-lg whitespace-nowrap ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                <tab.icon size={18}/> {tab.label}
            </button>
        ))}
      </div>

      {/* ================= ABA: EDITOR VISUAL ================= */}
      {activeTab === 'editor' && (
        <div className="max-w-5xl space-y-12">
            
            {/* 1. SELETOR DE PÁGINA */}
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2"><Palette size={20}/> Gestor de Páginas</h2>
                    <div className="flex items-center gap-2 bg-black px-4 py-2 rounded-lg border border-gray-700">
                        <span className="text-gray-400 text-xs uppercase font-bold">Editando:</span>
                        <select value={selectedPage} onChange={e => setSelectedPage(e.target.value)} className="bg-transparent text-white font-bold outline-none cursor-pointer">
                            <option value="dashboard">Dashboard (Home)</option>
                            <option value="generator">Gerador</option>
                            <option value="prompts">Prompts (Galeria)</option>
                            <option value="tutorials">Tutoriais</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Configuração do Cabeçalho */}
                    <div className="lg:col-span-1 space-y-4">
                        <h3 className="text-blue-500 font-bold uppercase text-xs mb-2">Cabeçalho (Hero)</h3>
                        <div className="flex items-center gap-2 mb-2"><input type="checkbox" checked={pageConfig.show_header||false} onChange={e=>setPageConfig({...pageConfig, show_header:e.target.checked})}/> <span className="text-white text-sm">Exibir Cabeçalho</span></div>
                        <input className="w-full bg-black border border-gray-700 p-2 text-white rounded text-sm" placeholder="Título" value={pageConfig.title||''} onChange={e=>setPageConfig({...pageConfig, title:e.target.value})}/>
                        <input className="w-full bg-black border border-gray-700 p-2 text-white rounded text-sm" placeholder="Subtítulo" value={pageConfig.subtitle||''} onChange={e=>setPageConfig({...pageConfig, subtitle:e.target.value})}/>
                        <ImageUploader label="Capa de Fundo" currentImage={pageConfig.cover_url} onUploadComplete={url=>setPageConfig({...pageConfig, cover_url:url})}/>
                        <button onClick={savePageConfig} className="w-full bg-blue-600 text-white font-bold py-2 rounded text-sm hover:bg-blue-500">Salvar Cabeçalho</button>
                    </div>

                    {/* Blocos de Conteúdo */}
                    <div className="lg:col-span-2">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white font-bold text-sm uppercase">Blocos de Conteúdo</h3>
                            <button onClick={() => setEditingBlock({ type: 'video' })} className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 hover:bg-green-500"><Plus size={14}/> Adicionar</button>
                        </div>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                            {pageContent.map((block, idx) => (
                                <div key={block.id} className="bg-black border border-gray-800 p-3 rounded-lg flex items-center justify-between group hover:border-blue-500">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-gray-800 px-2 py-1 rounded text-gray-400 font-mono text-xs">{block.order_index}</div>
                                        <div className="w-12 h-8 bg-gray-900 rounded overflow-hidden flex items-center justify-center">
                                            {block.type==='video'?<Video size={14} className="text-gray-500"/>:<ImageIcon size={14} className="text-gray-500"/>}
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold text-sm line-clamp-1">{block.title || 'Sem título'}</h4>
                                            <p className="text-gray-500 text-[10px] uppercase">{block.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={()=>setEditingBlock(block)} className="text-blue-500 hover:text-white"><Edit3 size={16}/></button>
                                        <button onClick={()=>deleteBlock(block.id)} className="text-red-500 hover:text-white"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                            ))}
                            {pageContent.length === 0 && <div className="text-gray-500 text-center text-sm py-4">Nenhum bloco.</div>}
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. IDENTIDADE VISUAL */}
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2"><Palette size={20}/> Identidade Global</h2>
                    <button onClick={saveIdentity} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg shadow-lg">Salvar Cores/Logos</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div><label className="text-gray-500 text-xs block mb-1">Primária</label><div className="flex"><input type="color" value={siteIdentity.primary_color || '#2563eb'} onChange={e=>setSiteIdentity({...siteIdentity, primary_color:e.target.value})} className="h-8 w-8 cursor-pointer"/><input className="bg-black text-white text-xs border border-gray-700 flex-1 ml-2 px-2 rounded" value={siteIdentity.primary_color || ''} onChange={e=>setSiteIdentity({...siteIdentity, primary_color:e.target.value})}/></div></div>
                    <div><label className="text-gray-500 text-xs block mb-1">Secundária</label><div className="flex"><input type="color" value={siteIdentity.secondary_color || '#9333ea'} onChange={e=>setSiteIdentity({...siteIdentity, secondary_color:e.target.value})} className="h-8 w-8 cursor-pointer"/><input className="bg-black text-white text-xs border border-gray-700 flex-1 ml-2 px-2 rounded" value={siteIdentity.secondary_color || ''} onChange={e=>setSiteIdentity({...siteIdentity, secondary_color:e.target.value})}/></div></div>
                    <div><label className="text-gray-500 text-xs block mb-1">Fundo</label><div className="flex"><input type="color" value={siteIdentity.background_color || '#000000'} onChange={e=>setSiteIdentity({...siteIdentity, background_color:e.target.value})} className="h-8 w-8 cursor-pointer"/><input className="bg-black text-white text-xs border border-gray-700 flex-1 ml-2 px-2 rounded" value={siteIdentity.background_color || ''} onChange={e=>setSiteIdentity({...siteIdentity, background_color:e.target.value})}/></div></div>
                    <div><label className="text-gray-500 text-xs block mb-1">Nome App</label><input className="w-full bg-black text-white text-xs border border-gray-700 px-2 py-2 rounded" value={siteIdentity.app_name || ''} onChange={e=>setSiteIdentity({...siteIdentity, app_name:e.target.value})}/></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ImageUploader label="Logo Header (Grande)" currentImage={siteIdentity.logo_header_url} onUploadComplete={url=>setSiteIdentity({...siteIdentity, logo_header_url:url})}/>
                    <ImageUploader label="Logo Menu (Pequena)" currentImage={siteIdentity.logo_menu_url} onUploadComplete={url=>setSiteIdentity({...siteIdentity, logo_menu_url:url})}/>
                    <ImageUploader label="Favicon/Auth" currentImage={siteIdentity.logo_auth_url} onUploadComplete={url=>setSiteIdentity({...siteIdentity, logo_auth_url:url})}/>
                </div>
            </div>
        </div>
      )}

      {/* ================= ABA: GERENCIAR PACKS (CRUD) ================= */}
      {activeTab === 'prompts' && (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-4">
                    {selectedPack && (
                        <button onClick={() => setSelectedPack(null)} className="bg-gray-800 p-2 rounded-full hover:bg-gray-700 text-white"><ChevronLeft size={20}/></button>
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
                            <button onClick={(e) => {e.stopPropagation(); setEditingItem(item)}} className="bg-blue-600 p-1.5 rounded text-white shadow-lg"><Edit3 size={14}/></button>
                            <button onClick={(e) => {e.stopPropagation(); handleDeleteItem(item.id)}} className="bg-red-600 p-1.5 rounded text-white shadow-lg"><Trash2 size={14}/></button>
                        </div>
                        {selectedPack && <div className="p-2 text-xs text-gray-400 bg-gray-900 truncate border-t border-gray-800">{item.title}</div>}
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* ================= ABA: OUTROS CRUDS ================= */}
      {activeTab === 'dashboard' && (
        <div>
            <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold text-white">Gerenciar Novidades</h2><button onClick={() => setEditingItem({})} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold flex items-center"><Plus size={18} className="mr-2"/> Nova Notícia</button></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{items.map(item => (<div key={item.id} className="bg-gray-900 border border-gray-800 p-4 rounded-xl relative group"><div className="h-32 bg-black rounded mb-3 overflow-hidden"><img src={item.image} className="w-full h-full object-cover"/></div><h3 className="font-bold text-white truncate">{item.title}</h3><div className="flex gap-2 mt-4"><button onClick={()=>setEditingItem(item)} className="bg-blue-600 p-2 rounded text-white flex-1"><Edit3 size={16} className="mx-auto"/></button><button onClick={()=>handleDeleteItem(item.id)} className="bg-red-600 p-2 rounded text-white flex-1"><Trash2 size={16} className="mx-auto"/></button></div></div>))}</div>
        </div>
      )}

      {activeTab === 'tutorials' && (
        <div>
            <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold text-white">Gerenciar Tutoriais</h2><button onClick={() => setEditingItem({})} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold flex items-center"><Plus size={18} className="mr-2"/> Novo Vídeo</button></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{items.map(item => (<div key={item.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden group"><div className="aspect-video bg-black relative"><img src={item.thumbnail} className="w-full h-full object-cover opacity-60"/><div className="absolute inset-0 flex items-center justify-center"><Play className="text-white"/></div></div><div className="p-4"><h3 className="text-white font-bold mb-2 truncate">{item.title}</h3><div className="flex gap-2"><button onClick={()=>setEditingItem(item)} className="flex-1 bg-gray-800 py-2 rounded text-blue-400 text-xs font-bold">EDITAR</button><button onClick={()=>handleDeleteItem(item.id)} className="flex-1 bg-gray-800 py-2 rounded text-red-400 text-xs font-bold">EXCLUIR</button></div></div></div>))}</div>
        </div>
      )}

      {activeTab === 'favorites' && (
        <div>
            <h2 className="text-xl font-bold text-white mb-6">Monitoramento</h2>
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden"><table className="w-full text-left text-sm text-gray-400"><thead className="bg-black text-white font-bold"><tr><th className="p-4">Usuário</th><th className="p-4">Item</th><th className="p-4">Data</th><th className="p-4 text-right">Ação</th></tr></thead><tbody className="divide-y divide-gray-800">{items.map(fav => (<tr key={fav.id} className="hover:bg-gray-800/50"><td className="p-4">{fav.profile?.email||'N/A'}</td><td className="p-4 text-white">{fav.item?.title||'Item Excluído'}</td><td className="p-4">{new Date(fav.created_at).toLocaleDateString()}</td><td className="p-4 text-right"><button onClick={()=>handleDeleteItem(fav.id)} className="text-red-500 hover:text-white"><Trash2 size={16}/></button></td></tr>))}</tbody></table></div>
        </div>
      )}

      {/* ================= MODAL DE EDIÇÃO GENÉRICO ================= */}
      {editingItem && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-gray-900 w-full max-w-2xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center"><h3 className="font-bold text-white uppercase">{editingItem.id ? 'Editar' : 'Novo'} Item</h3><button onClick={() => setEditingItem(null)}><X className="text-gray-400 hover:text-white"/></button></div>
                <form onSubmit={handleSaveItem} className="p-6 overflow-y-auto custom-scrollbar space-y-4">
                    <div><label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Título</label><input className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white" value={editingItem.title || ''} onChange={e => setEditingItem({...editingItem, title: e.target.value})} required/></div>
                    
                    {activeTab === 'dashboard' && (<><ImageUploader label="Imagem" currentImage={editingItem.image} onUploadComplete={url => setEditingItem({...editingItem, image: url})}/><div><label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Conteúdo</label><textarea rows={3} className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white" value={editingItem.content || ''} onChange={e => setEditingItem({...editingItem, content: e.target.value})}/></div></>)}
                    
                    {activeTab === 'tutorials' && (<><ImageUploader label="Thumbnail" currentImage={editingItem.thumbnail} onUploadComplete={url => setEditingItem({...editingItem, thumbnail: url})}/><div><label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Vídeo URL</label><input className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white" value={editingItem.video_url || ''} onChange={e => setEditingItem({...editingItem, video_url: e.target.value})}/></div><div className="grid grid-cols-2 gap-4"><div><label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Link Botão</label><input className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white" value={editingItem.link_action || ''} onChange={e => setEditingItem({...editingItem, link_action: e.target.value})}/></div><div><label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Texto Botão</label><input className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white" value={editingItem.link_label || ''} onChange={e => setEditingItem({...editingItem, link_label: e.target.value})}/></div></div></>)}

                    {activeTab === 'prompts' && !selectedPack && (<><ImageUploader label="Capa" currentImage={editingItem.cover} onUploadComplete={url => setEditingItem({...editingItem, cover: url})}/><div><label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Descrição</label><input className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white" value={editingItem.description || ''} onChange={e => setEditingItem({...editingItem, description: e.target.value})}/></div><div><label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Preço</label><input className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white" value={editingItem.price || ''} onChange={e => setEditingItem({...editingItem, price: e.target.value})}/></div><div><label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Checkout URL</label><input className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white" value={editingItem.checkout_url || ''} onChange={e => setEditingItem({...editingItem, checkout_url: e.target.value})}/></div></>)}
                    
                    {activeTab === 'prompts' && selectedPack && (<><ImageUploader label="Imagem" currentImage={editingItem.url} onUploadComplete={url => setEditingItem({...editingItem, url: url})}/><div><label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Prompt</label><textarea rows={5} className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white font-mono text-sm" value={editingItem.prompt || ''} onChange={e => setEditingItem({...editingItem, prompt: e.target.value})}/></div><div className="flex items-center gap-2"><input type="checkbox" checked={editingItem.is_featured || false} onChange={e => setEditingItem({...editingItem, is_featured: e.target.checked})}/> <span className="text-white text-sm">Destaque</span></div></>)}

                    <div className="pt-4 flex justify-end gap-3"><button type="button" onClick={() => setEditingItem(null)} className="px-6 py-2 text-gray-400 font-bold hover:text-white">Cancelar</button><button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2 rounded-lg font-bold">Salvar</button></div>
                </form>
            </div>
        </div>
      )}

      {/* ================= MODAL DE BLOCOS (PAGE BUILDER) ================= */}
      {editingBlock && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-gray-900 w-full max-w-lg rounded-xl border border-gray-700 p-6 space-y-4">
                <h3 className="text-white font-bold uppercase">Bloco: {selectedPage}</h3>
                <div><label className="text-gray-500 text-xs block mb-1">Tipo</label><select className="w-full bg-black border border-gray-700 p-2 text-white rounded" value={editingBlock.type} onChange={e => setEditingBlock({...editingBlock, type: e.target.value})}><option value="video">Vídeo</option><option value="banner_large">Banner Grande</option><option value="banner_small">Botão/Banner Peq.</option></select></div>
                <div><label className="text-gray-500 text-xs block mb-1">Título</label><input className="w-full bg-black border border-gray-700 p-2 text-white rounded" value={editingBlock.title || ''} onChange={e => setEditingBlock({...editingBlock, title: e.target.value})}/></div>
                {editingBlock.type === 'video' ? (<div><label className="text-gray-500 text-xs block mb-1">ID YouTube</label><input className="w-full bg-black border border-gray-700 p-2 text-white rounded" value={editingBlock.media_url || ''} onChange={e => setEditingBlock({...editingBlock, media_url: e.target.value})}/></div>) : (<ImageUploader label="Imagem" currentImage={editingBlock.media_url} onUploadComplete={url => setEditingBlock({...editingBlock, media_url: url})} />)}
                {(editingBlock.type.includes('banner') || editingBlock.type === 'video') && (<><div><label className="text-gray-500 text-xs block mb-1">Subtítulo</label><input className="w-full bg-black border border-gray-700 p-2 text-white rounded" value={editingBlock.subtitle || ''} onChange={e => setEditingBlock({...editingBlock, subtitle: e.target.value})}/></div><div className="grid grid-cols-2 gap-4"><div><label className="text-gray-500 text-xs block mb-1">Link</label><input className="w-full bg-black border border-gray-700 p-2 text-white rounded" value={editingBlock.action_link || ''} onChange={e => setEditingBlock({...editingBlock, action_link: e.target.value})}/></div><div><label className="text-gray-500 text-xs block mb-1">Texto Botão</label><input className="w-full bg-black border border-gray-700 p-2 text-white rounded" value={editingBlock.action_label || ''} onChange={e => setEditingBlock({...editingBlock, action_label: e.target.value})}/></div></div></>)}
                <div><label className="text-gray-500 text-xs block mb-1">Ordem</label><input type="number" className="w-full bg-black border border-gray-700 p-2 text-white rounded" value={editingBlock.order_index || 0} onChange={e => setEditingBlock({...editingBlock, order_index: parseInt(e.target.value)})}/></div>
                <div className="flex justify-end gap-2 pt-4"><button onClick={() => setEditingBlock(null)} className="px-4 py-2 text-gray-400 text-sm font-bold">Cancelar</button><button onClick={saveBlock} className="px-6 py-2 bg-blue-600 text-white rounded text-sm font-bold">Salvar Bloco</button></div>
            </div>
        </div>
      )}
    </div>
  );
}