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
  
  // ... (Mantenha o return visual do Profile igual ao anterior)
  return <div className="text-white p-8">Profile Loaded (Copie o return visual)</div>;
}