import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import ImageUploader from '../components/ImageUploader';
import { Shield, LayoutGrid, Play, Users, FileText, Settings, ChevronLeft, Plus, Edit3, Trash2, Images } from 'lucide-react';

export default function AdminPanel({ updateSettings, settings }) {
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
      try {
        if (activeSection === 'settings') {
            await supabase.from('app_settings').update(editingItem).gt('id', 0);
            updateSettings(editingItem); alert('Configurações salvas!'); return;
        }
        if (selectedPack && activeSection === 'prompts') {
            const { error } = await supabase.from('pack_items').upsert({ ...editingItem, pack_id: selectedPack.id }).eq('id', editingItem.id || 0);
            if (error) throw error;
            alert('Prompt salvo!'); setEditingItem(null); fetchPackPrompts(selectedPack.id); return;
        }
        let table = activeSection === 'users' ? 'profiles' : activeSection === 'prompts' ? 'products' : activeSection === 'tutorials' ? 'tutorials_videos' : activeSection;
        let payload = activeSection === 'users' ? { plan: editingItem.plan } : editingItem;
        const { error } = await supabase.from(table).upsert(payload).eq('id', editingItem.id || 0);
        if (error) throw error;
        alert('Salvo!'); setEditingItem(null); fetchData();
      } catch (err) { alert("Erro: " + err.message); }
  };

  const handleDelete = async (id, isPrompt = false) => {
      if(!confirm('Tem certeza?')) return;
      let table = isPrompt ? 'pack_items' : activeSection === 'prompts' ? 'products' : activeSection === 'tutorials' ? 'tutorials_videos' : activeSection;
      await supabase.from(table).delete().eq('id', id);
      if(isPrompt && selectedPack) fetchPackPrompts(selectedPack.id); else fetchData();
  };

  // ... (Mantenha o return/render igual ao anterior, pois só mudamos a lógica acima)
  // Se precisar do return completo me avise, mas o importante é remover o useContext do topo.
  return (
      <div className="max-w-7xl mx-auto pb-20 animate-fadeIn px-6 pt-8">
         {/* ... (Conteúdo visual do Admin igual ao anterior) ... */}
         <div className="text-white">Admin Panel Loaded (Copie o resto do return anterior se precisar)</div>
      </div>
  );
}