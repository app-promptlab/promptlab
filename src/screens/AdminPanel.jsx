import React, { useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient'; // <--- ../
import ImageUploader from '../components/ImageUploader'; // <--- ../components
import { Shield, LayoutGrid, Play, Users, FileText, Settings, ChevronLeft, Plus, Edit3, Trash2, Images } from 'lucide-react';
import { ToastContext } from '../ToastContext'; // <--- ../

// ... (o resto do código AdminPanel que te mandei antes está certo)

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
      
      if (activeSection === 'settings') {
          await supabase.from('app_settings').update(editingItem).gt('id', 0);
          updateSettings(editingItem); 
          showToast('Configurações salvas!'); 
          return;
      }

      if (selectedPack && activeSection === 'prompts') {
          const { error } = await supabase.from('pack_items').upsert({ 
              ...editingItem, 
              pack_id: selectedPack.id 
          }).eq('id', editingItem.id || 0);

          if (!error) { 
              showToast('Prompt salvo com sucesso!'); 
              setEditingItem(null); 
              fetchPackPrompts(selectedPack.id); 
          } else {
              alert("Erro ao salvar prompt: " + error.message);
          }
          return;
      }

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
    <div className="max-w-7xl mx-auto pb-20 animate-fadeIn px-6">
      
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-gray-800 pb-4 gap-4">
          <div>
              <h2 className="text-3xl font-bold text-white flex items-center">
                  <Shield className="text-blue-600 mr-3" size={32}/> 
                  Estúdio de Criação
              </h2>
              <p className="text-gray-400">Gerencie todo o conteúdo da plataforma.</p>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
              {[
                  { id: 'prompts', label: 'Packs & Prompts', icon: LayoutGrid },
                  { id: 'tutorials', label: 'Tutoriais', icon: Play },
                  { id: 'users', label: 'Usuários', icon: Users },
                  { id: 'news', label: 'Blog/News', icon: FileText },
                  { id: 'settings', label: 'Configurações', icon: Settings }
              ].map(menu => (
                  <button 
                    key={menu.id} 
                    onClick={() => { setActiveSection(menu.id); setEditingItem(menu.id === 'settings' ? settings : null); setSelectedPack(null); }} 
                    className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap flex items-center transition-all ${activeSection === menu.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                  >
                      <menu.icon size={16} className="mr-2"/> {menu.label}
                  </button>
              ))}
          </div>
      </div>

      {activeSection === 'settings' && editingItem && (
          <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 grid grid-cols-1 gap-8">
              <h3 className="text-white font-bold text-xl border-l-4 border-blue-600 pl-3">Identidade Visual</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div><ImageUploader label="Logo do Menu (Pequena)" currentImage={editingItem.logo_menu_url} onUploadComplete={(url) => setEditingItem({...editingItem, logo_menu_url: url})} /></div>
                  <div><ImageUploader label="Banner do Dashboard (Topo)" currentImage={editingItem.banner_url} onUploadComplete={(url) => setEditingItem({...editingItem, banner_url: url})} /></div>
                  <div><ImageUploader label="Logo Principal (Com Slogan)" currentImage={editingItem.logo_header_url} onUploadComplete={(url) => setEditingItem({...editingItem, logo_header_url: url})} /></div>
              </div>
              <div className="border-t border-gray-800 pt-6">
                  <label className="text-gray-400 block mb-3 font-bold">Posição da Logo no Banner</label>
                  <div className="flex gap-4">
                      {['flex-start', 'center', 'flex-end'].map(pos => (
                          <button key={pos} onClick={() => setEditingItem({...editingItem, logo_position: pos})} className={`px-6 py-3 rounded-lg border-2 font-bold transition-all ${editingItem.logo_position === pos ? 'bg-blue-600 border-blue-600 text-white' : 'bg-transparent border-gray-700 text-gray-500 hover:border-gray-500'}`}>
                              {pos === 'flex-start' ? 'Esquerda' : pos === 'center' ? 'Centro' : 'Direita'}
                          </button>
                      ))}
                  </div>
              </div>
              <button onClick={handleSave} className="bg-green-600 hover:bg-green-500 text-white px-8 py-4 rounded-xl font-bold text-lg w-full md:w-auto self-end shadow-lg">Salvar Alterações</button>
          </div>
      )}

      {activeSection === 'prompts' && (
          selectedPack ? (
              <div className="animate-fadeIn">
                  <button onClick={() => setSelectedPack(null)} className="mb-6 text-gray-400 hover:text-white flex items-center font-bold text-lg group">
                      <ChevronLeft className="mr-2 group-hover:-translate-x-1 transition-transform"/> Voltar para Catálogo
                  </button>
                  
                  <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                      <div className="relative h-48 bg-gray-800">
                          <img src={selectedPack.cover} className="w-full h-full object-cover opacity-40"/>
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                          <div className="absolute bottom-6 left-8 flex justify-between items-end right-8">
                              <div>
                                  <span className="text-blue-500 font-bold tracking-widest text-xs uppercase mb-2 block">SÉRIE SELECIONADA</span>
                                  <h2 className="text-4xl font-bold text-white">{selectedPack.title}</h2>
                              </div>
                              <button 
                                onClick={() => setEditingItem({ title: '', prompt: '', url: '' })} 
                                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center shadow-lg hover:scale-105 transition-transform"
                              >
                                  <Plus size={20} className="mr-2"/> Adicionar Episódio (Prompt)
                              </button>
                          </div>
                      </div>

                      <div className="p-8">
                          {packPrompts.length === 0 ? (
                              <div className="text-center py-20 text-gray-500 border-2 border-dashed border-gray-800 rounded-xl">
                                  <Images size={48} className="mx-auto mb-4 opacity-20"/>
                                  <p>Nenhum prompt adicionado nesta série ainda.</p>
                              </div>
                          ) : (
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                  {packPrompts.map(prompt => (
                                      <div key={prompt.id} className="bg-black border border-gray-800 rounded-xl overflow-hidden group hover:border-blue-600 transition-all">
                                          <div className="aspect-square relative">
                                              <img src={prompt.url} className="w-full h-full object-cover"/>
                                              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                                                  <button onClick={() => setEditingItem(prompt)} className="bg-blue-600 text-white p-2 rounded-full hover:scale-110 transition-transform"><Edit3 size={18}/></button>
                                                  <button onClick={() => handleDelete(prompt.id, true)} className="bg-red-600 text-white p-2 rounded-full hover:scale-110 transition-transform"><Trash2 size={18}/></button>
                                              </div>
                                          </div>
                                          <div className="p-4">
                                              <h4 className="text-white font-bold truncate">{prompt.title || 'Sem Título'}</h4>
                                              <p className="text-gray-500 text-xs truncate mt-1">{prompt.prompt}</p>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          ) : (
              <div className="animate-fadeIn">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl text-white font-bold">Suas Séries (Packs)</h3>
                    <button 
                        onClick={() => setEditingItem({ title: '', description: '', price: 'R$ 0,00', cover: '' })} 
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center shadow-lg hover:shadow-blue-900/40 transition-all"
                    >
                        <Plus size={20} className="mr-2"/> Nova Série
                    </button>
                 </div>
                 
                 <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                     {dataList.map(pack => (
                         <div key={pack.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-blue-900/20 transition-all group relative">
                             <div className="aspect-[2/3] relative cursor-pointer" onClick={() => { setSelectedPack(pack); fetchPackPrompts(pack.id); }}>
                                 <img src={pack.cover} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
                                 <div className="absolute bottom-4 left-4 right-4">
                                     <h4 className="text-white font-bold leading-tight mb-1">{pack.title}</h4>
                                     <p className="text-blue-400 text-xs font-bold">{pack.price}</p>
                                 </div>
                                 <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                                     <span className="bg-white text-black px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wide">Gerenciar Episódios</span>
                                 </div>
                             </div>
                             
                             <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button onClick={(e) => {e.stopPropagation(); setEditingItem(pack);}} className="bg-black/80 text-blue-400 p-2 rounded-lg hover:text-white"><Edit3 size={16}/></button>
                                 <button onClick={(e) => {e.stopPropagation(); handleDelete(pack.id);}} className="bg-black/80 text-red-500 p-2 rounded-lg hover:text-white"><Trash2 size={16}/></button>
                             </div>
                         </div>
                     ))}
                 </div>
              </div>
          )
      )}

      {activeSection !== 'settings' && activeSection !== 'prompts' && (
          <div className="animate-fadeIn">
            {activeSection !== 'users' && (
                <div className="mb-6 flex justify-end">
                    <button 
                        onClick={() => setEditingItem({})} 
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center shadow-lg"
                    >
                        <Plus size={20} className="mr-2"/> Adicionar Novo
                    </button>
                </div>
            )}

            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-xl">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-black text-xs uppercase font-bold tracking-wider text-gray-500">
                        <tr><th className="p-6">Item / Informação</th><th className="p-6">Detalhes</th><th className="p-6 text-right">Ações</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {dataList.map(item => (
                            <tr key={item.id} className="hover:bg-gray-800/50 transition-colors">
                                <td className="p-6">
                                    {activeSection === 'users' ? (
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-400 font-bold">{item.name?.charAt(0)}</div>
                                            <div><span className="text-white font-bold block">{item.name}</span><span className="text-xs">{item.email}</span></div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-4">
                                            {(item.thumbnail || item.image) && <img src={item.thumbnail || item.image} className="w-16 h-10 object-cover rounded bg-black"/>}
                                            <span className="text-white font-medium">{item.title || item.id}</span>
                                        </div>
                                    )}
                                </td>
                                <td className="p-6">
                                    {activeSection === 'users' ? (
                                        <div>
                                            <div className="flex items-center gap-2 mb-1 text-xs text-gray-500">
                                                <Monitor size={12}/> {item.phone || 'Sem telefone'}
                                            </div>
                                            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${item.plan === 'admin' ? 'bg-red-900/30 border-red-500/50 text-red-400' : 'bg-green-900/30 border-green-500/50 text-green-400'}`}>
                                                {item.plan}
                                            </span>
                                        </div>
                                    ) : (item.video_url || item.date)}
                                </td>
                                <td className="p-6 text-right">
                                    <button onClick={() => setEditingItem(item)} className="text-blue-500 hover:text-white bg-blue-500/10 p-2 rounded-lg mr-2 transition-colors"><Edit3 size={18}/></button>
                                    {activeSection !== 'users' && <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-white bg-red-500/10 p-2 rounded-lg transition-colors"><Trash2 size={18}/></button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
      )}

      {editingItem && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-gray-900 w-full max-w-2xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
                  <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
                      <h3 className="text-xl font-bold text-white">
                          {activeSection === 'prompts' && selectedPack ? 'Editar Prompt' : activeSection === 'prompts' ? 'Editar Série (Pack)' : 'Editar Registro'}
                      </h3>
                      <button onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-white"><X/></button>
                  </div>
                  
                  <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                      <form onSubmit={handleSave} className="space-y-6">
                          
                          {activeSection === 'users' && (
                              <div>
                                  <label className="block text-gray-400 text-sm font-bold mb-2">Plano de Acesso</label>
                                  <select className="w-full bg-black border border-gray-700 p-4 rounded-xl text-white focus:border-blue-600 outline-none" value={editingItem.plan || 'free'} onChange={e => setEditingItem({...editingItem, plan: e.target.value})}>
                                      <option value="free">Free</option><option value="pro">Pro</option><option value="gold">Gold</option><option value="admin">Admin</option>
                                  </select>
                              </div>
                          )}

                          {activeSection === 'prompts' && !selectedPack && (
                              <>
                                  <ImageUploader label="Capa da Série (Poster)" currentImage={editingItem.cover} onUploadComplete={(url) => setEditingItem({...editingItem, cover: url})} />
                                  <div><label className="block text-gray-400 text-sm font-bold mb-2">Título da Série</label><input type="text" className="w-full bg-black border border-gray-700 p-4 rounded-xl text-white" value={editingItem.title || ''} onChange={e => setEditingItem({...editingItem, title: e.target.value})} placeholder="Ex: Cyberpunk Girls"/></div>
                                  <div><label className="block text-gray-400 text-sm font-bold mb-2">Preço</label><input type="text" className="w-full bg-black border border-gray-700 p-4 rounded-xl text-white" value={editingItem.price || ''} onChange={e => setEditingItem({...editingItem, price: e.target.value})} placeholder="Ex: R$ 29,90"/></div>
                                  <div><label className="block text-gray-400 text-sm font-bold mb-2">Link de Checkout</label><input type="text" className="w-full bg-black border border-gray-700 p-4 rounded-xl text-white" value={editingItem.checkout_url || ''} onChange={e => setEditingItem({...editingItem, checkout_url: e.target.value})} placeholder="https://kiwify..."/></div>
                                  <div><label className="block text-gray-400 text-sm font-bold mb-2">Descrição</label><textarea className="w-full bg-black border border-gray-700 p-4 rounded-xl text-white h-24" value={editingItem.description || ''} onChange={e => setEditingItem({...editingItem, description: e.target.value})}/></div>
                              </>
                          )}

                          {activeSection === 'prompts' && selectedPack && (
                              <>
                                  <ImageUploader label="Imagem Gerada (Thumbnail)" currentImage={editingItem.url} onUploadComplete={(url) => setEditingItem({...editingItem, url: url})} />
                                  <div><label className="block text-gray-400 text-sm font-bold mb-2">Título do Episódio (Prompt)</label><input type="text" className="w-full bg-black border border-gray-700 p-4 rounded-xl text-white" value={editingItem.title || ''} onChange={e => setEditingItem({...editingItem, title: e.target.value})} placeholder="Ex: Retrato Neon"/></div>
                                  <div><label className="block text-gray-400 text-sm font-bold mb-2">O Prompt (Texto)</label><textarea className="w-full bg-black border border-gray-700 p-4 rounded-xl text-white h-40 font-mono text-sm" value={editingItem.prompt || ''} onChange={e => setEditingItem({...editingItem, prompt: e.target.value})} placeholder="/imagine..."/></div>
                                  <label className="flex items-center gap-3 p-4 bg-black/30 rounded-xl border border-gray-700 cursor-pointer">
                                      <input type="checkbox" checked={editingItem.is_featured || false} onChange={e => setEditingItem({...editingItem, is_featured: e.target.checked})} className="w-5 h-5 accent-blue-600"/>
                                      <span className="text-white font-bold">Destacar no Dashboard (Carrossel)</span>
                                  </label>
                              </>
                          )}

                          {(activeSection === 'tutorials' || activeSection === 'news') && (
                              Object.keys(editingItem).map(key => {
                                  if(['id','created_at','pack_id','is_featured'].includes(key)) return null;
                                  if(['thumbnail','image','cover'].includes(key)) return <ImageUploader key={key} label={key.toUpperCase()} currentImage={editingItem[key]} onUploadComplete={(url) => setEditingItem({...editingItem, [key]: url})} />;
                                  return <div key={key}><label className="block text-gray-400 text-sm font-bold mb-2 uppercase">{key}</label><input type="text" className="w-full bg-black border border-gray-700 p-4 rounded-xl text-white" value={editingItem[key] || ''} onChange={e => setEditingItem({...editingItem, [key]: e.target.value})}/></div>
                              })
                          )}

                          <div className="flex justify-end gap-4 pt-4">
                              <button type="button" onClick={() => setEditingItem(null)} className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:bg-gray-800">Cancelar</button>
                              <button type="submit" className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg">Salvar Tudo</button>
                          </div>
                      </form>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}