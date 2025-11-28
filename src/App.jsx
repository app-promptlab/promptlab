import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  LayoutDashboard, Images, Star, Zap, BookOpen, User, LogOut, Menu, X, 
  Heart, Copy, Check, ExternalLink, Camera, Edit3, Lock, Unlock, 
  ShoppingCart, Sparkles, Play, Mail, ArrowRight, Loader2, Database, 
  Trash2, Bold, Italic, Underline, Link as LinkIcon, List, AlignLeft, 
  Facebook, Instagram, Music, Key, ChevronLeft, ChevronRight, Crown,
  Shield, Save, Plus, Search, Users,
  ShoppingBag, Settings, UploadCloud,
  Twitter, Linkedin, Globe, Github, HelpCircle, LayoutGrid, Monitor, Home, FileText
} from 'lucide-react';

// --- 1. CONEXÃO SUPABASE (GLOBAL E ÚNICA) ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- 2. COMPONENTES AUXILIARES ---

// Uploader de Imagem (Recebe showToast via props para não quebrar)
function ImageUploader({ currentImage, onUploadComplete, label, compact = false, showToast }) {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (event) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;
      const file = event.target.files[0];
      const fileName = `${Math.random()}.${file.name.split('.').pop()}`;
      const { error } = await supabase.storage.from('uploads').upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage.from('uploads').getPublicUrl(fileName);
      onUploadComplete(data.publicUrl);
      if(showToast) showToast("Imagem enviada!");
    } catch (error) { alert('Erro: ' + error.message); } finally { setUploading(false); }
  };

  return (
    <div className={`relative group ${compact ? '' : 'mb-4'}`}>
      {!compact && <label className="text-gray-400 text-sm font-bold block mb-2">{label}</label>}
      <div className="flex items-center gap-3">
         <input type="file" accept="image/*" onChange={uploadImage} className="hidden" id={`file-${label}`} disabled={uploading}/>
         <label htmlFor={`file-${label}`} className={`cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-lg flex items-center ${uploading ? 'opacity-50' : ''}`}>
             {uploading ? <Loader2 size={16} className="animate-spin mr-2"/> : <UploadCloud size={16} className="mr-2"/>}
             {uploading ? '...' : (compact ? 'Trocar' : 'Escolher')}
         </label>
         {!compact && currentImage && <img src={currentImage} className="h-10 w-10 rounded object-cover border border-gray-700"/>}
      </div>
    </div>
  );
}

// Modal de Detalhes
function Modal({ item, onClose, onCopy }) {
  if (!item) return null;
  return (
    <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
        <div className="bg-gray-900 w-full max-w-4xl rounded-2xl border border-blue-500/50 shadow-2xl overflow-hidden flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>
            <div className="md:w-1/2 bg-black flex items-center justify-center"><img src={item.url} className="w-full h-full object-contain max-h-[60vh] md:max-h-[80vh]"/></div>
            <div className="md:w-1/2 p-8 flex flex-col">
                <div className="flex justify-between items-start mb-6"><h3 className="text-2xl font-bold text-white">{item.title || 'Prompt'}</h3><button onClick={onClose} className="text-gray-400 hover:text-white"><X size={28}/></button></div>
                <div className="bg-black border border-gray-800 p-6 rounded-xl flex-1 overflow-y-auto custom-scrollbar mb-6"><p className="text-gray-300 font-mono text-sm leading-relaxed">{item.prompt}</p></div>
                <button onClick={() => onCopy(item.prompt)} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center mb-3"><Copy className="mr-2"/> COPIAR PROMPT</button>
                <button className="w-full border border-gray-700 text-gray-400 font-bold py-3 rounded-xl hover:bg-gray-800 hover:text-white transition-all flex items-center justify-center"><Heart className="mr-2"/> FAVORITAR</button>
            </div>
        </div>
    </div>
  );
}

