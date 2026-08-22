import React, { useState, useEffect } from 'react';
import { Star, CloudSun, DollarSign, Bitcoin, Search, Moon, Sun, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export const Header = ({ darkMode, setDarkMode }) => {
  const [dollar, setDollar] = useState('R$ 5,45');
  const [btc, setBtc] = useState('R$ 310 mil');
  const [searchQuery, setSearchQuery] = useState('');
  const [showWeatherModal, setShowWeatherModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('https://economia.awesomeapi.com.br/json/last/USD-BRL,BTC-BRL')
      .then(res => {
        if (res.data.USDBRL) setDollar(`R$ ${parseFloat(res.data.USDBRL.bid).toFixed(2)}`);
        if (res.data.BTCBRL) setBtc(`R$ ${(parseFloat(res.data.BTCBRL.bid) / 1000).toFixed(0)} mil`);
      })
      .catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className={`shadow-md transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Barra superior de indicadores */}
      <div className={`${darkMode ? 'bg-black text-gray-400 border-gray-800' : 'bg-gray-900 text-gray-300'} text-xs py-1.5 px-4 border-b`}>
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4 font-medium">
            <button 
              onClick={() => setShowWeatherModal(true)} 
              className="flex items-center gap-1 hover:text-amber-400 transition cursor-pointer"
              title="Clique para ver a previsão detalhada de Belém"
            >
              <CloudSun size={14} className="text-amber-400" /> Belém, PA: 31°C (Parcialmente nublado) ⛅
            </button>
            <span className="hidden md:inline text-gray-600">|</span>
            <span className="flex items-center gap-1"><DollarSign size={14} className="text-emerald-400" /> Dólar: <strong className={darkMode ? 'text-white' : 'text-white'}>{dollar}</strong></span>
            <span className="hidden md:inline text-gray-600">|</span>
            <span className="flex items-center gap-1"><Bitcoin size={14} className="text-orange-400" /> BTC: <strong className={darkMode ? 'text-white' : 'text-white'}>{btc}</strong></span>
          </div>
          <div className="font-semibold text-gray-400">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Barra principal do Logo, Busca e Dark Mode */}
      <div className="bg-para-red text-white py-5 px-4">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <Link to="/" className="text-3xl md:text-4xl font-black tracking-wider flex items-center gap-2 hover:opacity-95 transition">
            PORTAL VER-O-FATO <Star className="text-para-blue fill-para-blue" size={30} />
          </Link>

          <div className="flex items-center gap-4 w-full md:w-auto justify-end">
            {/* Barra de Pesquisa */}
            <form onSubmit={handleSearch} className="relative flex items-center w-full md:w-64">
              <input 
                type="text" 
                placeholder="Buscar notícias..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 border border-white/30 rounded-full py-1.5 pl-4 pr-10 text-xs text-white placeholder-white/70 focus:outline-none focus:bg-white/20 transition"
              />
              <button type="submit" className="absolute right-3 text-white/80 hover:text-white cursor-pointer">
                <Search size={15} />
              </button>
            </form>

            {/* Botão de Dark Mode */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition text-white cursor-pointer flex items-center justify-center"
              title={darkMode ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
            >
              {darkMode ? <Sun size={18} className="text-amber-300" /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu de Editorias */}
      <nav className="flex items-center gap-6 overflow-x-auto py-2 text-sm font-bold text-gray-800 whitespace-nowrap bg-white border-b px-4">
  <Link to="/" className="hover:text-red-600 transition">Início</Link>
  <Link to="/category/Pará" className="hover:text-red-600 transition">Pará</Link>
  <Link to="/category/Belém" className="hover:text-red-600 transition">Belém</Link>
  <Link to="/category/Política" className="hover:text-red-600 transition">Política</Link>
  <Link to="/category/Economia" className="hover:text-red-600 transition">Economia</Link>
  <Link to="/category/Esportes" className="hover:text-red-600 transition">Esportes</Link>
  <Link to="/category/Cotidiano" className="hover:text-red-600 transition">Cotidiano</Link>
  <Link to="/category/Cultura & Lazer" className="hover:text-red-600 transition">Cultura & Lazer</Link>
  <Link to="/category/Amazônia & Meio Ambiente" className="hover:text-red-600 transition">Amazônia & Meio Ambiente</Link>
  <Link to="/category/Brasil" className="hover:text-red-600 transition">Brasil</Link>
  <Link to="/category/Mundo" className="hover:text-red-600 transition">Mundo</Link>
  <Link to="/category/Tecnologia" className="hover:text-red-600 transition">Tecnologia</Link>
  <Link to="/category/Saúde" className="hover:text-red-600 transition">Saúde</Link>
</nav>

      {/* Modal de Previsão do Tempo Detalhada para Belém */}
      {showWeatherModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} p-6 rounded-xl max-w-md w-full shadow-2xl relative border border-gray-700`}>
            <button onClick={() => setShowWeatherModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-para-red cursor-pointer">
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <CloudSun size={36} className="text-amber-400" />
              <div>
                <h3 className="text-lg font-bold">Previsão do Tempo: Belém - PA</h3>
                <p className="text-xs text-gray-400">Atualizado agora • Estação Meteorológica Metropolitana</p>
              </div>
            </div>
            <div className="space-y-3 text-sm border-t border-b py-4 my-2 border-gray-700">
              <div className="flex justify-between"><span>Temperatura Atual:</span><strong className="text-amber-400">31°C</strong></div>
              <div className="flex justify-between"><span>Sensação Térmica:</span><strong>38°C (Alta Umidade)</strong></div>
              <div className="flex justify-between"><span>Probabilidade de Chuva:</span><strong className="text-blue-400">65% (Pancadas à tarde)</strong></div>
              <div className="flex justify-between"><span>Umidade do Ar:</span><strong>82%</strong></div>
            </div>
            <p className="text-[11px] text-gray-500 italic text-center">Clima típico da região equatorial. Não se esqueça do guarda-chuva!</p>
          </div>
        </div>
      )}
    </header>
  );
};