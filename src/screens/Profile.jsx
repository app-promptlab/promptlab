import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { User, Lock, Share2, Camera, Save, Trash2, Loader2, Facebook, Twitter, Instagram, Video } from 'lucide-react';

export default function Profile({ user, showToast }) {
  const [activeTab, setActiveTab] = useState('perfil');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Estado do Formulário Geral
  const [formData, setFormData] = useState({
    name: '',
    last_name: '',
    email: '', // Read only
    phone: '',
    avatar: '',
    cover: '',
    social_facebook: '',
    social_twitter: '',
    social_instagram: '',
    social_tiktok: ''
  });

  // Estado do Formulário de Senha
  const [passData, setPassData] = useState({ current: '', new: '', confirm: '' });

  // Carregar dados ao montar
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        last_name: user.last_name || '', // Novo campo
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

  // Função de Upload de Imagem (Genérica)
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
      
      // Atualiza estado local e salva no banco automaticamente para UX fluida
      setFormData(prev => ({ ...prev, [field]: data.publicUrl }));
      await supabase.from('profiles').update({ [field]: data.publicUrl }).eq('id', user.id);
      
      showToast(`${field === 'cover' ? 'Capa' : 'Avatar'} atualizado!`);
    } catch (error) {
      alert('Erro no upload: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Salvar Perfil ou Social
  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Remove campos que não são do banco para evitar erro, se necessário
      const { email, ...updates } = formData; 
      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
      
      if (error) throw error;
      showToast("Informações salvas com sucesso!");
    } catch (error) {
      alert("Erro ao salvar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Salvar Senha
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
    <div className="max-w-5xl mx-auto px-6 py-10 animate-fadeIn pb-32">
      
      <h1 className="text-3xl font-bold text-white mb-8">Configurações</h1>

      {/* --- ABAS DE NAVEGAÇÃO --- */}
      <div className="flex border-b border-gray-800 mb-10">
        {[
          { id: 'perfil', label: 'Perfil', icon: User },
          { id: 'senha', label: 'Senha', icon: Lock },
          { id: 'social', label: 'Perfil Social', icon: Share2 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-6 py-4 font-bold text-sm transition-all relative
              ${activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'}
            `}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></span>
            )}
          </button>
        ))}
      </div>

      {/* --- CONTEÚDO DAS ABAS --- */}
      
      {/* 1. ABA PERFIL */}
      {activeTab === 'perfil' && (
        <div className="animate-fadeIn">
          {/* Capa */}
          <div className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden bg-gray-800 group border border-gray-800 mb-16">
            {formData.cover ? (
              <img src={formData.cover} className="w-full h-full object-cover" alt="Cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-900/40 to-purple-900/40 flex items-center justify-center text-gray-600">Sem capa</div>
            )}
            
            {/* Botões da Capa */}
            <div className="absolute top-4 right-4">
               {formData.cover && (
                 <button 
                    onClick={() => { setFormData({...formData, cover: ''}); supabase.from('profiles').update({cover: null}).eq('id', user.id); }}
                    className="bg-black/60 p-2 rounded-full text-white hover:bg-red-600 transition-colors"
                 >
                    <Trash2 size={16}/>
                 </button>
               )}
            </div>
            <div className="absolute bottom-4 right-4">
               <label className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 cursor-pointer shadow-lg transition-transform hover:scale-105">
                  <Camera size={16}/> Atualizar foto da capa
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'cover')} disabled={uploading}/>
               </label>
            </div>

            {/* Avatar (Sobreposto) */}
            <div className="absolute -bottom-12 left-8 md:left-12">
               <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-black bg-gray-900 overflow-hidden relative group">
                  <img src={formData.avatar || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" alt="Avatar"/>
                  
                  {/* Overlay Upload Avatar */}
                  <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="text-white" size={24}/>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'avatar')} disabled={uploading}/>
                  </label>
               </div>
            </div>
          </div>

          <p className="text-right text-xs text-gray-500 mb-8 mt-4 md:mt-0">
             Tamanho recomendado Capa: 700x430px | Perfil: 200x200px
          </p>

          {/* Formulário Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
             <div>
                <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Nome</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                />
             </div>
             <div>
                <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Sobrenome</label>
                <input 
                  type="text" 
                  value={formData.last_name} 
                  onChange={e => setFormData({...formData, last_name: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                  placeholder="Último nome"
                />
             </div>
             <div>
                <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Email (Usuário)</label>
                <input 
                  type="text" 
                  value={formData.email} 
                  disabled
                  className="w-full bg-black border border-gray-800 rounded-lg p-3 text-gray-500 cursor-not-allowed"
                />
             </div>
             <div>
                <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Número de Telefone</label>
                <input 
                  type="text" 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                  placeholder="(00) 00000-0000"
                />
             </div>
          </div>

          <div className="flex justify-end">
             <button onClick={handleSaveProfile} disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>} 
                Atualizar Perfil
             </button>
          </div>
        </div>
      )}

      {/* 2. ABA SENHA */}
      {activeTab === 'senha' && (
        <div className="animate-fadeIn max-w-2xl">
           <div className="space-y-6">
              <div>
                 <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Senha atual</label>
                 <input 
                   type="password" 
                   value={passData.current}
                   onChange={e => setPassData({...passData, current: e.target.value})}
                   className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                   placeholder="Digite sua senha atual"
                 />
              </div>
              <div>
                 <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Nova Senha</label>
                 <input 
                   type="password" 
                   value={passData.new}
                   onChange={e => setPassData({...passData, new: e.target.value})}
                   className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                   placeholder="Mínimo 6 caracteres"
                 />
              </div>
              <div>
                 <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Redigite a nova senha</label>
                 <input 
                   type="password" 
                   value={passData.confirm}
                   onChange={e => setPassData({...passData, confirm: e.target.value})}
                   className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                   placeholder="Confirme a senha"
                 />
              </div>

              <div className="pt-4">
                <button onClick={handleSavePassword} disabled={loading} className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2">
                    {loading ? <Loader2 className="animate-spin" size={20}/> : <Lock size={20}/>} 
                    Redefinir senha
                </button>
              </div>
           </div>
        </div>
      )}

      {/* 3. ABA PERFIL SOCIAL */}
      {activeTab === 'social' && (
        <div className="animate-fadeIn max-w-3xl">
           <h3 className="text-white font-bold mb-6">Link de perfil social</h3>
           
           <div className="space-y-6">
              {/* Facebook */}
              <div className="flex items-center gap-4">
                 <div className="w-8 flex justify-center"><Facebook className="text-blue-500" size={24}/></div>
                 <span className="text-white font-bold w-24">Facebook</span>
                 <input 
                    type="text" 
                    value={formData.social_facebook}
                    onChange={e => setFormData({...formData, social_facebook: e.target.value})}
                    className="flex-1 bg-gray-900 border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                    placeholder="https://facebook.com/seuusuario"
                 />
              </div>

              {/* Instagram */}
              <div className="flex items-center gap-4">
                 <div className="w-8 flex justify-center"><Instagram className="text-pink-500" size={24}/></div>
                 <span className="text-white font-bold w-24">Instagram</span>
                 <input 
                    type="text" 
                    value={formData.social_instagram}
                    onChange={e => setFormData({...formData, social_instagram: e.target.value})}
                    className="flex-1 bg-gray-900 border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                    placeholder="https://instagram.com/seuusuario"
                 />
              </div>

              {/* Twitter */}
              <div className="flex items-center gap-4">
                 <div className="w-8 flex justify-center"><Twitter className="text-sky-500" size={24}/></div>
                 <span className="text-white font-bold w-24">Twitter</span>
                 <input 
                    type="text" 
                    value={formData.social_twitter}
                    onChange={e => setFormData({...formData, social_twitter: e.target.value})}
                    className="flex-1 bg-gray-900 border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                    placeholder="https://twitter.com/seuusuario"
                 />
              </div>

              {/* TikTok */}
              <div className="flex items-center gap-4">
                 <div className="w-8 flex justify-center"><Video className="text-white" size={24}/></div>
                 <span className="text-white font-bold w-24">TikTok</span>
                 <input 
                    type="text" 
                    value={formData.social_tiktok}
                    onChange={e => setFormData({...formData, social_tiktok: e.target.value})}
                    className="flex-1 bg-gray-900 border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                    placeholder="https://tiktok.com/@seuusuario"
                 />
              </div>
           </div>

           <div className="flex justify-end mt-10">
             <button onClick={handleSaveProfile} disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>} 
                Atualizar Perfil
             </button>
          </div>
        </div>
      )}

    </div>
  );
}