import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Calendar, User, ThumbsUp, Heart, Smile } from 'lucide-react';

export const NewsDetail = () => {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reactions, setReactions] = useState({ like: 0, love: 0, wow: 0 });

  useEffect(() => {
    loadArticle();
  }, [id]);

  const loadArticle = async () => {
    try {
      const res = await api.get(`/api/news/${id}`)
      const found = res.data.find(item => String(item.id) === String(id));
      if (found) {
        setNews(found);
        setReactions(found.reactions || { like: 0, love: 0, wow: 0 });
      }
    } catch (err) {
      console.error("Erro ao carregar notícia:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReact = async (type) => {
    const votedKey = `voted_news_${id}`;
    if (localStorage.getItem(votedKey)) {
      alert('Você já reagiu a esta matéria!');
      return;
    }

    try {
      const res = await api.post(`/news/${id}/react`, { type });
      setReactions(res.data.reactions);
      localStorage.setItem(votedKey, 'true');
      alert('Obrigado pela sua reação!');
    } catch (err) {
      console.error("Erro ao registrar reação:", err);
      alert('Erro ao registrar reação.');
    }
  };

  const renderFormattedContent = (content) => {
    if (!content) return null;
    const regex = /\[IMAGEM:(.*?)\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }
      const imgUrl = match[1].trim();
      parts.push(
        <div key={match.index} className="my-6">
          <img src={imgUrl} alt="Imagem interna" className="w-full max-h-112.5 object-contain rounded-lg shadow-md bg-black/5" />
        </div>
      );
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts.length > 0 ? parts : content;
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-gray-500 font-medium">Carregando notícia...</p>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Notícia não encontrada</h2>
        <p className="text-gray-600">O conteúdo que você está procurando pode ter sido removido ou não existe.</p>
        <Link to="/" className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded font-semibold text-sm hover:bg-red-700 transition">
          <ArrowLeft size={16} /> Voltar para a Página Inicial
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Botão de Voltar */}
      <div>
        <Link to="/" className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold text-sm transition">
          <ArrowLeft size={16} /> Voltar para o início
        </Link>
      </div>

      {/* Cabeçalho da Notícia */}
      <div className="space-y-3">
        <span className="inline-block bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          {news.category || 'Geral'}
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
          {news.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 pt-2 border-b pb-4">
          <Link 
            to={`/author/${encodeURIComponent(news.author || 'Redação')}`} 
            className="flex items-center gap-1.5 font-medium text-gray-700 hover:text-red-600 transition"
          >
            <User size={16} className="text-red-600" /> {news.author || 'Redação'}
          </Link>
          {news.date && (
            <span className="flex items-center gap-1.5">
              <Calendar size={16} /> {new Date(news.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })} às {new Date(news.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      {/* Imagem de Capa (Ajustada com object-contain para exibir a arte inteira sem cortes) */}
      {news.imageUrl && (
        <div className="w-full max-h-112.5 flex justify-center items-center overflow-hidden rounded-lg shadow-sm bg-gray-900 border">
          <img src={news.imageUrl} alt={news.title} className="w-full max-h-112.5 object-contain" />
        </div>
      )}

      {/* Resumo / Lead */}
      {news.summary && (
        <p className="text-lg font-medium text-gray-700 leading-relaxed border-l-4 border-red-600 pl-4 py-1">
          {news.summary}
        </p>
      )}

      {/* Corpo da Notícia */}
      <div className="prose max-w-none text-gray-800 text-base leading-relaxed space-y-4 whitespace-pre-wrap">
        {renderFormattedContent(news.content)}
      </div>

      {/* Seção de Reações com Emojis */}
      <div className="mt-12 pt-6 border-t border-gray-200 bg-gray-50 p-6 rounded-lg border">
        <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">O que você achou desta notícia?</h4>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => handleReact('like')}
            className="flex items-center gap-2 bg-white hover:bg-gray-100 border border-gray-300 px-4 py-2.5 rounded-full text-sm font-semibold transition cursor-pointer shadow-sm"
          >
            <ThumbsUp size5={16} className="text-blue-600" /> Curtir <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">{reactions.like}</span>
          </button>
          
          <button 
            onClick={() => handleReact('love')}
            className="flex items-center gap-2 bg-white hover:bg-gray-100 border border-gray-300 px-4 py-2.5 rounded-full text-sm font-semibold transition cursor-pointer shadow-sm"
          >
            <Heart size={16} className="text-red-600" /> Amei <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded-full text-xs font-bold">{reactions.love}</span>
          </button>
          
          <button 
            onClick={() => handleReact('wow')}
            className="flex items-center gap-2 bg-white hover:bg-gray-100 border border-gray-300 px-4 py-2.5 rounded-full text-sm font-semibold transition cursor-pointer shadow-sm"
          >
            <Smile size={16} className="text-amber-500" /> Surpreso <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-xs font-bold">{reactions.wow}</span>
          </button>
        </div>
      </div>
    </div>
  );
};