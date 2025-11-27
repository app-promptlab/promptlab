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
    
    if (query) { 
        const { data } = await query; 
        setDataList(data || []); 
    }
  };

  const fetchPackPrompts = async (packId) => {
      const { data } = await supabase.from('pack_items').select('*').eq('pack_id', packId).order('created_at', { ascending: false });
      setPackPrompts(data || []);
  };

  useEffect(() => { fetchData(); setSelectedPack(null); }, [activeSection]);

  const handleSave = async (e) => {
      e.preventDefault();
      
      // Salvando Configurações
      if (activeSection === 'settings') {
          await supabase.from('app_settings').update(editingItem).gt('id', 0);
          updateSettings(editingItem); 
          showToast('Configurações salvas!'); 
          return;
      }

      // Salvando Prompt (Episódio)
      if (selectedPack && activeSection === 'prompts') {
          const { error } = await supabase.from('pack_items').upsert({ 
              ...editingItem, 
              pack_id: selectedPack.id 
          }).eq('id', editingItem.id || 0);

          if (!error) { 
              showToast('Prompt salvo!'); 
              setEditingItem(null); 
              fetchPackPrompts(selectedPack.id); 
          } else {
              alert(error.message);
          }
          return;
      }

      // Salvando Outros (Packs, Users, News)
      let table = activeSection === 'users' ? 'profiles' : activeSection === 'prompts' ? 'products' : activeSection === 'tutorials' ? 'tutorials_videos' : activeSection;
      let payload = activeSection === 'users' ? { plan: editingItem.plan } : editingItem;
      
      const { error } = await supabase.from(table).upsert(payload).eq('id', editingItem.id || 0);
      
      if(!error) { 
          showToast('Item salvo!'); 
          setEditingItem(null); 
          fetchData(); 
      } else {
          alert("Erro: " + error.message);
      }
  };

  const handleDelete = async (id, isPrompt = false) => {
      if(!confirm('Tem certeza absoluta?')) return;
      let table = isPrompt ? 'pack_items' : activeSection === 'prompts' ? 'products' : activeSection === 'tutorials' ? 'tutorials_videos' : activeSection;
      
      await supabase.from(table).delete().eq('id', id);
      
      if(isPrompt && selectedPack) fetchPackPrompts(selectedPack.id);
      else fetchData();
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-fadeIn px-6 pt-8">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-gray-800 pb-4 gap-4">
          <div><h2 className="text-3xl font-bold text-white flex items-center"><Shield className="text-blue-600 mr-3"/> Estúdio de Criação</h2><p className="text-gray-400">Gerencie seu conteúdo.</p></div>
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">{['prompts', 'tutorials', 'users', 'news', 'settings'].map(id => (<button key={id} onClick={() => { setActiveSection(id); setEditingItem(id === 'settings' ? settings : null); setSelectedPack(null); }} className={`px-4 py-2 rounded-lg font-bold capitalize whitespace-nowrap ${activeSection === id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>{id === 'prompts' ? 'Séries (Packs)' : id}</button>))}</div>
      </div>

      {/* CONFIGURAÇÕES */}
      {activeSection === 'settings' && editingItem && (
          <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 grid grid-cols-1 gap-6">
              <h3 className="text-white font-bold text-xl border-l-4 border-blue-600 pl-3">Identidade Visual</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div><ImageUploader label="Logo Menu" currentImage={editingItem.logo_menu_url} onUploadComplete={url=>setEditingItem({...editingItem,logo_menu_url:url})}/></div>
                  <div><ImageUploader label="Banner Dashboard" currentImage={editingItem.banner_url} onUploadComplete={url=>setEditingItem({...editingItem,banner_url:url})}/></div>
                  <div><ImageUploader label="Logo Header" currentImage={editingItem.logo_header_url} onUploadComplete={url=>setEditingItem({...editingItem,logo_header_url:url})}/></div>
              </div>
              <div><label className="text-gray-400 block mb-2">Posição da Logo</label><div className="flex gap-4">{['flex-start','center','flex-end'].map(pos=><button key={pos} onClick={()=>setEditingItem({...editingItem,logo_position:pos})} className={`px-4 py-2 rounded border ${editingItem.logo_position===pos?'bg-blue-600 border-blue-600 text-white':'bg-black border-gray-700 text-gray-400'}`}>{pos}</button>)}</div></div>
              <button onClick={handleSave} className="bg-green-600 text-white px-8 py-3 rounded font-bold w-full">Salvar Alterações</button>
          </div>
      )}

      {/* PACKS & PROMPTS */}
      {activeSection === 'prompts' && (
          selectedPack ? (
              // DENTRO DO PACK (PROMPTS)
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
              // LISTA DE PACKS
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

      {/* OUTRAS SEÇÕES (USERS, ETC) */}
      {activeSection !== 'settings' && activeSection !== 'prompts' && (
          <div className="animate-fadeIn">
            {activeSection !== 'users' && <div className="mb-6 flex justify-end"><button onClick={() => setEditingItem({})} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center"><Plus size={20} className="mr-2"/> Novo</button></div>}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-xl">
                <table className="w-full text-left text-sm text-gray-400"><thead className="bg-black text-xs uppercase font-bold text-gray-500"><tr><th className="p-6">Item</th><th className="p-6">Detalhes</th><th className="p-6 text-right">Ações</th></tr></thead>
                    <tbody className="divide-y divide-gray-800">{dataList.map(item => (<tr key={item.id} className="hover:bg-gray-800/50"><td className="p-6">{activeSection === 'users' ? item.name : item.title}</td><td className="p-6">{activeSection === 'users' ? item.plan : (item.video_url || item.date)}</td><td className="p-6 text-right"><button onClick={() => setEditingItem(item)} className="text-blue-500 mr-2"><Edit3 size={18}/></button><button onClick={() => handleDelete(item.id)} className="text-red-500"><Trash2 size={18}/></button></td></tr>))}</tbody>
                </table>
            </div>
          </div>
      )}

      {/* MODAL DE EDIÇÃO */}
      {editingItem && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-gray-900 w-full max-w-2xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
                  <div className="p-6 border-b border-gray-800 flex justify-between items-center"><h3 className="text-xl font-bold text-white">Editor</h3><button onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-white"><X/></button></div>
                  <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                      <form onSubmit={handleSave} className="space-y-6">
                          {/* Campos Dinâmicos baseados no que está sendo editado */}
                          
                          {activeSection === 'users' && <div><label className="block text-gray-400 text-sm font-bold mb-2">Plano</label><select className="w-full bg-black border border-gray-700 p-4 rounded-xl text-white" value={editingItem.plan || 'free'} onChange={e => setEditingItem({...editingItem, plan: e.target.value})}><option value="free">Free</option><option value="pro">Pro</option><option value="gold">Gold</option><option value="admin">Admin</option></select></div>}
                          
                          {/* Pack */}
                          {activeSection === 'prompts' && !selectedPack && ( <> <ImageUploader label="Capa (Poster)" currentImage={editingItem.cover} onUploadComplete={url => setEditingItem({...editingItem, cover: url})}/> <input type="text" className="w-full bg-black border-gray-700 p-4 rounded text-white" placeholder="Título" value={editingItem.title || ''} onChange={e => setEditingItem({...editingItem, title: e.target.value})}/> <input type="text" className="w-full bg-black border-gray-700 p-4 rounded text-white" placeholder="Preço" value={editingItem.price || ''} onChange={e => setEditingItem({...editingItem, price: e.target.value})}/> <input type="text" className="w-full bg-black border-gray-700 p-4 rounded text-white" placeholder="Link Checkout" value={editingItem.checkout_url || ''} onChange={e => setEditingItem({...editingItem, checkout_url: e.target.value})}/> </> )}
                          
                          {/* Prompt */}
                          {activeSection === 'prompts' && selectedPack && ( <> <ImageUploader label="Imagem" currentImage={editingItem.url} onUploadComplete={url => setEditingItem({...editingItem, url: url})}/> <input type="text" className="w-full bg-black border-gray-700 p-4 rounded text-white" placeholder="Título" value={editingItem.title || ''} onChange={e => setEditingItem({...editingItem, title: e.target.value})}/> <textarea className="w-full bg-black border-gray-700 p-4 rounded text-white h-32" placeholder="Prompt..." value={editingItem.prompt || ''} onChange={e => setEditingItem({...editingItem, prompt: e.target.value})}/> <label className="flex items-center gap-3 p-4 bg-black/30 rounded border border-gray-700"><input type="checkbox" checked={editingItem.is_featured || false} onChange={e => setEditingItem({...editingItem, is_featured: e.target.checked})}/> Destacar</label> </> )}
                          
                          {/* Genérico */}
                          {(activeSection === 'tutorials' || activeSection === 'news') && Object.keys(editingItem).map(key => { if(['id','created_at','pack_id','is_featured'].includes(key)) return null; if(['thumbnail','image'].includes(key)) return <ImageUploader key={key} label={key} currentImage={editingItem[key]} onUploadComplete={url => setEditingItem({...editingItem, [key]: url})}/>; return <div key={key}><label className="text-gray-500 text-xs uppercase mb-1 block">{key}</label><input type="text" className="w-full bg-black border border-gray-700 p-4 rounded-xl text-white" value={editingItem[key] || ''} onChange={e => setEditingItem({...editingItem, [key]: e.target.value})}/></div> })}
                          
                          <div className="flex justify-end gap-4 pt-4"><button type="button" onClick={() => setEditingItem(null)} className="px-6 py-3 font-bold text-gray-400">Cancelar</button><button type="submit" className="bg-green-600 text-white px-8 py-3 rounded font-bold">Salvar</button></div>
                      </form>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}