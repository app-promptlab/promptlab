import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useTheme } from '../context/ThemeContext';
import { Plus, Edit3, Trash2, Save, Layout, Palette, Image as ImageIcon, Video, Link, ArrowUp, ArrowDown } from 'lucide-react';

// --- Uploader Simples ---
function ImageUploader({ currentImage, onUploadComplete, label }) {
  const [uploading, setUploading] = useState(false);
  const upload = async (e) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if(!file) return;
      const fileName = `${Date.now()}_${file.name.replace(/\W/g, '')}`;
      await supabase.storage.from('uploads').upload(fileName, file);
      const { data } = supabase.storage.from('uploads').getPublicUrl(fileName);
      onUploadComplete(data.publicUrl);
    } catch(err) { alert(err.message); } finally { setUploading(false); }
  };
  return (
    <div className="mb-4">
        <label className="text-xs font-bold text-gray-400 block mb-2">{label}</label>
        <div className="flex items-center gap-3">
            <label className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-xs font-bold cursor-pointer text-white">
                {uploading ? '...' : 'Upload'}
                <input type="file" className="hidden" onChange={upload} disabled={uploading}/>
            </label>
            {currentImage && <img src={currentImage} className="h-10 w-10 rounded border border-gray-600"/>}
        </div>
    </div>
  );
}

