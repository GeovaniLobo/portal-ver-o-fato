import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { PenTool, ArrowLeft } from 'lucide-react';

export const ColumnistLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('api/columnist-login', { username, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('name', res.data.name);
      localStorage.setItem('avatarUrl', res.data.avatarUrl || '');
      localStorage.setItem('area', res.data.area || '');
      localStorage.setItem('bio', res.data.bio || '');

      alert(`Bem-vindo(a) de volta, colunista ${res.data.name}!`);
      // Redireciona para o painel ou para uma área exclusiva de colunista
      navigate('/admin'); 
    } catch (err) {
      console.error(err);
      alert('Acesso negado. Verifique se o usuário é um colunista cadastrado e se a senha está correta.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-semibold">
          <ArrowLeft size={16} /> Voltar ao Portal
        </Link>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border">
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex p-3 bg-red-50 text-red-600 rounded-full">
            <PenTool size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Portal do Colunista</h1>
          <p className="text-xs text-gray-500">Faça login com sua conta de colunista para gerenciar seus artigos.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Usuário</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              className="w-full border p-2.5 rounded text-sm focus:ring-2 focus:ring-red-500 outline-none" 
              placeholder="Digite seu usuário"
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Senha</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full border p-2.5 rounded text-sm focus:ring-2 focus:ring-red-500 outline-none" 
              placeholder="••••••••"
              required 
            />
          </div>

          <button className="w-full bg-red-600 hover:bg-red-700 text-white p-2.5 rounded font-bold text-sm transition cursor-pointer shadow-sm">
            Entrar como Colunista
          </button>
        </form>
      </div>
    </div>
  );
};