import React, { useEffect } from 'react';

export const AdBanner = ({ size = "leaderboard", slotId = "" }) => {
  const isLeaderboard = size === "leaderboard";

  useEffect(() => {
    try {
      // Dispara o carregamento do anúncio do Google AdSense
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("Erro ao carregar anúncio do AdSense:", e);
    }
  }, []);

  return (
    <div className="w-full my-6 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center overflow-hidden">
      <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-1">Área de Anúncio • Google AdSense</span>
      
      {/* Bloco oficial do Google AdSense */}
      <ins className="adsbygoogle"
           style={{ 
             display: 'block', 
             width: isLeaderboard ? '100%' : '300px', 
             height: isLeaderboard ? '90px' : '250px' 
           }}
           data-ad-client="ca-pub-3840700031428450"
           data-ad-slot={slotId}
           data-ad-format={isLeaderboard ? "horizontal" : "rectangle"}
           data-full-width-responsive="true"></ins>
    </div>
  );
};