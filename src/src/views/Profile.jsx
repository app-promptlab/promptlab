import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import ImageUploader from '../components/ImageUploader';
import { Camera, Facebook, Twitter, Linkedin, Globe, Github } from 'lucide-react';

export default function Profile({ user, setUser }) {
  const [activeTab, setActiveTab] = useState('perfil');
  const [formData, setFormData] = useState({
     firstName: user.name?.split(' ')[0] || '', lastName: user.name?.split(' ').slice(1).join(' ') || '',
     phone: user.phone || '', avatar: user.avatar, cover: user.cover,
     facebook: user.social_facebook || '', twitter: user.social_twitter || '', linkedin: user.social_linkedin || '', website: user.social_website || '', github: user.social_github || ''
  });

  const handleSave = async () => {
      const updates = {
          name: `${formData.firstName} ${formData.lastName}`, phone: formData.phone, avatar: formData.avatar, cover: formData.cover,
          social_facebook: formData.facebook, social_twitter: formData.twitter, social_linkedin: formData.linkedin, social_website: formData.website, social_github: formData.github
      };
      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
      if(!error) { setUser({ ...user, ...updates }); alert("Perfil atualizado!"); } else { alert("Erro ao salvar."); }
  };

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn p-8 pt-8">
      <h2 className="text-3xl font-bold text-white mb-8">Configurações</h2>
      <div className="flex space-x-8 border-b border-gray-800 mb-8 overflow-x-auto">
         {['perfil', 'senha', 'social'].map(tab => (<button key={tab} onClick={() => setActiveTab(tab)} className={`pb-4 text-sm font-medium capitalize relative whitespace-nowrap ${activeTab === tab ? 'text-blue-600' : 'text-gray-500 hover:text-white'}`}>{tab === 'social' ? 'Perfil Social' : tab}{activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}</button>))}
      </div>
      
      {/* ... (Copie o resto do Profile do App.jsx anterior, é igual) ... */}
      {/* Vou abreviar aqui pra caber, mas você pega do código anterior */}
      {activeTab === 'perfil' && (
         <div className="mb-10">
            <div className="h-48 w-full rounded-t-xl bg-gray-800 relative overflow-hidden group"><img src={formData.cover} className="w-full h-full object-cover opacity-80"/><div className="absolute bottom-4 right-4"><ImageUploader compact label="Capa" onUploadComplete={(url) => setFormData({...formData, cover: url})} /></div></div>
            <div className="px-8 relative"><div className="w-32 h-32 rounded-full border-4 border-black bg-gray-700 -mt-16 overflow-hidden relative group"><img src={formData.avatar} className="w-full h-full object-cover"/><div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center"><ImageUploader compact label="Avatar" onUploadComplete={(url) => setFormData({...formData, avatar: url})} /></div></div></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
             <div><label className="text-white text-sm font-bold mb-2 block">Nome</label><input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-white focus:border-blue-600 outline-none"/></div>
             <div><label className="text-white text-sm font-bold mb-2 block">Último nome</label><input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-white focus:border-blue-600 outline-none"/></div>
             <div className="col-span-2"><label className="text-white text-sm font-bold mb-2 block">Telefone</label><input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-white focus:border-blue-600 outline-none" placeholder="(00) 00000-0000"/></div>
             <div className="col-span-2 mt-4"><button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-colors">Atualizar Perfil</button></div>
          </div>
         </div>
      )}
      {activeTab === 'senha' && <div className="max-w-2xl space-y-6"><div><label className="text-white text-sm font-bold mb-2 block">Senha atual</label><input type="password" className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-white focus:border-blue-600 outline-none"/></div><button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg mt-4">Redefinir senha</button></div>}
      {activeTab === 'social' && <div className="space-y-6">{[{k:'facebook',l:'Facebook',i:Facebook},{k:'twitter',l:'Twitter',i:Twitter},{k:'linkedin',l:'Linkedin',i:Linkedin}].map(s=><div key={s.k} className="flex items-center"><div className="w-32 flex items-center text-white"><s.i size={18} className="mr-2"/> {s.l}</div><input type="text" value={formData[s.k]} onChange={e=>setFormData({...formData,[s.k]:e.target.value})} className="flex-1 bg-gray-900 border border-gray-800 rounded-lg p-3 text-gray-400 focus:text-white focus:border-blue-600 outline-none"/></div>)}<button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg mt-4">Atualizar Perfil</button></div>}
    </div>
  );
}