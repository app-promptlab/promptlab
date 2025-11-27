import React, { useState, useContext } from 'react';
import { Loader2, UploadCloud } from 'lucide-react';
import { supabase } from '../supabaseClient'; // Importa conexão única
import { ToastContext } from '../ToastContext'; // Importa contexto único

export default function ImageUploader({ currentImage, onUploadComplete, label, compact = false }) {
  const [uploading, setUploading] = useState(false);
  const context = useContext(ToastContext);
  // Proteção: Se o contexto falhar, usa um console.log para não quebrar o site
  const showToast = context?.showToast || ((msg) => console.log(msg));

  const uploadImage = async (event) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;
      const file = event.target.files[0];
      const fileName = `${Math.random()}.${file.name.split('.').pop()}`;
      
      const { error } = await supabase.storage.from('uploads').upload(fileName, file);
      if (error) throw error;
      
      const { data } = supabase.storage.from('uploads').getPublicUrl(fileName);
      onUploadComplete(data.publicUrl);
      showToast("Imagem enviada!");
    } catch (error) { alert('Erro: ' + error.message); } finally { setUploading(false); }
  };

  return (
    <div className={`relative group ${compact ? '' : 'mb-4'}`}>
      {!compact && <label className="text-gray-400 text-sm font-bold block mb-2">{label}</label>}
      <div className="flex items-center gap-3">
         <input type="file" accept="image/*" onChange={uploadImage} className="hidden" id={`file-${label}`} disabled={uploading}/>
         <label htmlFor={`file-${label}`} className={`cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-lg flex items-center ${uploading ? 'opacity-50' : ''}`}>
             {uploading ? <Loader2 size={16} className="animate-spin mr-2"/> : <UploadCloud size={16} className="mr-2"/>}
             {uploading ? '...' : (compact ? 'Trocar' : 'Escolher')}
         </label>
         {!compact && currentImage && <img src={currentImage} className="h-10 w-10 rounded object-cover border border-gray-700"/>}
      </div>
    </div>
  );
}