import React, { useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';
import ImageUploader from '../components/ImageUploader';
import { Shield, LayoutGrid, Play, Users, FileText, Settings, ChevronLeft, Plus, Edit3, Trash2, Images } from 'lucide-react';
import { ToastContext } from '../ToastContext';

export default function AdminPanel({ updateSettings, settings }) {
  const [activeSection, setActiveSection] = useState('prompts');
  const [dataList, setDataList] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedPack, setSelectedPack] = useState(null); 
  const [packPrompts, setPackPrompts] = useState([]); 
  const { showToast } = useContext(ToastContext) || { showToast: alert };

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
      if (activeSection === 'settings') { await supabase.from('app_settings').update(editingItem).gt('id', 0); updateSettings(editingItem); showToast('Configurações salvas!'); return; }
      if (selectedPack && activeSection === 'prompts') {
          const { error } = await supabase.from('pack_items').upsert({ ...editingItem, pack_id: selectedPack.id }).eq('id', editingItem.id || 0);
          if (!error) { showToast('Prompt salvo!'); setEditingItem(null); fetchPackPrompts(selectedPack.id); } return;
      }
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
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-gray-800 pb-4 gap-4">
          <div><h2 className="text-3xl font-bold text-white flex items-center"><Shield className="text-blue-600 mr-3"/> Estúdio Admin</h2></div>
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">{['prompts', 'tutorials', 'users', 'news', 'settings'].map(id => (<button key={id} onClick={() => { setActiveSection(id); setEditingItem(id === 'settings' ? settings : null); setSelectedPack(null); }} className={`px-4 py-2 rounded-lg font-bold capitalize whitespace-nowrap ${activeSection === id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>{id === 'prompts' ? 'Séries (Packs)' : id}</button>))}</div>
      </div>

      {activeSection === 'settings' && editingItem && (
          <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 grid grid-cols-1 gap-6">
              <h3 className="text-white font-bold text-xl">Visuais</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div><ImageUploader label="Logo Menu" currentImage={editingItem.logo_menu_url} onUploadComplete={url=>setEditingItem({...editingItem,logo_menu_url:url})}/></div>
                  <div><ImageUploader label="Banner Topo" currentImage={editingItem.banner_url} onUploadComplete={url=>setEditingItem({...editingItem,banner_url:url})}/></div>
                  <div><ImageUploader label="Logo Header" currentImage={editingItem.logo_header_url} onUploadComplete={url=>setEditingItem({...editingItem,logo_header_url:url})}/></div>
              </div>
              <div><label className="text-gray-400 block mb-2">Posição</label><div className="flex gap-4">{['flex-start','center','flex-end'].map(pos=><button key={pos} onClick={()=>setEditingItem({...editingItem,logo_position:pos})} className={`px-4 py-2 rounded border ${editingItem.logo_position===pos?'bg-blue-600 border-blue-600 text-white':'bg-black border-gray-700 text-gray-400'}`}>{pos}</button>)}</div></div>
              <button onClick={handleSave} className="bg-green-600 text-white px-8 py-3 rounded font-bold w-full">Salvar</button>
          </div>
      )}

      {activeSection === 'prompts' && (
          selectedPack ? (
              <div className="animate-fadeIn">
                  <button onClick={() => setSelectedPack(null)} className="mb-6 text-gray-400 hover:text-white flex items-center font-bold text-lg"><ChevronLeft className="mr-2"/> Voltar</button>
                  <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                      <div className="relative h-48 bg-gray-800"><img src={selectedPack.cover} className="w-full h-full object-cover opacity-40"/><div className="absolute bottom-6 left-8 right-8 flex justify-between items-end"><div><span className="text-blue-500 font-bold text-xs uppercase">SÉRIE</span><h2 className="text-4xl font-bold text-white">{selectedPack.title}</h2></div><button onClick={() => setEditingItem({ title: '', prompt: '', url: '', is_featured: false })} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center"><Plus size={20} className="mr-2"/> Adicionar Episódio</button></div></div>
                      <div className="p-8 grid grid-cols-2 md:grid-cols-5 gap-4">
                          {packPrompts.map(prompt => (
                              <div key={prompt.id} className="bg-black border border-gray-800 rounded-xl overflow-hidden group relative aspect-square">
                                  <img src={prompt.url} className="w-full h-full object-cover"/>
                                  <div className="absolute inset-0 bg-black/80 hidden group-hover:flex flex-col items-center justify-center gap-2"><button onClick={()=>setEditingItem(prompt)} className="bg-blue-600 p-2 rounded-full text-white"><Edit3 size={18}/></button><button onClick={()=>handleDelete(prompt.id, true)} className="bg-red-600 p-2 rounded-full text-white"><Trash2 size={18}/></button></div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          ) : (
              <div className="animate-fadeIn">
                 <div className="flex justify-between items-center mb-6"><h3 className="text-xl text-white font-bold">Catálogo de Séries</h3><button onClick={() => setEditingItem({ title: '', description: '', price: 'R$ 0,00', cover: '', checkout_url: '' })} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center"><Plus size={20} className="mr-2"/> Nova Série</button></div>
                 <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                     {dataList.map(pack => (
                         <div key={pack.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition-all group relative cursor-pointer" onClick={() => { setSelectedPack(pack); fetchPackPrompts(pack.id); }}>
                             <div className="aspect-[2/3] relative"><img src={pack.cover} className="w-full h-full object-cover"/><div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="bg-white text-black px-3 py-1 rounded font-bold text-xs">Gerenciar</span></div></div>
                             <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100"><button onClick={(e)=>{e.stopPropagation();setEditingItem(pack)}} className="bg-black/80 text-blue-400 p-1.5 rounded"><Edit3 size={14}/></button><button onClick={(e)=>{e.stopPropagation();handleDelete(pack.id)}} className="bg-black/80 text-red-500 p-1.5 rounded"><Trash2 size={14}/></button></div>
                         </div>
                     ))}
                 </div>
              </div>
          )
      )}

      {activeSection !== 'settings' && activeSection !== 'prompts' && (
          <div className="animate-fadeIn">
            {activeSection !== 'users' && <div className="mb-6 flex justify-end"><button onClick={() => setEditingItem({})} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center"><Plus size={20} className="mr-2"/> Adicionar Novo</button></div>}
            {editingItem && !selectedPack && (
                <div className="bg-gray-900 p-6 rounded-xl border border-blue-500 mb-8">
                    <h3 className="text-white font-bold mb-4">Editor</h3>
                    <form onSubmit={handleSave} className="grid grid-cols-1 gap-4">
                        {activeSection === 'users' && <select className="bg-black border border-gray-700 p-3 rounded text-white" value={editingItem.plan || 'free'} onChange={e => setEditingItem({...editingItem, plan: e.target.value})}><option value="free">Free</option><option value="pro">Pro</option><option value="gold">Gold</option><option value="admin">Admin</option></select>}
                        {(activeSection === 'prompts' || activeSection === 'tutorials' || activeSection === 'news' || selectedPack) && (
                            Object.keys(editingItem).map(key => {
                                if(key === 'id' || key === 'created_at' || key === 'pack_id' || key === 'is_featured') return null;
                                if(key === 'cover' || key === 'image' || key === 'thumbnail' || key === 'url') return <div key={key}><ImageUploader label={key} currentImage={editingItem[key]} onUploadComplete={(url) => setEditingItem({...editingItem, [key]: url})} /></div>
                                return <div key={key}><label className="text-gray-500 text-xs uppercase font-bold mb-1 block">{key}</label><input type="text" className="w-full bg-black border border-gray-700 p-3 rounded text-white" value={editingItem[key] || ''} onChange={e => setEditingItem({...editingItem, [key]: e.target.value})}/></div>
                            })
                        )}
                        <div className="flex justify-end gap-2 mt-4"><button type="button" onClick={() => setEditingItem(null)} className="text-gray-500 font-bold">Cancelar</button><button type="submit" className="bg-green-600 text-white px-6 py-2 rounded font-bold">Salvar</button></div>
                    </form>
                </div>
            )}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <table className="w-full text-left text-sm text-gray-400"><thead className="bg-black text-xs uppercase font-bold"><tr><th className="p-4">Info</th><th className="p-4">Detalhes</th><th className="p-4 text-right">Ações</th></tr></thead>
                    <tbody className="divide-y divide-gray-800">{dataList.map(item => (<tr key={item.id} className="hover:bg-gray-800/50"><td className="p-4">{activeSection === 'users' ? item.name : item.title}</td><td className="p-4">{activeSection === 'users' ? item.plan : (item.video_url || item.date)}</td><td className="p-4 text-right"><button onClick={() => setEditingItem(item)} className="text-blue-400 mr-3"><Edit3 size={16}/></button>{activeSection !== 'users' && <button onClick={() => handleDelete(item.id)} className="text-red-500"><Trash2 size={16}/></button>}</td></tr>))}</tbody>
                </table>
            </div>
          </div>
      )}
    </div>
  );
}