// Sidebar Navigation
function Sidebar({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen, sidebarMinimized, setSidebarMinimized, appSettings, isAdmin, onLogout }) {
  const handleNav = (id) => { setActiveTab(id); setSidebarOpen(false); };
  
  const SidebarItem = ({ icon: Icon, label, id, isLogout }) => (
    <button onClick={() => isLogout ? onLogout() : handleNav(id)} className={`flex items-center w-full rounded-xl transition-all duration-200 group font-medium ${sidebarMinimized ? 'justify-center px-2 py-4' : 'px-4 py-3'} ${activeTab === id && !isLogout ? 'text-blue-500 bg-blue-500/10 border-l-4 border-blue-500 rounded-l-none' : 'text-gray-400 hover:text-white hover:bg-gray-900'} ${isLogout ? 'hover:text-red-400 hover:bg-red-500/10' : ''}`}>
      <Icon size={sidebarMinimized ? 28 : 20} className={`${sidebarMinimized ? '' : 'mr-3'}`} />{!sidebarMinimized && <span className="truncate">{label}</span>}
    </button>
  );

  return (
    <>
      <aside className={`hidden md:flex flex-col fixed inset-y-0 left-0 z-50 bg-black border-r border-gray-800 transition-all duration-300 ${sidebarMinimized ? 'w-24' : 'w-64'}`}>
        <div className={`p-6 flex items-center ${sidebarMinimized ? 'justify-center' : 'justify-between'} border-b border-gray-800 h-20`}>
           {!sidebarMinimized ? (appSettings.logo_menu_url ? <img src={appSettings.logo_menu_url} className="h-8 object-contain"/> : <span className="text-xl font-bold text-white">PromptLab</span>) : (<Menu size={28} className="text-blue-600"/>)}
           <button onClick={() => setSidebarMinimized(!sidebarMinimized)} className="text-gray-400 hover:text-white"><Menu size={24} /></button>
        </div>
        <nav className="space-y-2 mt-4 flex-1 overflow-y-auto px-2">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" id="dashboard" />
          <SidebarItem icon={ShoppingBag} label="Loja" id="loja" />
          <SidebarItem icon={LayoutGrid} label="Prompts" id="prompts" />
          <SidebarItem icon={Play} label="Tutoriais" id="tutorials" />
          <SidebarItem icon={Heart} label="Favoritos" id="favorites" />
          <div className="my-4 border-t border-gray-800 mx-2"></div>
          {isAdmin && <SidebarItem icon={Shield} label="Admin" id="admin" />}
          <SidebarItem icon={User} label="Perfil" id="profile" />
        </nav>
        <div className="p-4"><SidebarItem icon={LogOut} label="Sair" isLogout /></div>
      </aside>
      <div className="md:hidden fixed bottom-0 w-full bg-gray-900 border-t border-gray-800 z-50 flex justify-around items-center p-3 pb-5 safe-area-bottom">
          <button onClick={() => handleNav('dashboard')} className={`flex flex-col items-center ${activeTab==='dashboard'?'text-blue-500':'text-gray-500'}`}><Home size={24}/><span className="text-[10px] mt-1">Home</span></button>
          <button onClick={() => handleNav('loja')} className={`flex flex-col items-center ${activeTab==='loja'?'text-blue-500':'text-gray-500'}`}><ShoppingBag size={24}/><span className="text-[10px] mt-1">Loja</span></button>
          <div className="-mt-6"><button onClick={() => handleNav('prompts')} className="bg-blue-600 text-white p-4 rounded-full shadow-lg border-4 border-black"><Images size={24}/></button></div>
          <button onClick={() => handleNav('tutorials')} className={`flex flex-col items-center ${activeTab==='tutorials'?'text-blue-500':'text-gray-500'}`}><Play size={24}/><span className="text-[10px] mt-1">Aulas</span></button>
          <button onClick={() => handleNav('profile')} className={`flex flex-col items-center ${activeTab==='profile'?'text-blue-500':'text-gray-500'}`}><User size={24}/><span className="text-[10px] mt-1">Perfil</span></button>
      </div>
    </>
  );
}

// --- 3. PÁGINAS (DEFINIDAS NO MESMO ARQUIVO PARA EVITAR ERRO DE IMPORT) ---

