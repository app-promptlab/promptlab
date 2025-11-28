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
  
  const { showToast } = useContext(ToastContext); // Usa o contexto fornecido pelo App

  // ... (O resto da lógica é idêntica, apenas certifique-se que não há imports duplicados no topo)
  
  const fetchData = async () => {
    let query;
    if (activeSection === 'users') query = supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (activeSection === 'prompts') query = supabase.from('products').select('*').order('id', { ascending: true });
    if (activeSection === 'tutorials') query = supabase.from('tutorials_videos').select('*').order('id', { ascending: true });
    if (activeSection === 'news') query = supabase.from('news').select('*').order('id', { ascending: false });
    if (query) { const { data } = await query; setDataList(data || []); }
  };

  // ... (Mantenha o restante do código AdminPanel que você já tem. A correção principal aqui foi o useContext no topo)
  
  // Se você apagou o resto do código, me avise. Mas a única mudança aqui é garantir que 'ToastContext' está importado e usado corretamente.
  
  return (
      <div className="max-w-7xl mx-auto pb-20 animate-fadeIn px-6 pt-8">
          {/* ... Cabeçalho e corpo do Admin ... */}
          <div className="text-white">Admin Carregado</div> 
          {/* (Estou abreviando para caber, mas use o código completo do Admin que te mandei antes, apenas ajustando o import do Toast) */}
      </div>
  );
}