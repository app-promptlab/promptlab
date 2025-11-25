// src/components/Card.jsx
import React from 'react';

const Card = ({ item, isLarge }) => {
  return (
    <div 
      className={`
        relative flex-none transition-transform duration-300 hover:scale-110 hover:z-50 cursor-pointer
        ${isLarge ? 'w-[200px] h-[300px]' : 'w-[280px] h-[160px]'}
      `}
    >
      {/* Imagem do Prompt ou Pack */}
      <img 
        src={item.image_url || "https://via.placeholder.com/300"} // Fallback se não tiver imagem
        alt={item.title} 
        className="rounded-md object-cover w-full h-full shadow-lg"
      />
      
      {/* Título que aparece no Hover (opcional) */}
      <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-end p-2 rounded-md">
        <p className="text-white text-sm font-bold">{item.title}</p>
      </div>
    </div>
  );
};

export default Card;