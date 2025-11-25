// src/components/Row.jsx
import React from 'react';
import Card from './Card'; // Importamos a peça que criamos acima

const Row = ({ title, items, isLargeRow }) => {
  return (
    <div className="ml-5 my-8">
      {/* Título da Categoria */}
      <h2 className="text-white text-xl font-bold mb-4 hover:text-gray-300 cursor-pointer transition-colors">
        {title}
      </h2>

      {/* Área de Rolagem Horizontal (O "Trilho") */}
      <div className="flex overflow-x-scroll scrollbar-hide gap-4 p-4 -ml-4">
        {items.map((item) => (
          <Card 
            key={item.id} 
            item={item} 
            isLarge={isLargeRow} // Se for true, o card fica vertical (Packs)
          />
        ))}
      </div>
    </div>
  );
};

export default Row;