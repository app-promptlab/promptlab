import React from 'react';

export default function Hero({ settings }) {
  // Define o alinhamento baseado na configuração do banco
  const alignmentClass = settings.logo_position === 'flex-start' ? 'justify-start' 
                       : settings.logo_position === 'flex-end' ? 'justify-end' 
                       : 'justify-center';

  return (
    <div className="relative w-full h-64 md:h-80 bg-gray-900 overflow-hidden">
        {/* Imagem de Fundo */}
        {settings.banner_url && (
            <img src={settings.banner_url} className="w-full h-full object-cover opacity-80" alt="Banner"/>
        )}
        
        {/* Gradiente para suavizar */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black"></div>
        
        {/* Logo Sobreposta */}
        <div className={`absolute inset-0 p-8 flex items-center ${alignmentClass}`}>
            {settings.logo_header_url && (
                <img 
                    src={settings.logo_header_url} 
                    className="h-24 md:h-32 object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duration-500" 
                    alt="Logo Header"
                />
            )}
        </div>
    </div>
  );
}