const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const { marked } = require('marked');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'db.json');

// Middleware & Fungsi Database
app.use(express.json());
app.use(express.static(__dirname));

const readDB = () => {
    try {
        if (!fs.existsSync(DB_PATH)) {
            fs.writeFileSync(DB_PATH, JSON.stringify({ users: [], articles: [] }, null, 2));
        }
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading or creating db.json:", error);
        return { users: [], articles: [] };
    }
};
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));


// ===================================
// === API UNTUK PENGGUNA UMUM ===
// ===================================

app.post('/api/register', async (req, res) => {
    try {
        const { userType, name, email, password, ...otherData } = req.body;
        if (!userType || !name || !email || !password) return res.status(400).json({ message: 'Kolom dasar wajib diisi!' });
        const db = readDB();
        if (db.users.find(user => user.email === email)) return res.status(400).json({ message: 'Email sudah terdaftar!' });
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { userType, name, email, password: hashedPassword, points: 0, ...otherData };
        if (!db.users) db.users = [];
        db.users.push(newUser);
        writeDB(db);
        res.status(201).json({ message: 'Registrasi berhasil! Silakan login.' });
    } catch (error) { res.status(500).json({ message: 'Gagal mendaftar.' }); }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const db = readDB();
        const user = db.users.find(u => u.email === email);
        if (user && await bcrypt.compare(password, user.password)) {
            res.status(200).json({ message: 'Login berhasil!', email: user.email });
        } else {
            res.status(401).json({ message: 'Email atau password salah.' });
        }
    } catch (error) { res.status(500).json({ message: 'Gagal login.' }); }
});

app.get('/api/profile/:email', (req, res) => {
    const db = readDB();
    const user = db.users.find(u => u.email === req.params.email);
    if (user) { const { password, ...profileData } = user; res.status(200).json(profileData); } 
    else { res.status(404).json({ message: 'User tidak ditemukan.' }); }
});

app.post('/api/profile/update', (req, res) => {
    const { originalEmail, ...updatedData } = req.body;
    const db = readDB();
    const userIndex = db.users.findIndex(user => user.email === originalEmail);
    if (userIndex === -1) return res.status(404).json({ message: 'User tidak ditemukan.' });
    const oldData = db.users[userIndex];
    db.users[userIndex] = { ...oldData, ...updatedData };
    writeDB(db);
    res.status(200).json({ message: 'Profil berhasil diperbarui!', newEmail: updatedData.email });
});

// ===================================
// ===      API UNTUK ADMIN        ===
// ===================================
app.get('/api/users/bands', (req, res) => { const db = readDB(); res.json(db.users.filter(user => user.userType === 'band')); });
app.get('/api/users/venues', (req, res) => { const db = readDB(); res.json(db.users.filter(user => user.userType === 'venue')); });
app.post('/api/award-points', (req, res) => {
    const { venueEmail, bandEmails, points } = req.body;
    const db = readDB();
    const venue = db.users.find(u => u.email === venueEmail);
    if (venue) venue.points += parseInt(points);
    bandEmails.forEach(bandEmail => {
        const band = db.users.find(u => u.email === bandEmail);
        if (band) band.points += parseInt(points);
    });
    writeDB(db);
    res.status(200).json({ message: `${points} poin berhasil diberikan!` });
});

// ===================================
// ===      API UNTUK ARTIKEL      ===
// ===================================
app.post('/api/articles/create', (req, res) => {
    try {
        const { title, author, imageUrl, content } = req.body;
        if (!title || !author || !content) return res.status(400).json({ message: 'Judul, penulis, dan konten wajib diisi.' });
        const db = readDB();
        const newArticle = { id: Date.now(), date: new Date().toISOString(), title, author, imageUrl: imageUrl || null, content };
        if (!db.articles) db.articles = [];
        db.articles.unshift(newArticle);
        writeDB(db);
        res.status(201).json({ message: 'Artikel berhasil diterbitkan!' });
    } catch (error) { res.status(500).json({ message: 'Gagal menerbitkan artikel.' }); }
});

app.get('/api/articles', (req, res) => { const db = readDB(); res.json(db.articles || []); });

app.get('/api/articles/:id', (req, res) => {
    const db = readDB();
    const requestedId = req.params.id;
    const article = db.articles.find(a => String(a.id) === requestedId);
    if (article) {
        article.content = marked(article.content);
        const currentIndex = db.articles.findIndex(a => String(a.id) === requestedId);
        const prevArticle = currentIndex > 0 ? db.articles[currentIndex - 1] : null;
        const nextArticle = currentIndex < db.articles.length - 1 ? db.articles[currentIndex + 1] : null;
        const sidebarArticles = db.articles.filter(a => String(a.id) !== requestedId).slice(0, 5);
        res.json({ main: article, navigation: { prev: prevArticle, next: nextArticle }, sidebar: sidebarArticles });
    } else {
        res.status(404).json({ message: 'Artikel tidak ditemukan.' });
    }
});

// ===================================
// ===       API UNTUK EVENT       ===
// ===================================
app.post('/api/events/create', (req, res) => {
    try {
        const { title, date, type, imageUrl, description } = req.body;
        if (!title || !date || !type || !description) return res.status(400).json({ message: 'Semua kolom wajib diisi.' });
        const db = readDB();
        const newEvent = { id: Date.now(), title, date, type, imageUrl: imageUrl || null, description };
        if (!db.events) db.events = [];
        db.events.push(newEvent);
        writeDB(db);
        res.status(201).json({ message: 'Event berhasil disimpan!' });
    } catch (error) { res.status(500).json({ message: 'Gagal menyimpan event.' }); }
});

app.get('/api/events', (req, res) => {
    const db = readDB();
    res.json(db.events || []);
});
// Menjalankan server (WAJIB DI PALING BAWAH)
app.listen(PORT, () => {
    console.log(`Server Ruang 143 berjalan di http://localhost:${PORT}`);
});