import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Plus, Edit3, Trash2, X, ChevronLeft, UploadCloud, Loader2 } from 'lucide-react';

// Componente Interno de Upload
function ImageUploader({ currentImage, onUploadComplete, label }) {
  const [uploading, setUploading] = useState(false);
  const uploadImage = async (event) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;
      const file = event.target.files[0];
      const fileName = `${Date.now()}_${file.name}`; // Nome único
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
             {uploading ? 'Enviando...' : 'Escolher Arquivo'}
             <input type="file" accept="image/*" onChange={uploadImage} className="hidden" disabled={uploading}/>
         </label>
         {currentImage && <img src={currentImage} className="h-12 w-12 rounded object-cover border border-gray-700"/>}
      </div>
    </div>
  );
}

export default function AdminPanel({ showToast }) {
  const [activeSection, setActiveSection] = useState('products'); // products = Packs
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  
  // Lógica específica para Packs x Prompts
  const [selectedPack, setSelectedPack] = useState(null); // Quando entra num pack para editar prompts
  
  const fetchItems = async () => {
    if (selectedPack) {
        // Buscando Prompts do Pack
        const { data } = await supabase.from('pack_items').select('*').eq('pack_id', selectedPack.id).order('id', {ascending: false});
        setItems(data || []);
    } else {
        // Buscando Lista Principal (Packs, News, Tutorials)
        const table = activeSection === 'products' ? 'products' : activeSection;
        const { data } = await supabase.from(table).select('*').order('id', {ascending: false});
        setItems(data || []);
    }
  };

  useEffect(() => { fetchItems(); }, [activeSection, selectedPack]);

  const handleSave = async (e) => {
    e.preventDefault();
    // Define a tabela
    let table = activeSection;
    if (activeSection === 'products' && selectedPack) table = 'pack_items';
    
    // Prepara payload
    const payload = { ...editingItem };
    if (selectedPack) payload.pack_id = selectedPack.id;

    const { error } = await supabase.from(table).upsert(payload);
    if (!error) {
        showToast("Salvo com sucesso!");
        setEditingItem(null);
        fetchItems();
    } else {
        alert("Erro ao salvar: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if(!confirm("Tem certeza que deseja excluir?")) return;
    let table = activeSection;
    if (activeSection === 'products' && selectedPack) table = 'pack_items';

    await supabase.from(table).delete().eq('id', id);
    fetchItems();
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 pb-24 animate-fadeIn">
      <h1 className="text-3xl font-bold text-white mb-8">Painel Admin</h1>

      {/* Menu Superior */}
      {!selectedPack && (
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {[
                {id: 'products', label: 'Packs (Séries)'},
                {id: 'news', label: 'Novidades'},
                {id: 'tutorials_videos', label: 'Tutoriais'}
            ].map(tab => (
                <button 
                    key={tab.id} 
                    onClick={() => { setActiveSection(tab.id); setItems([]); }}
                    className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap ${activeSection === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                >
                    {tab.label}
                </button>
            ))}
          </div>
      )}

      {/* Cabeçalho da Lista */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-300 flex items-center">
            {selectedPack && (
                <button onClick={() => setSelectedPack(null)} className="mr-4 p-2 bg-gray-800 rounded-full hover:bg-gray-700">
                    <ChevronLeft size={20}/>
                </button>
            )}
            {selectedPack ? `Editando: ${selectedPack.title}` : 'Lista de Itens'}
        </h2>
        <button 
            onClick={() => setEditingItem({})} // Item vazio para criar novo
            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold flex items-center shadow-lg"
        >
            <Plus size={18} className="mr-2"/> Novo
        </button>
      </div>

      {/* Grid de Itens */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map(item => (
            <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 relative group hover:border-blue-500 transition-colors">
                <div className="aspect-video bg-black rounded-lg mb-4 overflow-hidden">
                    <img src={item.cover || item.url || item.image || item.thumbnail} className="w-full h-full object-cover" alt="Cover"/>
                </div>
                <h3 className="text-white font-bold truncate mb-1">{item.title}</h3>
                <p className="text-gray-500 text-xs truncate mb-4">{item.description || item.prompt || item.content}</p>
                
                <div className="flex gap-2">
                    <button onClick={() => setEditingItem(item)} className="flex-1 bg-gray-800 hover:bg-blue-600 text-white py-2 rounded font-bold text-xs flex justify-center"><Edit3 size={14}/></button>
                    <button onClick={() => handleDelete(item.id)} className="flex-1 bg-gray-800 hover:bg-red-600 text-white py-2 rounded font-bold text-xs flex justify-center"><Trash2 size={14}/></button>
                    {activeSection === 'products' && !selectedPack && (
                        <button onClick={() => setSelectedPack(item)} className="flex-1 bg-blue-900/50 hover:bg-blue-600 text-blue-200 py-2 rounded font-bold text-xs">ABRIR</button>
                    )}
                </div>
            </div>
        ))}
      </div>

      {/* Modal de Edição */}
      {editingItem && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-gray-900 w-full max-w-2xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                    <h3 className="font-bold text-white">Editor</h3>
                    <button onClick={() => setEditingItem(null)}><X className="text-gray-400"/></button>
                </div>
                <form onSubmit={handleSave} className="p-6 overflow-y-auto custom-scrollbar space-y-4">
                    {/* Campos Dinâmicos */}
                    <div>
                        <label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Título</label>
                        <input className="w-full bg-black border border-gray-700 p-3 rounded text-white" value={editingItem.title || ''} onChange={e => setEditingItem({...editingItem, title: e.target.value})} required/>
                    </div>

                    {/* Lógica de Imagem (Detecta qual campo usar baseado no tipo) */}
                    {(activeSection === 'products' && !selectedPack) && <ImageUploader label="Capa do Pack (Cover)" currentImage={editingItem.cover} onUploadComplete={url => setEditingItem({...editingItem, cover: url})}/>}
                    {(selectedPack || activeSection === 'pack_items') && <ImageUploader label="Imagem do Prompt (URL)" currentImage={editingItem.url} onUploadComplete={url => setEditingItem({...editingItem, url: url})}/>}
                    {activeSection === 'news' && <ImageUploader label="Imagem da Notícia" currentImage={editingItem.image} onUploadComplete={url => setEditingItem({...editingItem, image: url})}/>}
                    {activeSection === 'tutorials_videos' && <ImageUploader label="Thumbnail" currentImage={editingItem.thumbnail} onUploadComplete={url => setEditingItem({...editingItem, thumbnail: url})}/>}

                    {/* Campos Específicos */}
                    {selectedPack && (
                        <div>
                            <label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Prompt (Comando)</label>
                            <textarea rows={4} className="w-full bg-black border border-gray-700 p-3 rounded text-white font-mono text-sm" value={editingItem.prompt || ''} onChange={e => setEditingItem({...editingItem, prompt: e.target.value})}/>
                            <div className="mt-2 flex items-center gap-2">
                                <input type="checkbox" checked={editingItem.is_featured || false} onChange={e => setEditingItem({...editingItem, is_featured: e.target.checked})} />
                                <span className="text-gray-300 text-sm">Destaque (Aparece no topo do Dashboard?)</span>
                            </div>
                        </div>
                    )}

                    {(!selectedPack && activeSection === 'products') && (
                         <>
                            <div><label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Preço</label><input className="w-full bg-black border border-gray-700 p-3 rounded text-white" value={editingItem.price || ''} onChange={e => setEditingItem({...editingItem, price: e.target.value})}/></div>
                            <div><label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Descrição</label><input className="w-full bg-black border border-gray-700 p-3 rounded text-white" value={editingItem.description || ''} onChange={e => setEditingItem({...editingItem, description: e.target.value})}/></div>
                            <div><label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Link Checkout (Kiwify/Hotmart)</label><input className="w-full bg-black border border-gray-700 p-3 rounded text-white" value={editingItem.checkout_url || ''} onChange={e => setEditingItem({...editingItem, checkout_url: e.target.value})}/></div>
                         </>
                    )}

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={() => setEditingItem(null)} className="px-4 py-2 text-gray-400 font-bold">Cancelar</button>
                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-bold">Salvar Alterações</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}