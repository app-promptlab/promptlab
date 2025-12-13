import React from 'react';
import DynamicPage from '../components/DynamicPage';

export default function TutorialsPage() {
  return (
    <DynamicPage pageId="tutorials">
        {/* FULL BLEED: px-0 no mobile, md:px-8 no Desktop */}
        <div className="px-0 md:px-8 pb-20">
             {/* A lista de vídeos virá do DynamicPage, ocupando largura total no mobile */}
        </div>
    </DynamicPage>
  );
}