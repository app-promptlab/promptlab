import React from 'react';
import DynamicPage from '../components/DynamicPage';

export default function Generator() {
  return (
    <DynamicPage pageId="generator">
       {/* O conteúdo do Gerador (Vídeos, Banners de botões) agora virá inteiramente 
         da tabela 'page_content' carregada pelo DynamicPage.
         Não precisamos de código fixo aqui, exceto se quiser hardcodar algo extra.
       */}
       <div className="text-center text-gray-500 text-xs mt-10">
          Gerencie o conteúdo desta tela na aba "Gestor de Páginas" do Admin.
       </div>
    </DynamicPage>
  );
}