function Dashboard({ user, settings, changeTab }) {
  const [featuredPrompts, setFeaturedPrompts] = useState([]);
  const [featuredTutorials, setFeaturedTutorials] = useState([]);
  const [news, setNews] = useState([]);

  useEffect(() => {
      supabase.from('pack_items').select('*').eq('is_featured', true).limit(10).then(({data}) => setFeaturedPrompts(data || []));
      supabase.from('tutorials_videos').select('*').eq('is_featured', true).limit(10).then(({data}) => setFeaturedTutorials(data || []));
      supabase.from('news').select('*').limit(2).order('id', {ascending:false}).then(({data}) => setNews(data || []));
  }, []);

  return (
    <div className="w-full animate-fadeIn pb-20">
      <div className="relative w-full h-64 md:h-80 bg-gray-900 overflow-hidden">
          {settings.banner_url && <img src={settings.banner_url} className="w-full h-full object-cover opacity-80" />}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black"></div>
          <div className={`absolute inset-0 p-8 flex items-center ${settings.logo_position === 'flex-start' ? 'justify-start' : settings.logo_position === 'flex-end' ? 'justify-end' : 'justify-center'}`}>
              {settings.logo_header_url && <img src={settings.logo_header_url} className="h-24 md:h-32 object-contain drop-shadow-2xl hover:scale-105 transition-transform"/>}
          </div>
      </div>
      <div className="max-w-full mx-auto px-6 -mt-8 relative z-10 space-y-12">
          <div className="flex justify-between items-end pb-4 border-b border-gray-800">
            <div><h2 className="text-3xl font-bold text-white mb-1">Olá, {user.name.split(' ')[0]}</h2><p className="text-gray-400">O que vamos criar hoje?</p></div>
          </div>
          {featuredPrompts.length > 0 && (
              <div><h3 className="text-xl font-bold text-white mb-4 flex items-center"><Images className="mr-2 text-blue-500"/> Destaques</h3><div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-700">{featuredPrompts.map(p => (<div key={p.id} className="min-w-[200px] aspect-[3/4] bg-gray-800 rounded-xl overflow-hidden relative group cursor-pointer border border-gray-700 hover:border-blue-500 transition-all"><img src={p.url} className="w-full h-full object-cover"/><div className="absolute bottom-0 inset-x-0 bg-black/80 p-2 text-xs text-white truncate">{p.title}</div></div>))}</div></div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button onClick={() => changeTab('prompts')} className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex flex-col items-center gap-2 hover:border-blue-500"><Search className="text-blue-500"/> <span className="text-white font-bold text-sm">Buscar</span></button>
              <button onClick={() => changeTab('loja')} className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex flex-col items-center gap-2 hover:border-green-500"><ShoppingBag className="text-green-500"/> <span className="text-white font-bold text-sm">Loja</span></button>
              <button onClick={() => changeTab('tutorials')} className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex flex-col items-center gap-2 hover:border-purple-500"><Play className="text-purple-500"/> <span className="text-white font-bold text-sm">Aulas</span></button>
              <button onClick={() => changeTab('generator')} className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex flex-col items-center gap-2 hover:border-yellow-500"><Zap className="text-yellow-500"/> <span className="text-white font-bold text-sm">Geradores</span></button>
          </div>
      </div>
    </div>
  );
}

function PromptsGallery({ onCopy, showToast }) {
    const [prompts, setPrompts] = useState([]);
    const [packs, setPacks] = useState([]);
    const [modalItem, setModalItem] = useState(null);

    useEffect(() => { 
        supabase.from('products').select('*').then(({data}) => setPacks(data || []));
        supabase.from('pack_items').select('*').then(({data}) => setPrompts(data || [])); 
    }, []);

    return (
        <div className="max-w-7xl mx-auto animate-fadeIn px-6 pb-20 pt-8">
             <div className="mb-12"><h2 className="text-xl font-bold text-gray-400 uppercase tracking-widest mb-6 border-l-4 border-blue-600 pl-3">Nossas Séries</h2><div className="grid grid-cols-3 md:grid-cols-6 gap-4">{packs.map(pack => (<div key={pack.id} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer"><img src={pack.cover} className="aspect-[2/3] w-full object-cover"/></div>))}</div></div>
             <div><h2 className="text-3xl font-bold text-white mb-8 flex items-center"><Sparkles className="mr-2 text-blue-500"/> Feed de Prompts</h2><div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">{prompts.filter(i => !i.pack_id).map(item => (<div key={item.id} onClick={() => setModalItem(item)} className="aspect-[3/4] bg-gray-900 rounded-xl overflow-hidden relative group hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:border-2 border-blue-500 transition-all duration-300 border border-gray-800 cursor-pointer"><img src={item.url} className="w-full h-full object-cover"/><div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-all"><div className="bg-blue-600 text-white px-4 py-1.5 rounded-full font-bold text-xs shadow-lg flex items-center"><Copy size={12} className="mr-1"/> VER</div></div></div>))}</div></div>
             <Modal item={modalItem} onClose={() => setModalItem(null)} onCopy={(txt) => { onCopy(txt); if(showToast) showToast("Copiado!"); }} />
        </div>
    );
}

function StorePage({ packs, onPurchase }) {
    return (
        <div className="max-w-7xl mx-auto animate-fadeIn px-6 pt-8">
             <h2 className="text-3xl font-bold text-white mb-8">Loja Oficial</h2>
             <div className="flex items-center justify-between mb-6"><h3 className="text-2xl font-bold text-white flex items-center"><Images size={24} className="text-blue-500 mr-3"/> Packs Disponíveis</h3></div>
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">{packs.map(pack => (<div key={pack.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-blue-600 transition-all cursor-pointer group shadow-lg"><div className="aspect-square relative overflow-hidden"><img src={pack.cover} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/><div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 to-transparent"><h4 className="text-white font-bold text-sm md:text-base leading-tight">{pack.title}</h4><p className="text-blue-500 font-bold text-xs mt-1">{pack.price}</p></div></div><button onClick={() => onPurchase(pack.id, pack.checkout_url)} className="w-full bg-blue-600 text-white font-bold py-2 text-sm hover:bg-blue-500 transition-colors">COMPRAR</button></div>))}</div>
        </div>
    );
}

function TutorialsPage() {
    const [tutorials, setTutorials] = useState([]);
    useEffect(() => { supabase.from('tutorials_videos').select('*').order('id', { ascending: true }).then(({ data }) => setTutorials(data || [])); }, []);
    return (
        <div className="max-w-3xl mx-auto pb-20 animate-fadeIn px-6 pt-8">
             <div className="text-center mb-12"><h2 className="text-5xl font-black text-white mb-2 tracking-tighter">TUTORIAIS</h2><p className="text-blue-600 font-bold tracking-[0.2em] text-sm uppercase">Ferramentas de Criação</p></div>
             <div className="space-y-12">{tutorials.map(video => (<div key={video.id} className="bg-black border border-gray-800 rounded-2xl overflow-hidden shadow-2xl hover:border-blue-900 transition-all"><div className="relative aspect-video group cursor-pointer"><img src={video.thumbnail} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"/><div className="absolute inset-0 flex items-center justify-center"><div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform"><Play className="ml-1 text-white fill-white w-8 h-8"/></div></div><a href={video.video_url} target="_blank" className="absolute inset-0 z-10"></a></div><div className="p-6 text-center bg-gray-900"><a href={video.link_action || '#'} target="_blank" className="text-blue-500 hover:text-white font-bold text-sm uppercase tracking-wider border-b-2 border-blue-500/30 pb-1 hover:border-white transition-colors">{video.link_label || 'Acessar Recurso'}</a></div></div>))}</div>
        </div>
    );
}

function AdminPanel({ updateSettings, settings, showToast }) {
  const [activeSection, setActiveSection] = useState('prompts');
  const [dataList, setDataList] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedPack, setSelectedPack] = useState(null); 
  const [packPrompts, setPackPrompts] = useState([]); 

  const fetchData = async () => {
    let query;
    if (activeSection === 'users') query = supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (activeSection === 'prompts') query = supabase.from('products').select('*').order('id', { ascending: true });
    if (activeSection === 'tutorials') query = supabase.from('tutorials_videos').select('*').order('id', { ascending: true });
    if (activeSection === 'news') query = supabase.from('news').select('*').order('id', { ascending: false });
    if (query) { const { data } = await query; setDataList(data || []); }
  };

  const fetchPackPrompts = async (packId) => {
      const { data } = await supabase.from('pack_items').select('*').eq('pack_id', packId).order('created_at', { ascending: false });
      setPackPrompts(data || []);
  };

  useEffect(() => { fetchData(); setSelectedPack(null); }, [activeSection]);

  const handleSave = async (e) => {
      e.preventDefault();
      if (activeSection === 'settings') { await supabase.from('app_settings').update(editingItem).gt('id', 0); updateSettings(editingItem); showToast('Salvo!'); return; }
      if (selectedPack && activeSection === 'prompts') { const { error } = await supabase.from('pack_items').upsert({ ...editingItem, pack_id: selectedPack.id }).eq('id', editingItem.id || 0); if (!error) { showToast('Salvo!'); setEditingItem(null); fetchPackPrompts(selectedPack.id); } return; }
      let table = activeSection === 'users' ? 'profiles' : activeSection === 'prompts' ? 'products' : activeSection === 'tutorials' ? 'tutorials_videos' : activeSection;
      let payload = activeSection === 'users' ? { plan: editingItem.plan } : editingItem;
      const { error } = await supabase.from(table).upsert(payload).eq('id', editingItem.id || 0);
      if(!error) { showToast('Salvo!'); setEditingItem(null); fetchData(); }
  };

  const handleDelete = async (id, isPrompt = false) => {
      if(!confirm('Tem certeza?')) return;
      let table = isPrompt ? 'pack_items' : activeSection === 'prompts' ? 'products' : activeSection === 'tutorials' ? 'tutorials_videos' : activeSection;
      await supabase.from(table).delete().eq('id', id);
      if(isPrompt && selectedPack) fetchPackPrompts(selectedPack.id); else fetchData();
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-fadeIn px-6 pt-8">
      <div className="flex gap-2 mb-8 overflow-x-auto">{['prompts', 'tutorials', 'users', 'news', 'settings'].map(id => (<button key={id} onClick={() => { setActiveSection(id); setEditingItem(id === 'settings' ? settings : null); setSelectedPack(null); }} className={`px-4 py-2 rounded-lg font-bold capitalize whitespace-nowrap ${activeSection === id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>{id === 'prompts' ? 'Séries' : id}</button>))}</div>
      
      {activeSection === 'settings' && editingItem && (
          <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 grid grid-cols-1 gap-6">
              <div><ImageUploader label="Logo Menu" currentImage={editingItem.logo_menu_url} onUploadComplete={url=>setEditingItem({...editingItem,logo_menu_url:url})} showToast={showToast}/></div>
              <div><ImageUploader label="Banner" currentImage={editingItem.banner_url} onUploadComplete={url=>setEditingItem({...editingItem,banner_url:url})} showToast={showToast}/></div>
              <div><ImageUploader label="Logo Header" currentImage={editingItem.logo_header_url} onUploadComplete={url=>setEditingItem({...editingItem,logo_header_url:url})} showToast={showToast}/></div>
              <div><label className="text-gray-400 block mb-2">Posição</label><div className="flex gap-4">{['flex-start','center','flex-end'].map(pos=><button key={pos} onClick={()=>setEditingItem({...editingItem,logo_position:pos})} className={`px-4 py-2 rounded border ${editingItem.logo_position===pos?'bg-blue-600 border-blue-600 text-white':'bg-black border-gray-700 text-gray-400'}`}>{pos}</button>)}</div></div>
              <button onClick={handleSave} className="bg-green-600 text-white px-8 py-3 rounded font-bold w-full">Salvar</button>
          </div>
      )}
      
      {activeSection === 'prompts' && (
          selectedPack ? (
              <div className="animate-fadeIn">
                  <button onClick={() => setSelectedPack(null)} className="mb-6 text-gray-400 hover:text-white flex items-center font-bold"><ChevronLeft className="mr-2"/> Voltar</button>
                  <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
                      <div className="flex justify-between mb-4"><h2 className="text-2xl text-white font-bold">{selectedPack.title}</h2><button onClick={() => setEditingItem({ title: '', prompt: '', url: '', is_featured: false })} className="bg-blue-600 text-white px-4 py-2 rounded font-bold flex items-center"><Plus size={16} className="mr-2"/> Prompt</button></div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">{packPrompts.map(p => (<div key={p.id} className="relative group aspect-square bg-black rounded border border-gray-800"><img src={p.url} className="w-full h-full object-cover"/><div className="absolute inset-0 bg-black/80 hidden group-hover:flex flex-col items-center justify-center gap-2"><button onClick={()=>setEditingItem(p)} className="bg-blue-600 p-2 rounded text-white"><Edit3 size={16}/></button><button onClick={()=>handleDelete(p.id, true)} className="bg-red-600 p-2 rounded text-white"><Trash2 size={16}/></button></div></div>))}</div>
                  </div>
              </div>
          ) : (
              <div className="animate-fadeIn">
                 <div className="flex justify-between items-center mb-6"><h3 className="text-xl text-white font-bold">Séries</h3><button onClick={() => setEditingItem({ title: '', description: '', price: 'R$ 0,00', cover: '', checkout_url: '' })} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center"><Plus size={20} className="mr-2"/> Nova</button></div>
                 <div className="grid grid-cols-2 md:grid-cols-5 gap-6">{dataList.map(p => (<div key={p.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition-all group relative cursor-pointer" onClick={() => { setSelectedPack(p); fetchPackPrompts(p.id); }}><div className="aspect-[2/3] relative"><img src={p.cover} className="w-full h-full object-cover"/><div className="absolute bottom-0 p-2 w-full bg-black/80 text-white font-bold">{p.title}</div></div><div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100"><button onClick={(e)=>{e.stopPropagation();setEditingItem(p)}} className="bg-black p-1 rounded text-blue-400"><Edit3 size={14}/></button><button onClick={(e)=>{e.stopPropagation();handleDelete(p.id)}} className="bg-black p-1 rounded text-red-500"><Trash2 size={14}/></button></div></div>))}</div>
              </div>
          )
      )}

      {editingItem && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-gray-900 w-full max-w-2xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
                  <div className="p-6 border-b border-gray-800 flex justify-between items-center"><h3 className="text-xl font-bold text-white">Editor</h3><button onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-white"><X/></button></div>
                  <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                      <form onSubmit={handleSave} className="space-y-6">
                          {activeSection === 'users' && <select className="w-full bg-black border border-gray-700 p-4 rounded text-white" value={editingItem.plan || 'free'} onChange={e => setEditingItem({...editingItem, plan: e.target.value})}><option value="free">Free</option><option value="pro">Pro</option><option value="gold">Gold</option><option value="admin">Admin</option></select>}
                          {(activeSection === 'prompts' || activeSection === 'tutorials' || activeSection === 'news' || selectedPack) && Object.keys(editingItem).map(key => {
                              if(['id','created_at','pack_id'].includes(key)) return null;
                              if(['cover','url','thumbnail','image'].includes(key)) return <ImageUploader key={key} label={key} currentImage={editingItem[key]} onUploadComplete={(url) => setEditingItem({...editingItem, [key]: url})} showToast={showToast}/>;
                              return <div key={key}><label className="text-gray-500 text-xs uppercase font-bold mb-1 block">{key}</label><input type="text" className="w-full bg-black border border-gray-700 p-4 rounded-xl text-white" value={editingItem[key] || ''} onChange={e => setEditingItem({...editingItem, [key]: e.target.value})}/></div>
                          })}
                          <div className="flex justify-end gap-4 pt-4"><button type="button" onClick={() => setEditingItem(null)} className="px-6 py-3 font-bold text-gray-400">Cancelar</button><button type="submit" className="bg-green-600 text-white px-8 py-3 rounded font-bold">Salvar</button></div>
                      </form>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}

function Profile({ user, setUser, showToast }) {
  const [activeTab, setActiveTab] = useState('perfil');
  const [formData, setFormData] = useState({ name: user.name || '', phone: user.phone || '', avatar: user.avatar, cover: user.cover });
  
  const handleSave = async () => {
      const { error } = await supabase.from('profiles').update(formData).eq('id', user.id);
      if(!error) { setUser({ ...user, ...formData }); showToast("Perfil salvo!"); } else alert("Erro ao salvar");
  };

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn p-8">
        <h2 className="text-3xl font-bold text-white mb-8">Configurações</h2>
        <div className="mb-10">
           <div className="h-48 w-full rounded-t-xl bg-gray-800 relative overflow-hidden group"><img src={formData.cover} className="w-full h-full object-cover opacity-80"/><div className="absolute bottom-4 right-4"><ImageUploader compact label="Capa" onUploadComplete={url => setFormData({...formData, cover: url})} /></div></div>
           <div className="px-8 relative"><div className="w-32 h-32 rounded-full border-4 border-black bg-gray-700 -mt-16 overflow-hidden relative group"><img src={formData.avatar} className="w-full h-full object-cover"/><div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center"><ImageUploader compact label="Avatar" onUploadComplete={url => setFormData({...formData, avatar: url})} /></div></div></div>
        </div>
        <div className="grid grid-cols-1 gap-6">
            <div><label className="text-white text-sm font-bold mb-2 block">Nome</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-white outline-none"/></div>
            <div><label className="text-white text-sm font-bold mb-2 block">Telefone</label><input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-white outline-none"/></div>
            <button onClick={handleSave} className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg mt-4 w-fit">Salvar Alterações</button>
        </div>
    </div>
  );
}

// --- 4. APP PRINCIPAL (CONTROLLER) ---
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appSettings, setAppSettings] = useState({ logo_menu_url: '', banner_url: '', logo_header_url: '', logo_position: 'center' });
  const [toast, setToast] = useState(null);
  const [packs, setPacks] = useState([]);

  const showToast = (message) => { setToast(message); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    const init = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
            // TRAVA ADMIN (Seu email)
            const isAdmin = session.user.email === 'app.promptlab@gmail.com' || profile?.plan === 'admin';
            setUser({ ...session.user, ...profile, plan: isAdmin ? 'admin' : profile?.plan || 'free' });
        }
        const { data: settings } = await supabase.from('app_settings').select().single();
        if (settings) setAppSettings(settings);
        const { data: prods } = await supabase.from('products').select('*');
        if (prods) setPacks(prods);
        setLoading(false);
    };
    init();
  }, []);

  const handleLogin = async (email, password, name, isRegister) => {
      setLoading(true);
      const { data, error } = isRegister 
        ? await supabase.auth.signUp({ email, password, options: { data: { name } } })
        : await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
      else if (data.user) window.location.reload(); // Simples reload para carregar tudo limpo
      setLoading(false);
  };

  const handlePurchase = (id, url) => {
      if(url) window.open(url, '_blank');
      else if(confirm('Confirmar compra?')) {
          supabase.from('user_purchases').insert({ user_id: user.id, product_id: id }).then(() => showToast('Compra realizada!'));
      }
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-blue-600"><Loader2 size={48} className="animate-spin"/></div>;
  if (!user) return <AuthScreen onLogin={handleLogin} />;

  const isAdmin = user.plan === 'admin';

  return (
    <div className="flex h-screen bg-black text-gray-100 font-sans overflow-hidden">
        {/* SIDEBAR */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-50 bg-black border-r border-gray-800 w-64 transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
            <div className="p-6 flex justify-between items-center border-b border-gray-800 h-20">
                {appSettings.logo_menu_url ? <img src={appSettings.logo_menu_url} className="h-8 object-contain"/> : <span className="font-bold text-xl">PromptLab</span>}
                <button onClick={() => setSidebarOpen(false)} className="lg:hidden"><X/></button>
            </div>
            <nav className="p-4 space-y-2">
                <button onClick={() => {setActiveTab('dashboard'); setSidebarOpen(false)}} className={`flex items-center w-full px-4 py-3 rounded-lg ${activeTab==='dashboard'?'bg-blue-600/10 text-blue-500':'text-gray-400 hover:text-white'}`}><LayoutDashboard size={20} className="mr-3"/> Dashboard</button>
                <button onClick={() => {setActiveTab('loja'); setSidebarOpen(false)}} className={`flex items-center w-full px-4 py-3 rounded-lg ${activeTab==='loja'?'bg-blue-600/10 text-blue-500':'text-gray-400 hover:text-white'}`}><ShoppingBag size={20} className="mr-3"/> Loja</button>
                <button onClick={() => {setActiveTab('prompts'); setSidebarOpen(false)}} className={`flex items-center w-full px-4 py-3 rounded-lg ${activeTab==='prompts'?'bg-blue-600/10 text-blue-500':'text-gray-400 hover:text-white'}`}><LayoutGrid size={20} className="mr-3"/> Prompts</button>
                <button onClick={() => {setActiveTab('tutorials'); setSidebarOpen(false)}} className={`flex items-center w-full px-4 py-3 rounded-lg ${activeTab==='tutorials'?'bg-blue-600/10 text-blue-500':'text-gray-400 hover:text-white'}`}><Play size={20} className="mr-3"/> Tutoriais</button>
                <button onClick={() => {setActiveTab('favorites'); setSidebarOpen(false)}} className={`flex items-center w-full px-4 py-3 rounded-lg ${activeTab==='favorites'?'bg-blue-600/10 text-blue-500':'text-gray-400 hover:text-white'}`}><Heart size={20} className="mr-3"/> Favoritos</button>
                {isAdmin && <button onClick={() => {setActiveTab('admin'); setSidebarOpen(false)}} className={`flex items-center w-full px-4 py-3 rounded-lg ${activeTab==='admin'?'bg-blue-600/10 text-blue-500':'text-gray-400 hover:text-white'}`}><Shield size={20} className="mr-3"/> Admin</button>}
                <button onClick={() => {setActiveTab('profile'); setSidebarOpen(false)}} className={`flex items-center w-full px-4 py-3 rounded-lg ${activeTab==='profile'?'bg-blue-600/10 text-blue-500':'text-gray-400 hover:text-white'}`}><User size={20} className="mr-3"/> Perfil</button>
                <button onClick={async () => { await supabase.auth.signOut(); setUser(null); }} className="flex items-center w-full px-4 py-3 mt-4 text-red-400 hover:bg-red-900/20 rounded-lg"><LogOut size={20} className="mr-3"/> Sair</button>
            </nav>
        </aside>
        
        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-black">
            <header className="lg:hidden flex items-center p-4 border-b border-gray-800 bg-gray-900"><button onClick={() => setSidebarOpen(true)}><Menu/></button><span className="ml-4 font-bold">Menu</span></header>
            <main className="flex-1 overflow-y-auto p-0 pb-20 scrollbar-thin scrollbar-thumb-gray-800">
                {activeTab === 'dashboard' && <Dashboard user={user} settings={appSettings} changeTab={setActiveTab}/>}
                {activeTab === 'prompts' && <PromptsGallery onCopy={msg => showToast(msg)}/>}
                {activeTab === 'tutorials' && <TutorialsPage/>}
                {activeTab === 'loja' && <StorePage packs={packs} onPurchase={handlePurchase}/>}
                {activeTab === 'admin' && isAdmin && <AdminPanel updateSettings={setAppSettings} settings={appSettings} showToast={showToast}/>}
                {activeTab === 'profile' && <Profile user={user} setUser={setUser} showToast={showToast}/>}
                {activeTab === 'favorites' && <div className="text-white p-10">Em breve...</div>}
                {activeTab === 'generator' && <div className="text-white p-10">Em breve...</div>}
            </main>
        </div>
        
        {toast && <div className="fixed top-4 right-4 z-[200] bg-blue-600 text-white px-6 py-3 rounded-xl shadow-2xl animate-fadeIn flex items-center"><Check size={16} className="mr-2"/> {toast}</div>}
    </div>
  );
}

// --- 5. COMPONENTES AUXILIARES (WARP SPEED LOGIN) ---
function AuthScreen({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const canvasRef = useRef(null);
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => { supabase.from('app_settings').select('logo_header_url').single().then(({data}) => { if(data) setLogoUrl(data.logo_header_url); }); }, []);

  useEffect(() => {
    const canvas = canvasRef.current; const ctx = canvas.getContext('2d');
    let width = window.innerWidth; let height = window.innerHeight; canvas.width = width; canvas.height = height;
    let stars = []; for(let i=0; i<200; i++) stars.push({x: (Math.random()-0.5)*width, y: (Math.random()-0.5)*height, z: Math.random()*width});
    const render = () => {
        ctx.fillStyle = 'black'; ctx.fillRect(0, 0, width, height); ctx.fillStyle = 'white';
        stars.forEach(star => {
            star.z -= 2; if(star.z <= 0) { star.z = width; star.x = (Math.random()-0.5)*width; star.y = (Math.random()-0.5)*height; }
            const x = (star.x / star.z) * width + width/2; const y = (star.y / star.z) * height + height/2; const size = (1 - star.z / width) * 3;
            if(x>0 && x<width && y>0 && y<height) { ctx.globalAlpha = (1 - star.z / width); ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI*2); ctx.fill(); }
        });
        requestAnimationFrame(render);
    };
    render();
  }, []);
  
  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden font-sans select-none">
      <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-60" />
      <div className="w-full max-w-md bg-gray-900/60 backdrop-blur-xl p-10 rounded-3xl border border-white/10 relative z-10 shadow-2xl">
        <div className="text-center mb-8">
            {logoUrl ? <img src={logoUrl} className="h-24 mx-auto mb-6 object-contain drop-shadow-2xl"/> : <h2 className="text-5xl font-bold text-white mb-4 tracking-tighter">PromptLab</h2>}
            <p className="text-gray-400 text-sm font-medium tracking-widest uppercase">{isRegister ? "Criar Conta" : "Acessar Plataforma"}</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onLogin(email, password, name, isRegister); }} className="space-y-6">
          {isRegister && <div className="group"><input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-black/40 border border-gray-700 rounded-xl p-4 text-white outline-none" placeholder="Nome completo" /></div>}
          <div className="group"><input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black/40 border border-gray-700 rounded-xl p-4 text-white outline-none" placeholder="Seu e-mail" /></div>
          <div className="group"><input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black/40 border border-gray-700 rounded-xl p-4 text-white outline-none" placeholder="Sua senha" /></div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg uppercase tracking-widest text-xs mt-4">{isRegister ? "Cadastrar" : "Entrar"}</button>
        </form>
        <button onClick={() => setIsRegister(!isRegister)} className="w-full text-center mt-8 text-xs text-gray-500 hover:text-white transition-colors">{isRegister ? "Já tenho conta? Login" : "Não tem conta? Criar"}</button>
      </div>
    </div>
  );
}