export default function AdminPanel({ showToast }) {
  const { identity, refreshIdentity } = useTheme();
  
  // Abas do Painel
  const [mainTab, setMainTab] = useState('identity'); // identity, pages, content
  
  // Estados para Identidade
  const [siteIdentity, setSiteIdentity] = useState(identity);

  // Estados para Gestor de Páginas
  const [selectedPage, setSelectedPage] = useState('dashboard');
  const [pageConfig, setPageConfig] = useState({});
  const [pageContent, setPageContent] = useState([]);
  const [editingBlock, setEditingBlock] = useState(null); // Bloco sendo editado

  // --- CARREGAMENTO ---
  useEffect(() => {
    if (mainTab === 'identity') setSiteIdentity(identity);
    if (mainTab === 'pages') loadPageData();
  }, [mainTab, selectedPage, identity]);

  const loadPageData = async () => {
    // 1. Config da Página (Header)
    const { data: pData } = await supabase.from('pages_config').select('*').eq('page_id', selectedPage).single();
    setPageConfig(pData || { page_id: selectedPage, show_header: true });

    // 2. Conteúdo (Blocos)
    const { data: cData } = await supabase.from('page_content').select('*').eq('page_id', selectedPage).order('order_index', {ascending: true});
    setPageContent(cData || []);
  };

  // --- SALVAR IDENTIDADE ---
  const saveIdentity = async () => {
    // Como identity pode não ter ID se for insert manual, vamos garantir update seguro
    // Mas no script eu criei uma linha inicial. Vamos assumir update no ID 1 ou app_name.
    // Melhor: dar update onde app_name = PromptLab ou pelo ID se tivermos no contexto.
    const { error } = await supabase.from('site_identity').update(siteIdentity).gt('id', 0); // Atualiza qualquer linha existente
    if (!error) { showToast("Tema Salvo!"); refreshIdentity(); }
    else alert(error.message);
  };

  // --- SALVAR PÁGINA (HEADER) ---
  const savePageConfig = async () => {
    const { error } = await supabase.from('pages_config').upsert(pageConfig);
    if (!error) showToast("Cabeçalho Salvo!");
    else alert(error.message);
  };

  // --- CRUD BLOCOS ---
  const saveBlock = async (e) => {
    e.preventDefault();
    const payload = { ...editingBlock, page_id: selectedPage };
    if (!payload.order_index) payload.order_index = pageContent.length + 1;
    
    const { error } = await supabase.from('page_content').upsert(payload);
    if (!error) { showToast("Bloco Salvo!"); setEditingBlock(null); loadPageData(); }
    else alert(error.message);
  };

  const deleteBlock = async (id) => {
    if(!confirm("Excluir bloco?")) return;
    await supabase.from('page_content').delete().eq('id', id);
    loadPageData();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 pb-32 animate-fadeIn">
      <h1 className="text-3xl font-bold text-white mb-8">Painel Admin White Label</h1>

      {/* Menu Principal */}
      <div className="flex gap-4 border-b border-gray-800 pb-1 mb-8">
        <button onClick={() => setMainTab('identity')} className={`px-4 py-2 font-bold flex items-center gap-2 ${mainTab==='identity' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}>
            <Palette size={18}/> Identidade Visual
        </button>
        <button onClick={() => setMainTab('pages')} className={`px-4 py-2 font-bold flex items-center gap-2 ${mainTab==='pages' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}>
            <Layout size={18}/> Gestor de Páginas
        </button>
      </div>

      {/* === ABA 1: IDENTIDADE === */}
      {mainTab === 'identity' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 space-y-4">
                <h3 className="text-white font-bold uppercase text-xs mb-4">Cores do Tema</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-gray-500 text-xs block mb-1">Primária</label><div className="flex"><input type="color" value={siteIdentity.primary_color} onChange={e=>setSiteIdentity({...siteIdentity, primary_color:e.target.value})} className="h-8 w-8"/><input className="bg-black text-white text-xs border border-gray-700 flex-1 ml-2 px-2" value={siteIdentity.primary_color} onChange={e=>setSiteIdentity({...siteIdentity, primary_color:e.target.value})}/></div></div>
                    <div><label className="text-gray-500 text-xs block mb-1">Secundária</label><div className="flex"><input type="color" value={siteIdentity.secondary_color} onChange={e=>setSiteIdentity({...siteIdentity, secondary_color:e.target.value})} className="h-8 w-8"/><input className="bg-black text-white text-xs border border-gray-700 flex-1 ml-2 px-2" value={siteIdentity.secondary_color} onChange={e=>setSiteIdentity({...siteIdentity, secondary_color:e.target.value})}/></div></div>
                    <div><label className="text-gray-500 text-xs block mb-1">Fundo (Bg)</label><div className="flex"><input type="color" value={siteIdentity.background_color} onChange={e=>setSiteIdentity({...siteIdentity, background_color:e.target.value})} className="h-8 w-8"/><input className="bg-black text-white text-xs border border-gray-700 flex-1 ml-2 px-2" value={siteIdentity.background_color} onChange={e=>setSiteIdentity({...siteIdentity, background_color:e.target.value})}/></div></div>
                    <div><label className="text-gray-500 text-xs block mb-1">Cards (Surface)</label><div className="flex"><input type="color" value={siteIdentity.surface_color} onChange={e=>setSiteIdentity({...siteIdentity, surface_color:e.target.value})} className="h-8 w-8"/><input className="bg-black text-white text-xs border border-gray-700 flex-1 ml-2 px-2" value={siteIdentity.surface_color} onChange={e=>setSiteIdentity({...siteIdentity, surface_color:e.target.value})}/></div></div>
                </div>
            </div>
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 space-y-4">
                <h3 className="text-white font-bold uppercase text-xs mb-4">Branding</h3>
                <input className="w-full bg-black border border-gray-700 p-2 text-white text-sm rounded mb-4" placeholder="Nome do App" value={siteIdentity.app_name} onChange={e=>setSiteIdentity({...siteIdentity, app_name: e.target.value})} />
                <ImageUploader label="Logo Header (Grande)" currentImage={siteIdentity.logo_header_url} onUploadComplete={url => setSiteIdentity({...siteIdentity, logo_header_url: url})} />
                <ImageUploader label="Logo Menu (Pequena)" currentImage={siteIdentity.logo_menu_url} onUploadComplete={url => setSiteIdentity({...siteIdentity, logo_menu_url: url})} />
                <button onClick={saveIdentity} className="w-full bg-blue-600 text-white font-bold py-2 rounded mt-4">Salvar Tema Global</button>
            </div>
        </div>
      )}

      {/* === ABA 2: GESTOR DE PÁGINAS === */}
      {mainTab === 'pages' && (
        <div>
            {/* Seletor de Página */}
            <div className="flex items-center gap-4 mb-8 bg-gray-900 p-4 rounded-xl border border-gray-800">
                <span className="text-white font-bold">Editando Página:</span>
                <select 
                    value={selectedPage} 
                    onChange={e => setSelectedPage(e.target.value)}
                    className="bg-black text-white border border-gray-700 rounded px-4 py-2"
                >
                    <option value="dashboard">Dashboard (Home)</option>
                    <option value="generator">Gerador</option>
                    <option value="tutorials">Tutoriais</option>
                    <option value="prompts">Prompts (Galeria)</option>
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Coluna 1: Config do Cabeçalho */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 space-y-4 sticky top-6">
                        <h3 className="text-blue-500 font-bold uppercase text-xs">Cabeçalho (Hero)</h3>
                        <div className="flex items-center gap-2 mb-4">
                            <input type="checkbox" checked={pageConfig.show_header || false} onChange={e => setPageConfig({...pageConfig, show_header: e.target.checked})}/>
                            <span className="text-white text-sm">Exibir Cabeçalho</span>
                        </div>
                        <div><label className="text-gray-500 text-xs block mb-1">Título</label><input className="w-full bg-black border border-gray-700 p-2 text-white rounded" value={pageConfig.title || ''} onChange={e=>setPageConfig({...pageConfig, title: e.target.value})}/></div>
                        <div><label className="text-gray-500 text-xs block mb-1">Subtítulo</label><input className="w-full bg-black border border-gray-700 p-2 text-white rounded" value={pageConfig.subtitle || ''} onChange={e=>setPageConfig({...pageConfig, subtitle: e.target.value})}/></div>
                        <ImageUploader label="Imagem de Fundo (Capa)" currentImage={pageConfig.cover_url} onUploadComplete={url => setPageConfig({...pageConfig, cover_url: url})} />
                        <button onClick={savePageConfig} className="w-full bg-blue-600 text-white font-bold py-2 rounded text-sm">Salvar Cabeçalho</button>
                    </div>
                </div>

                {/* Coluna 2: Blocos de Conteúdo */}
                <div className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-white font-bold">Blocos de Conteúdo</h3>
                        <button onClick={() => setEditingBlock({ type: 'video' })} className="bg-green-600 text-white px-4 py-2 rounded text-xs font-bold flex items-center gap-2"><Plus size={14}/> Adicionar Bloco</button>
                    </div>

                    <div className="space-y-4">
                        {pageContent.map((block, idx) => (
                            <div key={block.id} className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex items-center justify-between group hover:border-blue-500 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="bg-black p-2 rounded text-gray-400 font-mono text-xs">{idx + 1}</div>
                                    <div className="w-16 h-10 bg-black rounded overflow-hidden">
                                        {block.type === 'video' ? <div className="w-full h-full flex items-center justify-center"><Video size={16} className="text-gray-500"/></div> : <img src={block.media_url} className="w-full h-full object-cover"/>}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-sm">{block.title}</h4>
                                        <p className="text-gray-500 text-xs uppercase">{block.type.replace('_', ' ')}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setEditingBlock(block)} className="p-2 bg-gray-800 rounded hover:text-white text-blue-500"><Edit3 size={16}/></button>
                                    <button onClick={() => deleteBlock(block.id)} className="p-2 bg-gray-800 rounded hover:text-white text-red-500"><Trash2 size={16}/></button>
                                </div>
                            </div>
                        ))}
                        {pageContent.length === 0 && <div className="text-gray-500 text-center py-10 border border-dashed border-gray-800 rounded-xl">Nenhum conteúdo adicionado nesta página.</div>}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* MODAL DE EDIÇÃO DE BLOCO */}
      {editingBlock && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 w-full max-w-lg rounded-xl border border-gray-700 p-6 space-y-4">
                <h3 className="text-white font-bold uppercase">Editar Bloco</h3>
                
                <div>
                    <label className="text-gray-500 text-xs block mb-1">Tipo de Bloco</label>
                    <select className="w-full bg-black border border-gray-700 p-2 text-white rounded" value={editingBlock.type} onChange={e => setEditingBlock({...editingBlock, type: e.target.value})}>
                        <option value="video">Vídeo (YouTube)</option>
                        <option value="banner_large">Banner Grande (Full)</option>
                        <option value="banner_small">Banner Pequeno / Botão</option>
                    </select>
                </div>

                <div>
                    <label className="text-gray-500 text-xs block mb-1">Título</label>
                    <input className="w-full bg-black border border-gray-700 p-2 text-white rounded" value={editingBlock.title || ''} onChange={e => setEditingBlock({...editingBlock, title: e.target.value})}/>
                </div>
                
                {editingBlock.type === 'video' ? (
                    <div>
                        <label className="text-gray-500 text-xs block mb-1">ID do YouTube (ex: dQw4w9WgXcQ)</label>
                        <input className="w-full bg-black border border-gray-700 p-2 text-white rounded" value={editingBlock.media_url || ''} onChange={e => setEditingBlock({...editingBlock, media_url: e.target.value})}/>
                    </div>
                ) : (
                    <ImageUploader label="Imagem do Banner" currentImage={editingBlock.media_url} onUploadComplete={url => setEditingBlock({...editingBlock, media_url: url})} />
                )}

                {(editingBlock.type.includes('banner')) && (
                    <>
                        <div><label className="text-gray-500 text-xs block mb-1">Subtítulo</label><input className="w-full bg-black border border-gray-700 p-2 text-white rounded" value={editingBlock.subtitle || ''} onChange={e => setEditingBlock({...editingBlock, subtitle: e.target.value})}/></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-gray-500 text-xs block mb-1">Link de Ação</label><input className="w-full bg-black border border-gray-700 p-2 text-white rounded" value={editingBlock.action_link || ''} onChange={e => setEditingBlock({...editingBlock, action_link: e.target.value})}/></div>
                            <div><label className="text-gray-500 text-xs block mb-1">Texto do Botão</label><input className="w-full bg-black border border-gray-700 p-2 text-white rounded" value={editingBlock.action_label || ''} onChange={e => setEditingBlock({...editingBlock, action_label: e.target.value})}/></div>
                        </div>
                    </>
                )}

                <div>
                    <label className="text-gray-500 text-xs block mb-1">Ordem (1, 2, 3...)</label>
                    <input type="number" className="w-full bg-black border border-gray-700 p-2 text-white rounded" value={editingBlock.order_index || 0} onChange={e => setEditingBlock({...editingBlock, order_index: parseInt(e.target.value)})}/>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <button onClick={() => setEditingBlock(null)} className="px-4 py-2 text-gray-400 text-sm font-bold">Cancelar</button>
                    <button onClick={saveBlock} className="px-6 py-2 bg-blue-600 text-white rounded text-sm font-bold">Salvar Bloco</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}