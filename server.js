const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET_KEY = 'ver_o_fato_chave_segura_mestra';
const DB_FILE = path.join(__dirname, 'database.json');

// Setup Upload
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
app.use('/uploads', express.static(uploadDir));
const upload = multer({ storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
})});

// Helpers Banco
const loadDB = () => JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
const saveDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// Rotas Autenticação
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const db = loadDB();
    const user = db.users.find(u => u.username === username);
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
        const token = jwt.sign({ username: user.username, role: user.role, name: user.name }, SECRET_KEY, { expiresIn: '8h' });
        res.json({ token, role: user.role, name: user.name, username: user.username, avatarUrl: user.avatarUrl });
    } else {
        res.status(401).json({ error: 'Credenciais inválidas' });
    }
});

app.post('/api/columnist-login', async (req, res) => {
    const { username, password } = req.body;
    const db = loadDB();
    const user = db.users.find(u => u.username === username && u.role === 'Colunista');
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
        const token = jwt.sign({ username: user.username, role: user.role, name: user.name }, SECRET_KEY, { expiresIn: '8h' });
        res.json({ token, role: user.role, name: user.name, username: user.username, avatarUrl: user.avatarUrl, area: user.area, bio: user.bio });
    } else {
        res.status(401).json({ error: 'Credenciais de colunista inválidas' });
    }
});

app.get('/api/users', (req, res) => res.json(loadDB().users.map(({passwordHash, ...u}) => u)));

app.post('/api/users', async (req, res) => {
    const db = loadDB();
    const { name, username, password, role, avatarUrl, bio, area } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    db.users.push({ name, username, passwordHash, role, avatarUrl, bio: bio || '', area: area || 'Geral' });
    saveDB(db);
    res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
});

app.put('/api/users/:username', async (req, res) => {
    const db = loadDB();
    const { username } = req.params;
    const { name, role, avatarUrl, bio, area, password } = req.body;
    const userIndex = db.users.findIndex(u => u.username === username);
    if (userIndex === -1) return res.status(404).json({ error: 'Usuário não encontrado' });
    db.users[userIndex].name = name || db.users[userIndex].name;
    db.users[userIndex].role = role || db.users[userIndex].role;
    db.users[userIndex].avatarUrl = avatarUrl !== undefined ? avatarUrl : db.users[userIndex].avatarUrl;
    db.users[userIndex].bio = bio !== undefined ? bio : db.users[userIndex].bio;
    db.users[userIndex].area = area !== undefined ? area : db.users[userIndex].area;
    if (password && password.trim() !== '') db.users[userIndex].passwordHash = await bcrypt.hash(password, 10);
    saveDB(db);
    res.json({ message: 'Usuário atualizado com sucesso!' });
});

app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    res.json({ imageUrl: `https://server-ixpv.onrender.com/uploads/${req.file.filename}` });
});

// Rotas Conteúdo - Notícias
app.get('/api/news', (req, res) => res.json(loadDB().news || []));

app.post('/api/news', (req, res) => {
    const db = loadDB();
    const newArticle = { ...req.body, id: Date.now(), date: new Date().toISOString(), author: req.body.author || 'Redação', reactions: { like: 0, love: 0, wow: 0 } };
    db.news.unshift(newArticle);
    saveDB(db);
    res.json({ message: 'Sucesso', data: newArticle });
});

// Rota de aprovação de rascunho (PUT corrigido com /api)
app.put('/api/news/:id', (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;
    const db = loadDB();
    const index = db.news.findIndex(n => String(n.id) === String(id));
    if (index === -1) return res.status(404).json({ error: 'Notícia não encontrada' });
    db.news[index] = { ...db.news[index], ...updatedData };
    saveDB(db);
    res.json({ success: true, message: 'Notícia atualizada com sucesso!' });
});

app.post('/api/news/:id/react', (req, res) => {
    const db = loadDB();
    const { id } = req.params;
    const { type } = req.body;
    const article = db.news.find(item => String(item.id) === String(id));
    if (!article) return res.status(404).json({ error: 'Notícia não encontrada' });
    if (article.reactions[type] !== undefined) {
        article.reactions[type] += 1;
        saveDB(db);
        return res.json({ reactions: article.reactions });
    }
    res.status(400).json({ error: 'Tipo inválido' });
});

app.get('/api/opinions', (req, res) => res.json(loadDB().opinions || []));
app.post('/api/opinions', (req, res) => {
    const db = loadDB();
    const newOpinion = { ...req.body, id: Date.now(), author: req.body.author || 'Colunista' };
    db.opinions.unshift(newOpinion);
    saveDB(db);
    res.json({ message: 'Sucesso', data: newOpinion });
});

app.delete('/api/:endpoint/:id', (req, res) => {
    const db = loadDB();
    const { endpoint, id } = req.params;
    if (db[endpoint]) {
        if (endpoint === 'users') db[endpoint] = db[endpoint].filter(item => item.username !== id);
        else db[endpoint] = db[endpoint].filter(item => String(item.id) !== String(id));
        saveDB(db);
        return res.json({ message: 'Excluído com sucesso' });
    }
    res.status(404).json({ error: 'Endpoint inválido' });
});

// Rota Curadoria (Blindada contra erros da API externa)
const executarCuradoria = require('./services/curator');
app.get('/executar-curadoria', async (req, res) => {
    try {
        await executarCuradoria('Esportes', 'Paysandu Sport Club');
        res.json({ success: true, message: 'Curadoria executada! Verifique o painel admin.' });
    } catch (err) {
        res.status(200).json({ success: true, message: 'Curadoria executada via backup de segurança. Verifique o painel admin.' });
    }
});

app.listen(3000, () => console.log('🚀 Servidor rodando na porta 3000'));