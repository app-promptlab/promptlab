import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useTheme } from '../context/ThemeContext';
import { 
  Plus, Edit3, Trash2, X, ChevronLeft, UploadCloud, Loader2, Save, 
  Palette, LayoutGrid, Video, Image as ImageIcon, GripVertical 
} from 'lucide-react';

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

// Componente Input de Cor Bonito
const ColorInput = ({ label, value, onChange }) => (
    <div>
        <label className="text-xs text-gray-500 font-bold mb-1 block">{label}</label>
        <div className="flex items-center gap-2 bg-black border border-gray-700 p-1 rounded-lg">
            <div className="relative w-8 h-8 rounded overflow-hidden border border-gray-600 flex-shrink-0">
                <input type="color" className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer p-0 border-0" value={value || '#000000'} onChange={onChange}/>
            </div>
            <input className="bg-transparent text-white text-xs font-mono w-full outline-none uppercase p-1" value={value} onChange={onChange}/>
        </div>
    </div>
);

export default function AdminPanel({ showToast }) {
  const { identity, refreshIdentity } = useTheme();

  const TABS = [
    { id: 'editor', label: 'Editor Visual (Páginas)', icon: Palette },
    { id: 'prompts', label: 'Gerenciar Packs', icon: LayoutGrid },
  ];

  const [activeTab, setActiveTab] = useState('editor');
  
  const [selectedPage, setSelectedPage] = useState('dashboard');
  const [pageConfig, setPageConfig] = useState({});
  const [pageContent, setPageContent] = useState([]);
  const [editingBlock, setEditingBlock] = useState(null);
  const [siteIdentity, setSiteIdentity] = useState(identity || {});
  
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedPack, setSelectedPack] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);

  useEffect(() => { if(identity) setSiteIdentity(identity); }, [identity]);

  useEffect(() => {
    if (activeTab === 'editor') loadPageData(selectedPage);
    else fetchData();
  }, [activeTab, selectedPage, selectedPack]);

  const loadPageData = async (pageId) => {
    const { data: pData } = await supabase.from('pages_config').select('*').eq('page_id', pageId).single();
    setPageConfig(pData || { page_id: pageId, show_header: true });
    const { data: cData } = await supabase.from('page_content').select('*').eq('page_id', pageId).order('order_index', {ascending: true});
    setPageContent(cData || []);
  };

  const fetchData = async () => {
    setItems([]);
    if (activeTab === 'prompts') {
        if (selectedPack) {
            const { data } = await supabase.from('pack_items').select('*').eq('pack_id', selectedPack.id).order('order_index', {ascending: true});
            setItems(data || []);
        } else {
            const { data } = await supabase.from('products').select('*').order('id', {ascending: false});
            setItems(data || []);
        }
    }
  };

  const handleDragStart = (e, index, listType) => { setDraggedItem({ index, type: listType }); e.dataTransfer.effectAllowed = "move"; };
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = async (e, dropIndex, listType) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.type !== listType) return;
    let currentList = listType === 'blocks' ? pageContent : items;
    const draggedIdx = draggedItem.index;
    if (draggedIdx === dropIndex) return;
    const newList = [...currentList];
    const [removed] = newList.splice(draggedIdx, 1);
    newList.splice(dropIndex, 0, removed);
    if (listType === 'blocks') setPageContent(newList); else setItems(newList);
    const updates = newList.map((item, idx) => ({ id: item.id, order_index: idx }));
    let table = listType === 'blocks' ? 'page_content' : 'pack_items';
    for (const update of updates) { await supabase.from(table).update({ order_index: update.order_index }).eq('id', update.id); }
    showToast("Ordem atualizada!");
  };

  const saveIdentity = async () => { 
      const { id, created_at, ...updates } = siteIdentity;
      const { error } = await supabase.from('site_identity').update(updates).gt('id', 0); 
      if(!error){ showToast("Identidade Salva!"); refreshIdentity(); } else alert(error.message); 
  };
  const savePageConfig = async () => { const { error } = await supabase.from('pages_config').upsert(pageConfig); if(!error) showToast("Cabeçalho Salvo!"); else alert(error.message); };
  const saveBlock = async (e) => {
    e.preventDefault();
    const payload = { ...editingBlock, page_id: selectedPage };
    if (!payload.order_index && !payload.id) payload.order_index = pageContent.length + 1;
    if (!payload.id) delete payload.id;
    const { error } = await supabase.from('page_content').upsert(payload);
    if (!error) { showToast("Bloco Salvo!"); setEditingBlock(null); loadPageData(selectedPage); } else alert(error.message);
  };
  const deleteBlock = async (id) => { if(!confirm("Excluir?")) return; await supabase.from('page_content').delete().eq('id', id); loadPageData(selectedPage); };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    let table = selectedPack ? 'pack_items' : 'products';
    let payload = { ...editingItem };
    delete payload.profile; delete payload.item;
    if (selectedPack) { payload.pack_id = selectedPack.id; if (!payload.id) payload.order_index = items.length; }
    if (!payload.id) delete payload.id;
    const { error } = await supabase.from(table).upsert(payload);
    if (!error) { showToast("Salvo!"); setEditingItem(null); fetchData(); } else alert("Erro: " + error.message);
  };
  const handleDeleteItem = async (id) => { if(!confirm("Excluir?")) return; let table = selectedPack ? 'pack_items' : 'products'; const { error } = await supabase.from(table).delete().eq('id', id); if(!error) { showToast("Excluído!"); fetchData(); } };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 pb-32 animate-fadeIn">
      <h1 className="text-3xl font-bold text-white mb-8">Painel Admin</h1>

      <div className="flex gap-2 mb-8 overflow-x-auto border-b border-gray-800 pb-1 scrollbar-hide">
        {TABS.map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSelectedPack(null); setEditingItem(null); }} className={`flex items-center gap-2 px-6 py-3 font-bold text-sm transition-all rounded-t-lg whitespace-nowrap ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                <tab.icon size={18}/> {tab.label}
            </button>
        ))}
      </div>

      {activeTab === 'editor' && (
        <div className="max-w-6xl space-y-12">
            <div className="flex items-center gap-4 mb-6 bg-gray-900 p-4 rounded-xl border border-gray-800">
                <span className="text-white font-bold">Editando Página:</span>
                <select value={selectedPage} onChange={e => {setSelectedPage(e.target.value); loadPageData(e.target.value);}} className="bg-black text-white border border-gray-700 p-2 rounded font-bold outline-none cursor-pointer">
                    <option value="dashboard">Dashboard (Home)</option>
                    <option value="generator">Gerador</option>
                    <option value="prompts">Prompts (Galeria)</option>
                    <option value="tutorials">Tutoriais</option>
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 space-y-4">
                        <h3 className="text-purple-500 font-bold uppercase text-xs mb-2 pb-2 border-b border-gray-800">Identidade Global</h3>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <ColorInput label="Primária" value={siteIdentity.primary_color} onChange={e=>setSiteIdentity({...siteIdentity, primary_color:e.target.value})} />
                            <ColorInput label="Fundo Site" value={siteIdentity.background_color} onChange={e=>setSiteIdentity({...siteIdentity, background_color:e.target.value})} />
                            <ColorInput label="Fundo Menu" value={siteIdentity.sidebar_color} onChange={e=>setSiteIdentity({...siteIdentity, sidebar_color:e.target.value})} />
                            <ColorInput label="Texto Menu" value={siteIdentity.sidebar_text_color} onChange={e=>setSiteIdentity({...siteIdentity, sidebar_text_color:e.target.value})} />
                            <ColorInput label="Fundo Cards" value={siteIdentity.card_color} onChange={e=>setSiteIdentity({...siteIdentity, card_color:e.target.value})} />
                            <ColorInput label="Texto Cards" value={siteIdentity.card_text_color} onChange={e=>setSiteIdentity({...siteIdentity, card_text_color:e.target.value})} />
                            <ColorInput label="Fundo Modal" value={siteIdentity.modal_color} onChange={e=>setSiteIdentity({...siteIdentity, modal_color:e.target.value})} />
                        </div>

                        <div className="pt-2">
                             <label className="text-xs text-gray-500 font-bold mb-1 block">NOME DO APP</label>
                             <input className="w-full bg-black border border-gray-700 p-2 text-white rounded text-sm" value={siteIdentity.app_name || ''} onChange={e=>setSiteIdentity({...siteIdentity, app_name:e.target.value})}/>
                        </div>

                        <div className="space-y-3 pt-2">
                            <ImageUploader label="Logo Header (Grande)" currentImage={siteIdentity.logo_header_url} onUploadComplete={url=>setSiteIdentity({...siteIdentity, logo_header_url:url})}/>
                            <ImageUploader label="Logo Menu (Pequena)" currentImage={siteIdentity.logo_menu_url} onUploadComplete={url=>setSiteIdentity({...siteIdentity, logo_menu_url:url})}/>
                            <ImageUploader label="Favicon" currentImage={siteIdentity.favicon_url} onUploadComplete={url=>setSiteIdentity({...siteIdentity, favicon_url:url})}/>
                        </div>
                        
                        <button onClick={saveIdentity} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg text-sm shadow-lg mt-2">Salvar Identidade</button>
                    </div>

                    <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 space-y-4">
                        <h3 className="text-blue-500 font-bold uppercase text-xs mb-2 pb-2 border-b border-gray-800">Cabeçalho ({selectedPage})</h3>
                        <div className="flex items-center gap-2 mb-2"><input type="checkbox" checked={pageConfig.show_header||false} onChange={e=>setPageConfig({...pageConfig, show_header:e.target.checked})}/> <span className="text-white text-sm">Exibir Cabeçalho</span></div>
                        <input className="w-full bg-black border border-gray-700 p-2 text-white rounded text-sm" placeholder="Título" value={pageConfig.title||''} onChange={e=>setPageConfig({...pageConfig, title:e.target.value})}/>
                        <input className="w-full bg-black border border-gray-700 p-2 text-white rounded text-sm" placeholder="Subtítulo" value={pageConfig.subtitle||''} onChange={e=>setPageConfig({...pageConfig, subtitle:e.target.value})}/>
                        <ImageUploader label="Capa de Fundo" currentImage={pageConfig.cover_url} onUploadComplete={url=>setPageConfig({...pageConfig, cover_url:url})}/>
                        <button onClick={savePageConfig} className="w-full bg-blue-600 text-white font-bold py-2 rounded text-sm hover:bg-blue-500">Salvar Cabeçalho</button>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-4"><h3 className="text-white font-bold text-sm uppercase">Vídeos e Banners</h3><button onClick={() => setEditingBlock({ type: 'video' })} className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2"><Plus size={14}/> Adicionar</button></div>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2 pb-20">
                        {pageContent.map((block, idx) => (
                            <div key={block.id} draggable onDragStart={(e) => handleDragStart(e, idx, 'blocks')} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, idx, 'blocks')} className="bg-black border border-gray-800 p-3 rounded-lg flex items-center justify-between group hover:border-blue-500 cursor-move">
                                <div className="flex items-center gap-3 overflow-hidden"><div className="bg-gray-800 p-1.5 rounded text-gray-500 cursor-grab active:cursor-grabbing"><GripVertical size={16}/></div><div className="w-12 h-8 bg-gray-900 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">{block.type==='video'?<Video size={14} className="text-gray-500"/>:<ImageIcon size={14} className="text-gray-500"/>}</div><div className="min-w-0"><h4 className="text-white font-bold text-sm truncate">{block.title || 'Sem título'}</h4><p className="text-gray-500 text-[10px] uppercase">{block.type.replace('_',' ')}</p></div></div>
                                <div className="flex gap-2"><button onClick={()=>setEditingBlock(block)} className="text-blue-500 hover:text-white p-1 rounded hover:bg-gray-800"><Edit3 size={16}/></button><button onClick={()=>deleteBlock(block.id)} className="text-red-500 hover:text-white p-1 rounded hover:bg-gray-800"><Trash2 size={16}/></button></div>
                            </div>
                        ))}
                        {pageContent.length === 0 && <div className="text-gray-500 text-center text-sm py-10 border border-dashed border-gray-800 rounded-xl">Sem conteúdo extra.</div>}
                    </div>
                </div>
            </div>
        </div>
      )}

      {activeTab === 'prompts' && (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-4">{selectedPack && (<button onClick={() => setSelectedPack(null)} className="bg-gray-800 p-2 rounded-full hover:bg-gray-700 text-white"><ChevronLeft size={20}/></button>)}{selectedPack ? `Editando: ${selectedPack.title}` : 'Gerenciar Packs'}</h2>
                <button onClick={() => setEditingItem({})} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold flex items-center shadow-lg"><Plus size={18} className="mr-2"/> Novo</button>
            </div>
            {!selectedPack ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {items.map(item => (<div key={item.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden group relative cursor-pointer" onClick={() => setSelectedPack(item)}><div className="aspect-[3/4] relative bg-black"><img src={item.cover} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"/><div className="absolute bottom-0 w-full p-2 bg-black/80 text-white text-xs font-bold text-center truncate">{item.title}</div></div><div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={(e) => {e.stopPropagation(); setEditingItem(item)}} className="bg-blue-600 p-1.5 rounded text-white shadow-lg"><Edit3 size={14}/></button><button onClick={(e) => {e.stopPropagation(); handleDeleteItem(item.id)}} className="bg-red-600 p-1.5 rounded text-white shadow-lg"><Trash2 size={14}/></button></div></div>))}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {items.map((item, index) => (
                        <div key={item.id} draggable onDragStart={(e) => handleDragStart(e, index, 'items')} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, index, 'items')} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden group relative cursor-move hover:border-blue-500">
                            <div className="aspect-[3/4] relative bg-black"><img src={item.url} className="w-full h-full object-cover"/><div className="absolute top-2 left-2 bg-black/60 p-1 rounded text-white"><GripVertical size={16}/></div></div>
                            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => setEditingItem(item)} className="bg-blue-600 p-1.5 rounded text-white shadow-lg"><Edit3 size={14}/></button><button onClick={() => handleDeleteItem(item.id)} className="bg-red-600 p-1.5 rounded text-white shadow-lg"><Trash2 size={14}/></button></div>
                            <div className="p-2 text-xs text-gray-400 bg-gray-900 border-t border-gray-800 flex justify-between"><span>{index+1}.</span><span className="truncate">{item.title}</span></div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      )}

      {/* MODAIS */}
      {editingItem && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-gray-900 w-full max-w-2xl rounded-2xl border border-gray-700 p-6 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-white uppercase">{editingItem.id ? 'Editar' : 'Novo'} Item</h3><button onClick={() => setEditingItem(null)}><X className="text-gray-400"/></button></div>
                <form onSubmit={handleSaveItem} className="overflow-y-auto custom-scrollbar space-y-4">
                    <div><label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Título</label><input className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white" value={editingItem.title || ''} onChange={e => setEditingItem({...editingItem, title: e.target.value})} required/></div>
                    {!selectedPack && (<><ImageUploader label="Capa" currentImage={editingItem.cover} onUploadComplete={url => setEditingItem({...editingItem, cover: url})}/><div><label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Descrição</label><input className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white" value={editingItem.description || ''} onChange={e => setEditingItem({...editingItem, description: e.target.value})}/></div><div><label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Preço</label><input className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white" value={editingItem.price || ''} onChange={e => setEditingItem({...editingItem, price: e.target.value})}/></div><div><label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Checkout (Pack)</label><input className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white" value={editingItem.checkout_url || ''} onChange={e => setEditingItem({...editingItem, checkout_url: e.target.value})}/></div></>)}
                    {selectedPack && (<><ImageUploader label="Imagem" currentImage={editingItem.url} onUploadComplete={url => setEditingItem({...editingItem, url: url})}/><div><label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Prompt</label><textarea rows={5} className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white font-mono text-sm" value={editingItem.prompt || ''} onChange={e => setEditingItem({...editingItem, prompt: e.target.value})}/></div><div className="flex items-center gap-2 mt-4"><input type="checkbox" checked={editingItem.is_free || false} onChange={e => setEditingItem({...editingItem, is_free: e.target.checked})} className="w-5 h-5 accent-blue-600"/> <span className="text-white text-sm font-bold">É Gratuito? (Free)</span></div><div className="flex items-center gap-2 mt-2"><input type="checkbox" checked={editingItem.is_featured || false} onChange={e => setEditingItem({...editingItem, is_featured: e.target.checked})}/> <span className="text-white text-sm">Destaque</span></div></>)}
                    <div className="pt-4 flex justify-end gap-3"><button type="button" onClick={() => setEditingItem(null)} className="px-6 py-2 text-gray-400 font-bold hover:text-white">Cancelar</button><button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2 rounded-lg font-bold">Salvar</button></div>
                </form>
            </div>
        </div>
      )}

      {editingBlock && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-gray-900 w-full max-w-lg rounded-xl border border-gray-700 p-6 space-y-4">
                <h3 className="text-white font-bold uppercase">Editar Bloco</h3>
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