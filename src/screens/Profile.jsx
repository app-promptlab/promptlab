import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { User, Lock, Share2, Camera, Save, Trash2, Loader2, Facebook, Twitter, Instagram, Video, MessageCircle } from 'lucide-react';

export default function Profile({ user, showToast }) {
  const [activeTab, setActiveTab] = useState('perfil');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    last_name: '',
    email: '', 
    phone: '', 
    avatar: '',
    cover: '',
    social_facebook: '',
    social_twitter: '',
    social_instagram: '',
    social_tiktok: ''
  });

  const [passData, setPassData] = useState({ current: '', new: '', confirm: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        last_name: user.last_name || '', 
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
        cover: user.cover || '',
        social_facebook: user.social_facebook || '',
        social_twitter: user.social_twitter || '',
        social_instagram: user.social_instagram || '',
        social_tiktok: user.social_tiktok || ''
      });
    }
  }, [user]);

  const handleImageUpload = async (event, field) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from('uploads').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('uploads').getPublicUrl(filePath);
      
      setFormData(prev => ({ ...prev, [field]: data.publicUrl }));
      await supabase.from('profiles').update({ [field]: data.publicUrl }).eq('id', user.id);
      
      showToast(`${field === 'cover' ? 'Capa' : 'Avatar'} atualizado!`);
    } catch (error) {
      alert('Erro no upload: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const { email, ...updates } = formData; 
      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
      
      if (error) throw error;
      showToast("Perfil atualizado com sucesso!");
    } catch (error) {
      alert("Erro ao salvar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePassword = async () => {
    if (passData.new !== passData.confirm) return alert("As novas senhas não coincidem.");
    if (passData.new.length < 6) return alert("A senha deve ter no mínimo 6 caracteres.");
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passData.new });
      if (error) throw error;
      showToast("Senha alterada com sucesso!");
      setPassData({ current: '', new: '', confirm: '' });
    } catch (error) {
      alert("Erro ao alterar senha: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // AJUSTE FULL BLEED: px-0 no mobile, md:px-6 no PC
    <div className="w-full max-w-5xl mx-auto px-0 md:px-6 py-0 md:py-10 animate-fadeIn pb-32">
      
      {/* Título com padding manual para não colar na borda */}
      <h1 className="text-3xl font-bold text-white mb-6 md:mb-8 px-6 pt-6 md:pt-0">Meu Perfil</h1>

      {/* --- ABAS DE NAVEGAÇÃO --- */}
      <div className="flex border-b border-gray-800 mb-0 md:mb-10 overflow-x-auto px-2 md:px-0">
        {[
          { id: 'perfil', label: 'Dados Pessoais', icon: User },
          { id: 'senha', label: 'Segurança', icon: Lock },
          { id: 'social', label: 'Redes Sociais', icon: Share2 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-6 py-4 font-bold text-sm transition-all relative whitespace-nowrap
              ${activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'}
            `}
          >
            <tab.icon size={18} />
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-theme-primary rounded-t-full"></span>
            )}
          </button>
        ))}
      </div>

      {/* --- CONTEÚDO DAS ABAS --- */}
      
      {/* 1. ABA PERFIL */}
      {activeTab === 'perfil' && (
        <div className="animate-fadeIn">
          {/* Capa FULL BLEED no mobile (rounded-none) */}
          <div className="relative w-full h-48 md:h-64 rounded-none md:rounded-xl overflow-hidden bg-gray-900 group border-b border-gray-800 md:border md:border-gray-800 mb-20 shadow-2xl">
            {formData.cover ? (
              <img src={formData.cover} className="w-full h-full object-cover" alt="Cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-gray-900 to-black flex items-center justify-center text-gray-700 font-bold">
                 ADICIONAR CAPA
              </div>
            )}
            
            {/* Botões da Capa */}
            <div className="absolute top-4 right-4 flex gap-2">
               {formData.cover && (
                 <button 
                    onClick={() => { setFormData({...formData, cover: ''}); supabase.from('profiles').update({cover: null}).eq('id', user.id); }}
                    className="bg-black/60 p-2 rounded-full text-white hover:bg-red-600 transition-colors backdrop-blur-sm"
                    title="Remover Capa"
                 >
                    <Trash2 size={16}/>
                 </button>
               )}
               <label className="bg-black/60 hover:bg-theme-primary text-white p-2 rounded-full cursor-pointer backdrop-blur-sm transition-colors" title="Alterar Capa">
                  <Camera size={16}/>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'cover')} disabled={uploading}/>
               </label>
            </div>

            {/* Avatar (Sobreposto) */}
            <div className="absolute -bottom-16 left-6 md:left-12">
               <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-theme-bg bg-gray-800 overflow-hidden relative group shadow-xl">
                  {formData.avatar ? (
                      <img src={formData.avatar} className="w-full h-full object-cover" alt="Avatar"/>
                  ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                          <User size={48} />
                      </div>
                  )}
                  
                  <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="text-white" size={24}/>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'avatar')} disabled={uploading}/>
                  </label>
               </div>
            </div>
          </div>

          {/* Formulário com Padding Interno */}
          <div className="px-6 md:px-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                 <div>
                    <label className="block text-gray-400 text-xs font-bold uppercase mb-2 ml-1">Nome</label>
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:border-theme-primary outline-none transition-colors"
                      placeholder="Seu nome"
                    />
                 </div>
                 <div>
                    <label className="block text-gray-400 text-xs font-bold uppercase mb-2 ml-1">Sobrenome</label>
                    <input 
                      type="text" 
                      value={formData.last_name} 
                      onChange={e => setFormData({...formData, last_name: e.target.value})}
                      className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:border-theme-primary outline-none transition-colors"
                      placeholder="Seu sobrenome"
                    />
                 </div>
                 <div>
                    <label className="block text-gray-400 text-xs font-bold uppercase mb-2 ml-1">Email</label>
                    <input 
                      type="text" 
                      value={formData.email} 
                      disabled
                      className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-gray-500 cursor-not-allowed"
                    />
                 </div>
                 
                 {/* CAMPO WHATSAPP */}
                 <div>
                    <label className="flex items-center gap-2 text-green-500 text-xs font-bold uppercase mb-2 ml-1">
                        <MessageCircle size={14} /> WhatsApp
                    </label>
                    <input 
                      type="text" 
                      value={formData.phone} 
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:border-green-500 outline-none transition-colors"
                      placeholder="(11) 99999-9999"
                    />
                 </div>
              </div>

              <div className="flex justify-end border-t border-white/10 pt-6">
                 <button onClick={handleSaveProfile} disabled={loading} className="bg-theme-primary hover:bg-theme-primary/90 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-theme-primary/20">
                    {loading ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>} 
                    Salvar Alterações
                 </button>
              </div>
          </div>
        </div>
      )}

      {/* 2. ABA SENHA */}
      {activeTab === 'senha' && (
        <div className="animate-fadeIn max-w-2xl px-6 md:px-0 pt-6">
           <div className="bg-theme-sidebar p-8 rounded-2xl border border-white/5">
               <div className="space-y-6">
                 <div>
                    <label className="block text-gray-400 text-xs font-bold uppercase mb-2 ml-1">Nova Senha</label>
                    <input 
                      type="password" 
                      value={passData.new}
                      onChange={e => setPassData({...passData, new: e.target.value})}
                      className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:border-theme-primary outline-none"
                      placeholder="Mínimo 6 caracteres"
                    />
                 </div>
                 <div>
                    <label className="block text-gray-400 text-xs font-bold uppercase mb-2 ml-1">Confirme a senha</label>
                    <input 
                      type="password" 
                      value={passData.confirm}
                      onChange={e => setPassData({...passData, confirm: e.target.value})}
                      className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:border-theme-primary outline-none"
                      placeholder="Repita a nova senha"
                    />
                 </div>

                 <div className="pt-4 flex justify-end">
                   <button onClick={handleSavePassword} disabled={loading} className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-colors">
                       {loading ? <Loader2 className="animate-spin" size={20}/> : <Lock size={20}/>} 
                       Atualizar Senha
                   </button>
                 </div>
               </div>
           </div>
           <p className="mt-4 text-sm text-gray-500 text-center">
              Se você fez login com Google, não precisa definir senha aqui.
           </p>
        </div>
      )}

      {/* 3. ABA PERFIL SOCIAL */}
      {activeTab === 'social' && (
        <div className="animate-fadeIn max-w-3xl px-6 md:px-0 pt-6">
           <div className="bg-theme-sidebar p-8 rounded-2xl border border-white/5">
               <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                   <Share2 size={20} className="text-theme-primary"/> Suas Redes
               </h3>
               
               <div className="space-y-4">
                 <div className="flex items-center gap-4 bg-black/20 p-2 rounded-xl border border-white/5">
                    <div className="w-10 h-10 flex items-center justify-center bg-[#1877F2]/10 rounded-lg">
                        <Facebook className="text-[#1877F2]" size={20}/>
                    </div>
                    <input 
                       type="text" 
                       value={formData.social_facebook}
                       onChange={e => setFormData({...formData, social_facebook: e.target.value})}
                       className="flex-1 bg-transparent border-none text-white focus:outline-none text-sm"
                       placeholder="Cole seu link do Facebook"
                    />
                 </div>

                 <div className="flex items-center gap-4 bg-black/20 p-2 rounded-xl border border-white/5">
                    <div className="w-10 h-10 flex items-center justify-center bg-[#E4405F]/10 rounded-lg">
                        <Instagram className="text-[#E4405F]" size={20}/>
                    </div>
                    <input 
                       type="text" 
                       value={formData.social_instagram}
                       onChange={e => setFormData({...formData, social_instagram: e.target.value})}
                       className="flex-1 bg-transparent border-none text-white focus:outline-none text-sm"
                       placeholder="Cole seu link do Instagram"
                    />
                 </div>

                 <div className="flex items-center gap-4 bg-black/20 p-2 rounded-xl border border-white/5">
                    <div className="w-10 h-10 flex items-center justify-center bg-[#1DA1F2]/10 rounded-lg">
                        <Twitter className="text-[#1DA1F2]" size={20}/>
                    </div>
                    <input 
                       type="text" 
                       value={formData.social_twitter}
                       onChange={e => setFormData({...formData, social_twitter: e.target.value})}
                       className="flex-1 bg-transparent border-none text-white focus:outline-none text-sm"
                       placeholder="Cole seu link do Twitter"
                    />
                 </div>

                 <div className="flex items-center gap-4 bg-black/20 p-2 rounded-xl border border-white/5">
                    <div className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg">
                        <Video className="text-white" size={20}/>
                    </div>
                    <input 
                       type="text" 
                       value={formData.social_tiktok}
                       onChange={e => setFormData({...formData, social_tiktok: e.target.value})}
                       className="flex-1 bg-transparent border-none text-white focus:outline-none text-sm"
                       placeholder="Cole seu link do TikTok"
                    />
                 </div>
               </div>

               <div className="flex justify-end mt-8">
                 <button onClick={handleSaveProfile} disabled={loading} className="bg-theme-primary hover:bg-theme-primary/90 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-all">
                    {loading ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>} 
                    Salvar Redes
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}