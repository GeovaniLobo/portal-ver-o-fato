import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, User as UserIcon, Shield } from 'lucide-react';

export const AuthorProfile = () => {
  const { username } = useParams();
  const [author, setAuthor] = useState(null);
  const [authorNews, setAuthorNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/users'), api.get('/news')])
      .then(([usersRes, newsRes]) => {
        // Procura pelo username ou pelo nome normalizado sem espaços
        const foundUser = usersRes.data.find(u => 
          u.username.toLowerCase() === username.toLowerCase() || 
          u.name.toLowerCase().replace(/\s+/g, '') === username.toLowerCase().replace(/\s+/g, '')
        );
        setAuthor(foundUser);
        
        if (foundUser) {
          const filteredNews = newsRes.data.filter(n => n.author === foundUser.name);
          setAuthorNews(filteredNews);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Erro ao carregar perfil:', err);
        setLoading(false);
      });
  }, [username]);

  if (loading) return <div className="text-center py-12 text-gray-500">Carregando perfil...</div>;

  if (!author) return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Colaborador não encontrado</h2>
      <Link to="/" className="text-[var(--color-para-red)] font-bold underline">Voltar para a página inicial</Link>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[var(--color-para-red)] mb-6 transition">
        <ArrowLeft size={16} /> Voltar para o início
      </Link>

      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row items-center gap-6">
        {author.avatarUrl ? (
          <img src={author.avatarUrl} alt={author.name} className="w-28 h-28 rounded-full object-cover border-4 border-red-50 shadow-sm" />
        ) : (
          <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
            <UserIcon size={48} />
          </div>
        )}
        <div className="text-center md:text-left flex-grow">
          <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
            <h1 className="text-2xl font-black text-gray-900">{author.name}</h1>
            <span className="bg-blue-50 text-[var(--color-para-blue)] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1">
              <Shield size={12} /> {author.role}
            </span>
          </div>
          <p className="text-gray-600 text-sm">{author.bio || 'Sem biografia cadastrada.'}</p>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-[var(--color-para-red)] pl-3">
        Matérias Publicadas por {author.name} ({authorNews.length})
      </h2>

      {authorNews.length === 0 ? (
        <p className="text-sm text-gray-500 bg-white p-6 rounded-lg border">Este colaborador ainda não publicou nenhuma matéria.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {authorNews.map(item => (
            <Link key={item.id} to={`/news/${item.id}`} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition flex flex-col">
              <span className="text-xs font-bold text-[var(--color-para-red)] bg-red-50 px-2 py-0.5 rounded w-max mb-2">{item.category}</span>
              <h3 className="font-bold text-gray-800 mb-2 leading-snug">{item.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2 flex-grow mb-4">{item.summary}</p>
              <span className="text-xs text-gray-400">{new Date(item.date).toLocaleDateString('pt-BR')}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};