import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useSearchParams } from 'react-router-dom';
import { Header } from './components/Header';
import { Admin } from './components/Admin';
import { NewsDetail } from './components/NewsDetail';
import { AuthorProfile } from './components/AuthorProfile';
import { AdBanner } from './components/AdBanner';
import { ColumnistLogin } from './components/ColumnistLogin';
import api from './services/api';
import { TrendingUp, Clock, Flame, ChevronLeft, ChevronRight, Globe, Share2, MessageSquareQuote } from 'lucide-react';

const Home = ({ darkMode }) => {
  const [newsList, setNewsList] = useState([]);
  const [opinionsList, setOpinionsList] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category');
  const searchQuery = searchParams.get('search');

  useEffect(() => {
    api.get('/api/news').then(res => setNewsList(res.data)).catch(err => console.error(err));
    api.get('/api/opinions').then(res => setOpinionsList(res.data)).catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (newsList.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % Math.min(newsList.length, 4));
    }, 5000);
    return () => clearInterval(timer);
  }, [newsList]);

  let filteredNews = newsList;
  if (selectedCategory) {
    filteredNews = newsList.filter(item => item.category && item.category.toLowerCase().includes(selectedCategory.toLowerCase().split(' ')[0]));
  } else if (searchQuery) {
    filteredNews = newsList.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.summary.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const sliderArticles = newsList.slice(0, 4);
  const mostRead = [...newsList].slice(0, 5);
  const recentOpinions = opinionsList.slice(0, 3);

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % sliderArticles.length);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + sliderArticles.length) % sliderArticles.length);

  return (
    <div className={`container mx-auto px-4 py-8 transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
      <div className={`${darkMode ? 'bg-red-950/80 border border-red-900' : 'bg-red-950'} text-white px-4 py-2 mb-6 rounded flex items-center gap-3 shadow-inner`}>
        <span className="bg-para-red text-white text-xs font-black uppercase px-2 py-1 rounded animate-pulse">Plantão</span>
        <p className="text-xs md:text-sm font-medium tracking-wide">
          {newsList.length > 0 ? `Cobertura em tempo real: ${newsList[0].title}` : 'Bem-vindo ao Portal Ver-o-Fato. A veracidade da informação em primeiro lugar.'}
        </p>
      </div>

      {!selectedCategory && !searchQuery && sliderArticles.length > 0 && (
        <div className="mb-10 relative bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-800 group">
          <div className="relative h-[380px] md:h-[450px] w-full">
            {sliderArticles.map((article, index) => (
              <div 
                key={article.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              >
                <img 
                  src={article.imageUrl || 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?q=80&w=1200'} 
                  alt={article.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-10">
                  <span className="bg-para-red text-white px-3 py-1 rounded text-xs font-black uppercase w-max mb-3 tracking-wider">
                    {article.category}
                  </span>
                  <Link to={`/news/${article.id}`}>
                    <h1 className="text-2xl md:text-4xl font-black text-white leading-tight hover:underline mb-2">{article.title}</h1>
                  </Link>
                  <p className="text-gray-300 text-sm md:text-base line-clamp-2 max-w-3xl">{article.summary}</p>
                </div>
              </div>
            ))}
          </div>

          <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-para-red text-white p-2 rounded-full transition cursor-pointer">
            <ChevronLeft size={24} />
          </button>
          <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-para-red text-white p-2 rounded-full transition cursor-pointer">
            <ChevronRight size={24} />
          </button>

          <div className="absolute bottom-4 right-6 z-20 flex gap-2">
            {sliderArticles.map((_, idx) => (
              <button 
                key={idx} 
                onClick={() => setCurrentSlide(idx)}
                className={`w-3 h-3 rounded-full transition cursor-pointer ${idx === currentSlide ? 'bg-para-red w-6' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </div>
      )}

      <AdBanner size="leaderboard" />

      {searchQuery && (
        <div className="mb-6 flex justify-between items-center bg-gray-200 dark:bg-gray-800 p-3 rounded">
          <p className="text-sm font-bold">Resultados da busca por: &quot;<span className="text-para-red">{searchQuery}</span>&quot;</p>
          <Link to="/" className="text-xs font-bold text-para-red hover:underline">Limpar busca</Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        <div className="lg:col-span-2 space-y-8">
          <div className={`border-b-2 ${darkMode ? 'border-gray-700' : 'border-gray-900'} pb-2 flex justify-between items-end`}>
            <h2 className={`text-2xl font-black uppercase tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
              <Flame className="text-para-red" /> {selectedCategory ? `Editoria: ${selectedCategory}` : searchQuery ? 'Busca' : 'Últimas Notícias'}
            </h2>
            {(selectedCategory || searchQuery) && (
              <Link to="/" className="text-xs font-bold text-para-red hover:underline">Ver todas as notícias</Link>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredNews.map(item => (
              <div key={item.id} className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border overflow-hidden flex flex-col hover:shadow-md transition group`}>
                {item.imageUrl && (
                  <Link to={`/news/${item.id}`} className="h-44 overflow-hidden block">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  </Link>
                )}
                <div className="p-5 flex flex-col flex-grow">
                  <span className="bg-red-50 text-para-red px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider w-max mb-2">{item.category}</span>
                  <Link to={`/news/${item.id}`}>
                    <h3 className={`text-base font-black ${darkMode ? 'text-white' : 'text-gray-900'} mb-2 leading-snug group-hover:text-para-red transition`}>{item.title}</h3>
                  </Link>
                  <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4 flex-grow line-clamp-3 leading-relaxed`}>{item.summary}</p>
                  
                  <div className={`text-[11px] ${darkMode ? 'text-gray-400 border-gray-700' : 'text-gray-400 border-gray-100'} border-t pt-3 flex justify-between items-center`}>
                    <Link to={`/author/${encodeURIComponent(item.author || 'Redação')}`} className={`font-semibold hover:underline ${darkMode ? 'text-gray-200 hover:text-para-red' : 'text-gray-700 hover:text-para-red'}`}>
                      {item.author || 'Redação'}
                    </Link>
                    <span>{new Date(item.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-4 rounded-lg shadow-sm border text-center`}>
            <AdBanner size="rectangle" />
          </div>

          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-lg shadow-sm border relative overflow-hidden`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-para-blue"></div>
            <h3 className={`text-base font-black uppercase ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2 mb-4 tracking-wider`}>
              <TrendingUp className="text-para-blue" size={20} /> Mais Lidas do Dia
            </h3>
            <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
              {mostRead.map((item, index) => (
                <Link key={item.id} to={`/news/${item.id}`} className="py-3 flex items-start gap-4 group block">
                  <span className={`text-3xl font-black ${darkMode ? 'text-gray-700' : 'text-gray-200'} group-hover:text-para-red transition`}>0{index + 1}</span>
                  <div>
                    <span className="text-[10px] font-black uppercase text-para-red">{item.category}</span>
                    <h4 className={`text-xs font-bold ${darkMode ? 'text-gray-200' : 'text-gray-900'} group-hover:text-para-red transition leading-snug mt-0.5 line-clamp-2`}>{item.title}</h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-lg shadow-sm border relative overflow-hidden`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-para-red"></div>
            <h3 className={`text-base font-black uppercase ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2 mb-4 tracking-wider`}>
              <MessageSquareQuote className="text-para-red" size={20} /> Opinião & Colunistas
            </h3>
            <div className="space-y-4">
              {recentOpinions.map((col, idx) => (
                <div key={col.id} className={`flex items-start gap-3 pb-3 ${idx < recentOpinions.length - 1 ? (darkMode ? 'border-b border-gray-700' : 'border-b border-gray-100') : ''}`}>
                  <img src={col.avatarUrl} alt={col.author} className="w-10 h-10 rounded-full object-cover shadow-sm border border-para-red" />
                  <div>
                    <h4 className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-gray-900'} leading-tight hover:text-para-red transition cursor-pointer`}>{col.title}</h4>
                    <Link to={`/author/${encodeURIComponent(col.author || 'Colunista')}`} className="text-[10px] text-para-red font-bold mt-1 uppercase tracking-wider block hover:underline">
                      {col.author} • <span className="text-gray-400 font-normal">{col.role}</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <BrowserRouter>
      <div className={`min-h-screen ${darkMode ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-900'} flex flex-col font-sans transition-colors duration-300`}>
        <Header darkMode={darkMode} setDarkMode={setDarkMode} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home darkMode={darkMode} />} />
            <Route path="/news/:id" element={<NewsDetail darkMode={darkMode} />} />
            <Route path="/author/:username" element={<AuthorProfile darkMode={darkMode} />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/colunista" element={<ColumnistLogin />} />
          </Routes>
        </main>
        <footer className={`${darkMode ? 'bg-gray-900 border-gray-800 text-gray-400' : 'bg-gray-900 border-para-red text-white'} py-8 border-t-4 mt-12`}>
          <div className="container mx-auto px-4 text-center space-y-3">
            <h2 className="text-xl font-black tracking-widest text-white">PORTAL VER-O-FATO</h2>
            <p className="text-xs text-gray-400">O seu jornal diário com a verdadeira identidade do Pará. Desenvolvido para Belém e região.</p>
            <p className="text-[11px] text-gray-600 pt-4 border-t border-gray-800">&copy; 2026 Portal Ver-o-Fato. Todos os direitos reservados.</p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}