import React from 'react';

export const AdBanner = ({ size = "leaderboard" }) => {
  // Tamanhos clássicos de anúncios do Google
  const isLeaderboard = size === "leaderboard";
  
  return (
    <div className="w-full my-6 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center">
      <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-1">Área de Anúncio • Google AdSense</span>
      <div className={`flex items-center justify-center text-gray-400 dark:text-gray-500 font-medium text-xs ${isLeaderboard ? 'h-24 w-full max-w-182' : 'h-60 w-full max-w-75'}`}>
        {isLeaderboard ? 'Banner Horizontal (728x90)' : 'Banner Retangular (300x250)'}
      </div>
    </div>
  );
};