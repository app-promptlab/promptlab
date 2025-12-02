import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { User, Save } from 'lucide-react';

export default function Profile({ user, showToast }) {
  const [formData, setFormData] = useState({ 
    name: user.name || '', 
    phone: user.phone || '' 
  });

  const handleSave = async () => {
    const { error } = await supabase.from('profiles').update(formData).eq('id', user.id);
    if (!error) {
        showToast("Perfil atualizado!");
        // O ideal seria atualizar o estado global do user, mas o reload funciona
        window.location.reload(); 
    } else {
        alert("Erro ao salvar");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 animate-fadeIn">
      <h1 className="text-3xl font-bold text-white mb-8 flex items-center"><User className="mr-3 text-blue-500"/> Meu Perfil</h1>
      
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 space-y-6">
         <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold text-white">
                {user.name?.[0] || 'U'}
            </div>
            <div>
                <h2 className="text-xl font-bold text-white">{user.name}</h2>
                <p className="text-gray-400 text-sm">{user.email}</p>
                <span className="inline-block bg-blue-900/50 text-blue-200 text-xs px-2 py-1 rounded mt-2 uppercase font-bold border border-blue-500/30">
                    Plano {user.plan || 'Free'}
                </span>
            </div>
         </div>

         <div className="space-y-4">
            <div>
                <label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Nome Completo</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white focus:border-blue-500 outline-none transition-colors"/>
            </div>
            <div>
                <label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Telefone</label>
                <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white focus:border-blue-500 outline-none transition-colors"/>
            </div>
         </div>

         <button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 mt-4">
            <Save size={18}/> Salvar Alterações
         </button>
      </div>
    </div>
  );
}