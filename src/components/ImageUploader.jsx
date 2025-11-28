import React, { useState, useContext } from 'react';
import { Loader2, UploadCloud } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { ToastContext } from '../ToastContext';

export default function ImageUploader({ currentImage, onUploadComplete, label, compact = false }) {
  const [uploading, setUploading] = useState(false);
  const { showToast } = useContext(ToastContext); // Consome o contexto

  const uploadImage = async (event) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) throw new Error('Selecione uma imagem.');
      const file = event.target.files[0];
      const fileName = `${Math.random()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage.from('uploads').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('uploads').getPublicUrl(fileName);
      onUploadComplete(data.publicUrl);
      showToast("Imagem enviada!");
    } catch (error) { alert('Erro: ' + error.message); } finally { setUploading(false); }
  };
  // ... (Resto do return igual)
  return <div className="text-white">Uploader</div>; // Use o return visual completo
}