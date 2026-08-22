import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Upload, Flame, MessageSquareQuote, UserPlus, LogOut, Edit, Trash2, Image as ImageIcon, CheckCircle, BarChart2, FileText, Smile, Bold, Italic, Heading, LayoutDashboard, Users, Newspaper } from 'lucide-react';

export const Admin = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [activeTab, setActiveTab] = useState('news'); // 'news', 'opinions', 'team'
  
  const [users, setUsers] = useState([]);
  const [news, setNews] = useState([]);
  const [opinions, setOpinions] = useState([]);
  
  const [newsImageUrl, setNewsImageUrl] = useState('');
  const [opinionAvatarUrl, setOpinionAvatarUrl] = useState('');
  const [userAvatarUrl, setUserAvatarUrl] = useState('');

  const [editingUsername, setEditingUsername] = useState(null);
  const [formName, setFormName] = useState('');
  const [formUser, setFormUser] = useState('');
  const [formPass, setFormPass] = useState('');
  const [formRole, setFormRole] = useState('Jornalista');
  const [formArea, setFormArea] = useState('Geral');
  const [formBio, setFormBio] = useState('');

  const contentRef = useRef(null);
  const [newsContent, setNewsContent] = useState('');

  useEffect(() => { 
    if (token) loadData(); 
  }, [token]);

  const loadData = async () => {
    try {
      const [uRes, nRes, oRes] = await Promise.all([
        api.get('/api/users').catch(() => ({ data: [] })),
        api.get('/api/news').catch(() => ({ data: [] })),
        api.get('/api/opinions').catch(() => ({ data: [] }))
      ]);
      setUsers(uRes.data || []);
      setNews(nRes.data || []);
      setOpinions(oRes.data || []);
    } catch (e) { console.error(e); }
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setRole(null);
  };

  const uploadImageFile = async (e, setImageCallback) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await api.post('/api/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setImageCallback(res.data.imageUrl);
      alert('Upload realizado com sucesso!');
      loadData();
    } catch { alert('Erro ao enviar imagem.'); }
  };

  const handleInsertImageIntoContent = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await api.post('/api/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const imageUrl = res.data.imageUrl;
      const tag = `\n[IMAGEM:${imageUrl}]\n`;
      setNewsContent(prev => prev + tag);
      alert('Imagem inserida no texto com sucesso!');
    } catch {
      alert('Erro ao enviar imagem para o texto.');
    }
  };

  const insertFormatting = (tagOpen, tagClose = '') => {
    const textarea = contentRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = newsContent;
    const selectedText = text.substring(start, end);
    const replacement = `${tagOpen}${selectedText}${tagClose}`;
    const updated = text.substring(0, start) + replacement + text.substring(end);
    setNewsContent(updated);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tagOpen.length, end + tagOpen.length);
    }, 0);
  };

  const handleCreateNews = async (e) => {
    e.preventDefault();
    const authorName = localStorage.getItem('name') || 'Redação';
    try {
      await api.post('/api/news', {
          title: e.target.title.value,
          category: e.target.category.value,
          summary: e.target.summary.value,
          content: newsContent,
          imageUrl: newsImageUrl,
          author: authorName,
          status: 'publicado'
      });
      alert('Notícia publicada com sucesso!');
      setNewsImageUrl('');
      setNewsContent('');
      e.target.reset();
      loadData();
    } catch { alert('Erro ao publicar notícia.'); }
  };

  const handleApproveNews = async (item) => {
    try {
      await api.put(`/api/news/${item.id}`, { ...item, status: 'publicado' });
      alert('Notícia da curadoria aprovada e publicada!');
      loadData();
    } catch {
      alert('Erro ao aprovar notícia.');
    }
  };

  const handleCreateOpinion = async (e) => {
    e.preventDefault();
    const authorName = localStorage.getItem('name') || 'Colunista';
    try {
      await api.post('/api/opinions', {
          title: e.target.title.value,
          role: e.target.role.value, 
          avatarUrl: opinionAvatarUrl,
          author: authorName
      });
      alert('Coluna publicada com sucesso!');
      setOpinionAvatarUrl('');
      e.target.reset();
      loadData();
    } catch { alert('Erro ao publicar coluna.'); }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      const payload = { name: formName, username: formUser, password: formPass, role: formRole, avatarUrl: userAvatarUrl, area: formArea, bio: formBio };
      if (editingUsername) {
        await api.put(`/api/users/${editingUsername}`, payload);
        alert('Usuário atualizado com sucesso!');
      } else {
        await api.post('/api/users', payload);
        alert('Usuário cadastrado com sucesso!');
      }
      resetUserForm();
      loadData();
    } catch { alert('Erro ao salvar usuário.'); }
  };

  const handleEditClick = (u) => {
    setEditingUsername(u.username);
    setFormName(u.name || '');
    setFormUser(u.username || '');
    setFormPass('');
    setFormRole(u.role || 'Jornalista');
    setFormArea(u.area || 'Geral');
    setFormBio(u.bio || '');
    setUserAvatarUrl(u.avatarUrl || '');
  };

  const resetUserForm = () => {
    setEditingUsername(null);
    setFormName(''); setFormUser(''); setFormPass(''); setFormRole('Jornalista'); setFormArea('Geral'); setFormBio(''); setUserAvatarUrl('');
  };

  const handleDelete = async (endpoint, id) => {
    if (!confirm('Deseja realmente excluir este item?')) return;
    try {
      await api.delete(`/api/${endpoint}/${id}`);
      alert('Excluído com sucesso!');
      loadData();
    } catch { alert('Erro ao excluir item.'); }
  };

  if (!token) return (
    <div className="flex h-[80vh] items-center justify-center">
      <form onSubmit={async (e) => {
        e.preventDefault();
        try {
          const res = await api.post('/api/login', { username: e.target.user.value, password: e.target.pass.value });
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('role', res.data.role);
          localStorage.setItem('name', res.data.name);
          setToken(res.data.token);
          setRole(res.data.role);
        } catch { alert('Login falhou.'); }
      }} className="bg-white p-8 rounded-lg shadow-md w-80 border">
        <h2 className="text-xl font-bold text-red-600 mb-4 text-center">Área Restrita</h2>
        <input name="user" className="w-full border p-2 rounded mb-3 text-sm" placeholder="Usuário" required />
        <input name="pass" type="password" className="w-full border p-2 rounded mb-4 text-sm" placeholder="Senha" required />
        <button className="w-full bg-red-600 hover:bg-red-700 text-white p-2.5 rounded font-bold text-sm cursor-pointer">Entrar</button>
      </form>
    </div>
  );

  const pendingNews = (news || []).filter(item => item.status === 'pendente');
  const publishedNews = (news || []).filter(item => item.status !== 'pendente');
  const totalReactions = publishedNews.reduce((acc, curr) => {
    const r = curr.reactions || { like: 0, love: 0, wow: 0 };
    return acc + r.like + r.love + r.wow;
  }, 0);
  const availableImages = Array.from(new Set(news.map(n => n.imageUrl).filter(Boolean)));

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Topo / Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Painel de Gestão - <span className="text-red-600">{role}</span></h1>
          <p className="text-xs text-gray-500 mt-1">Portal Ver-o-Fato • Central de Redação</p>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 transition px-4 py-2 rounded text-sm font-semibold cursor-pointer">
            <LogOut size={16}/> Sair
        </button>
      </div>

      {/* Dashboard de Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase">Notícias Publicadas</p>
            <h3 className="text-2xl font-extrabold text-gray-800">{publishedNews.length}</h3>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-full"><FileText size={20}/></div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase">Rascunhos da IA</p>
            <h3 className="text-2xl font-extrabold text-amber-600">{pendingNews.length}</h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-full"><BarChart2 size={20}/></div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase">Colunas Publicadas</p>
            <h3 className="text-2xl font-extrabold text-gray-800">{(opinions || []).length}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><MessageSquareQuote size={20}/></div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase">Reações Gerais</p>
            <h3 className="text-2xl font-extrabold text-purple-600">{totalReactions}</h3>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-full"><Smile size={20}/></div>
        </div>
      </div>

      {/* Navegação por Abas (Botões Grandes) */}
      <div className="flex gap-3 bg-white p-3 rounded-lg shadow-sm border">
        <button 
          onClick={() => setActiveTab('news')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm transition cursor-pointer ${activeTab === 'news' ? 'bg-red-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          <Newspaper size={18}/> Gestão de Notícias
        </button>
        <button 
          onClick={() => setActiveTab('opinions')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm transition cursor-pointer ${activeTab === 'opinions' ? 'bg-red-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          <MessageSquareQuote size={18}/> Gestão de Colunas
        </button>
        {role === 'CEO' && (
          <button 
            onClick={() => setActiveTab('team')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm transition cursor-pointer ${activeTab === 'team' ? 'bg-red-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <Users size={18}/> Gestão de Equipe (CEO)
          </button>
        )}
      </div>

      {/* CONTEÚDO DA ABA: NOTÍCIAS */}
      {activeTab === 'news' && (
        <div className="bg-white p-8 rounded-lg shadow border space-y-6">
          <h2 className="text-xl font-bold text-red-600 flex items-center gap-2 border-b pb-3"><Flame size={20}/> Publicar e Gerenciar Notícias</h2>
          
          <form onSubmit={handleCreateNews} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Título da Notícia:</label>
                  <input name="title" placeholder="Digite um título chamativo..." className="w-full border p-3 text-sm rounded" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Editoria / Seção:</label>
                  <select name="category" className="w-full border p-3 text-sm bg-white rounded">
                    <option value="Pará">Pará</option>
                    <option value="Política">Política</option>
                    <option value="Economia">Economia</option>
                    <option value="Esportes">Esportes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Imagem de Capa:</label>
                  <label className="block border-2 border-dashed p-3 text-center text-xs cursor-pointer hover:bg-gray-50 text-gray-500 rounded">
                      <Upload size={14} className="inline mr-1" /> {newsImageUrl ? 'Capa Selecionada com Sucesso' : 'Selecionar Capa Principal'}
                      <input type="file" accept="image/*" onChange={(e) => uploadImageFile(e, setNewsImageUrl)} className="hidden" />
                  </label>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Resumo da Matéria (para a Home):</label>
                  <textarea name="summary" placeholder="Resumo curto..." className="w-full border p-2.5 text-sm rounded" rows="2" required></textarea>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-600">Corpo Completo da Matéria:</label>
                  <label className="text-xs text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-1 bg-blue-50 px-3 py-1 rounded border border-blue-200">
                    <ImageIcon size={14} /> Inserir Imagem no Texto
                    <input type="file" accept="image/*" onChange={handleInsertImageIntoContent} className="hidden" />
                  </label>
                </div>

                <div className="flex gap-1 bg-gray-100 p-2 rounded-t border border-b-0">
                  <button type="button" onClick={() => insertFormatting('**', '**')} className="px-3 py-1 bg-white rounded border hover:bg-gray-50 text-xs font-bold flex items-center gap-1" title="Negrito"><Bold size={13}/> Negrito</button>
                  <button type="button" onClick={() => insertFormatting('*', '*')} className="px-3 py-1 bg-white rounded border hover:bg-gray-50 text-xs italic flex items-center gap-1" title="Itálico"><Italic size={13}/> Itálico</button>
                  <button type="button" onClick={() => insertFormatting('\n## ')} className="px-3 py-1 bg-white rounded border hover:bg-gray-50 text-xs font-bold flex items-center gap-1" title="Subtítulo"><Heading size={13}/> Subtítulo</button>
                </div>

                <textarea 
                  ref={contentRef}
                  value={newsContent}
                  onChange={(e) => setNewsContent(e.target.value)}
                  placeholder="Escreva a matéria aqui..." 
                  className="w-full border p-3 text-sm rounded-b font-mono" 
                  rows="8" 
                  required
                ></textarea>
              </div>

              {availableImages.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-1">Reutilizar Imagens Anteriores:</p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {availableImages.map((img, idx) => (
                      <img 
                        key={idx} 
                        src={img} 
                        alt="Miniatura" 
                        className="w-12 h-12 object-cover rounded border cursor-pointer hover:border-red-600"
                        onClick={() => {
                          const tag = `\n[IMAGEM:${img}]\n`;
                          setNewsContent(prev => prev + tag);
                          alert('Tag de imagem adicionada ao texto!');
                        }}
                        title="Clique para adicionar no texto"
                      />
                    ))}
                  </div>
                </div>
              )}

              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 text-base font-bold rounded cursor-pointer">Publicar Notícia Oficial</button>
          </form>

          {/* Seção de Rascunhos da IA e Publicadas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
            {pendingNews.length > 0 && (
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <h3 className="font-bold text-sm text-amber-800 mb-3 flex items-center gap-2">🤖 Rascunhos da Curadoria IA ({pendingNews.length})</h3>
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                      {pendingNews.map(item => (
                          <div key={item.id} className="flex justify-between items-center text-xs bg-white p-3 rounded border shadow-sm">
                              <span className="truncate max-w-62.5 font-medium" title={item.title}>{item.title}</span>
                              <div className="flex gap-2">
                                <button onClick={() => handleApproveNews(item)} className="bg-green-100 text-green-700 px-3 py-1.5 rounded font-bold hover:bg-green-200 flex items-center gap-1"><CheckCircle size={14}/> Aprovar</button>
                                <button onClick={() => handleDelete('news', item.id)} className="bg-red-100 text-red-600 px-2 py-1.5 rounded font-bold hover:bg-red-200"><Trash2 size={14}/></button>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="font-bold text-sm text-gray-700 mb-3">Gerenciar Notícias Publicadas ({publishedNews.length})</h3>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                    {publishedNews.map(item => (
                        <div key={item.id} className="flex justify-between items-center text-xs bg-white p-3 rounded border shadow-sm">
                            <span className="truncate max-w-70 font-medium">{item.title}</span>
                            <button onClick={() => handleDelete('news', item.id)} className="text-red-500 hover:text-red-700 font-bold bg-red-50 px-2.5 py-1 rounded flex items-center gap-1"><Trash2 size={13}/> Excluir</button>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA: COLUNAS */}
      {activeTab === 'opinions' && (
        <div className="bg-white p-8 rounded-lg shadow border space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 border-b pb-3"><MessageSquareQuote size={20}/> Publicar e Gerenciar Colunas</h2>
          
          <form onSubmit={handleCreateOpinion} className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Título da Coluna:</label>
                <input name="title" placeholder="Ex: O futuro econômico da Amazônia" className="w-full border p-3 text-sm rounded" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Cargo / Editoria:</label>
                <input name="role" placeholder="Ex: Analista Político" className="w-full border p-3 text-sm rounded" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Foto do Colunista:</label>
                <label className="block border-2 border-dashed p-3 text-center text-xs cursor-pointer hover:bg-gray-50 text-gray-500 rounded">
                    <Upload size={14} className="inline mr-1" /> {opinionAvatarUrl ? 'Foto do Colunista OK' : 'Selecionar Foto'}
                    <input type="file" accept="image/*" onChange={(e) => uploadImageFile(e, setOpinionAvatarUrl)} className="hidden" />
                </label>
              </div>
              <button className="w-full bg-gray-900 hover:bg-black text-white p-3 text-base font-bold rounded cursor-pointer">Publicar Coluna Oficial</button>
          </form>

          <div className="pt-6 border-t">
              <h3 className="font-bold text-sm text-gray-700 mb-3">Colunas Publicadas</h3>
              <div className="max-h-60 overflow-y-auto space-y-2 max-w-2xl">
                  {(opinions || []).map(item => (
                      <div key={item.id} className="flex justify-between items-center text-xs bg-gray-50 p-3 rounded border shadow-sm">
                          <div>
                            <span className="font-bold text-sm block">{item.title}</span>
                            <span className="text-gray-500">{item.role} • Por {item.author}</span>
                          </div>
                          <button onClick={() => handleDelete('opinions', item.id)} className="text-red-500 hover:text-red-700 font-bold bg-red-50 px-3 py-1.5 rounded flex items-center gap-1"><Trash2 size={14}/> Excluir</button>
                      </div>
                  ))}
              </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA: EQUIPE (CEO) */}
      {activeTab === 'team' && role === 'CEO' && (
        <div className="bg-white p-8 rounded-lg shadow border space-y-6">
          <h2 className="text-xl font-bold text-green-600 flex items-center gap-2 border-b pb-3">
            <UserPlus size={20}/> {editingUsername ? `Editando Usuário: ${editingUsername}` : 'Cadastrar Novo Membro da Equipe'}
          </h2>
          
          <form onSubmit={handleSaveUser} className="space-y-4 max-w-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Nome Completo:</label>
                  <input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Nome" className="w-full border p-3 text-sm rounded" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Usuário de Login:</label>
                  <input value={formUser} onChange={e => setFormUser(e.target.value)} placeholder="username" className="w-full border p-3 text-sm rounded" required disabled={editingUsername !== null} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Senha:</label>
                  <input type="password" value={formPass} onChange={e => setFormPass(e.target.value)} placeholder={editingUsername ? "Nova senha (opcional)" : "Senha"} className="w-full border p-3 text-sm rounded" required={!editingUsername} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Nível de Acesso (Cargo):</label>
                  <select value={formRole} onChange={e => setFormRole(e.target.value)} className="w-full border p-3 text-sm bg-white rounded">
                    <option value="Jornalista">Jornalista</option>
                    <option value="Colunista">Colunista</option>
                    <option value="CEO">CEO</option>
                  </select>
                </div>
              </div>

              {formRole === 'Colunista' && (
                <div className="space-y-4 bg-gray-50 p-4 rounded border">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Área do Colunista:</label>
                    <input value={formArea} onChange={e => setFormArea(e.target.value)} placeholder="Ex: Economia, Esportes..." className="w-full border p-2.5 text-sm rounded bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Biografia Curta:</label>
                    <textarea value={formBio} onChange={e => setFormBio(e.target.value)} placeholder="Breve descrição..." className="w-full border p-2.5 text-sm rounded bg-white" rows="2"></textarea>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Foto de Perfil:</label>
                <label className="block border-2 border-dashed p-3 text-center text-xs cursor-pointer hover:bg-gray-50 text-gray-500 rounded">
                    <Upload size={14} className="inline mr-1" /> {userAvatarUrl ? 'Foto de Perfil OK' : 'Selecionar Foto de Perfil'}
                    <input type="file" accept="image/*" onChange={(e) => uploadImageFile(e, setUserAvatarUrl)} className="hidden" />
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white p-3 text-base font-bold rounded cursor-pointer">
                  {editingUsername ? 'Salvar Alterações' : 'Cadastrar Membro'}
                </button>
                {editingUsername && (
                  <button type="button" onClick={resetUserForm} className="bg-gray-400 text-white px-6 py-3 text-sm font-bold rounded">Cancelar</button>
                )}
              </div>
          </form>

          <div className="pt-6 border-t">
              <h3 className="font-bold text-sm text-gray-700 mb-3">Membros Cadastrados na Equipe</h3>
              <div className="max-h-60 overflow-y-auto space-y-2 max-w-2xl">
                  {(users || []).map(u => (
                      <div key={u.username} className="flex justify-between items-center text-xs bg-gray-50 p-3 rounded border shadow-sm">
                          <div>
                            <span className="font-bold text-sm">{u.name}</span> <span className="text-gray-500">(@{u.username})</span>
                            <span className="ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded font-semibold">{u.role}</span>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleEditClick(u)} className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded font-bold hover:bg-blue-200 flex items-center gap-1"><Edit size={13}/> Editar</button>
                            {u.username !== 'geovanilobo' && (
                              <button onClick={() => handleDelete('users', u.username)} className="bg-red-100 text-red-600 px-3 py-1.5 rounded font-bold hover:bg-red-200">Excluir</button>
                            )}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
        </div>
      )}
    </div>
  );
};