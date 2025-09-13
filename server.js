// =======================================================
// ===    KODE SERVER FINAL & LENGKAP - RUANG 143      ===
// =======================================================
const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const { marked } = require('marked');
const io = new Server(server);

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'db.json');

// Middleware & Fungsi Bantuan Database
app.use(express.json());
app.use(express.static(__dirname));

const readDB = () => {
    try {
        if (!fs.existsSync(DB_PATH)) {
            const defaultData = { users: [], articles: [], events: [], albums: [] };
            fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2));
            return defaultData;
        }
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Gagal membaca atau membuat db.json:", error);
        return { users: [], articles: [], events: [], albums: [] };
    }
};
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// ===================================
// === API UNTUK PENGGUNA (AUTH)   ===
// ===================================

app.post('/api/register', async (req, res) => {
    try {
        const { userType, name, email, password, ...otherData } = req.body;
        if (!userType || !name || !email || !password) return res.status(400).json({ message: 'Kolom dasar wajib diisi!' });
        const db = readDB();
        if (db.users.find(user => user.email === email)) return res.status(400).json({ message: 'Email sudah terdaftar!' });
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { id: Date.now(), userType, name, email, password: hashedPassword, points: 0, ...otherData };
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
// === API UNTUK ADMIN DASHBOARD   ===
// ===================================

// --- API KELOLA POIN ---
app.get('/api/users/bands', (req, res) => { const db = readDB(); res.json(db.users.filter(user => user.userType === 'band')); });
app.get('/api/users/venues', (req, res) => { const db = readDB(); res.json(db.users.filter(user => user.userType === 'venue')); });
app.post('/api/award-points', (req, res) => {
    const { venueEmail, bandEmails, points } = req.body;
    const db = readDB();
    const venue = db.users.find(u => u.email === venueEmail);
    if (venue) venue.points += parseInt(points);
    bandEmails.forEach(bandEmail => {
        const band = db.users.find(u => u.email === bandEmail);
        if (band) band.points += parseInt(band);
    });
    writeDB(db);
    res.status(200).json({ message: `${points} poin berhasil diberikan!` });
});

// --- API CRUD ARTIKEL ---
app.post('/api/articles/create', (req, res) => {
    const db = readDB();
    const newArticle = { id: Date.now(), ...req.body, date: new Date().toISOString() };
    if (!db.articles) db.articles = [];
    db.articles.unshift(newArticle);
    writeDB(db);
    res.status(201).json({ message: 'Artikel berhasil dibuat!' });
});
app.get('/api/articles', (req, res) => { const db = readDB(); res.json(db.articles || []); });
app.get('/api/articles/:id', (req, res) => {
    const db = readDB();
    const article = db.articles.find(a => a.id == req.params.id);
    if (article) {
        const currentIndex = db.articles.findIndex(a => a.id == req.params.id);
        const prevArticle = currentIndex > 0 ? db.articles[currentIndex - 1] : null;
        const nextArticle = currentIndex < db.articles.length - 1 ? db.articles[currentIndex + 1] : null;
        const sidebarArticles = db.articles.filter(a => a.id != req.params.id).slice(0, 5);
        const processedArticle = { ...article, content: marked(article.content) };
        res.json({ main: processedArticle, navigation: { prev: prevArticle, next: nextArticle }, sidebar: sidebarArticles });
    } else { res.status(404).json({ message: 'Artikel tidak ditemukan' }); }
});
app.post('/api/articles/update/:id', (req, res) => {
    const db = readDB();
    const index = db.articles.findIndex(a => a.id == req.params.id);
    if (index === -1) return res.status(404).json({ message: "Artikel tidak ditemukan" });
    db.articles[index] = { ...db.articles[index], ...req.body };
    writeDB(db);
    res.json({ message: "Artikel berhasil diperbarui!" });
});
app.delete('/api/articles/delete/:id', (req, res) => {
    let db = readDB();
    db.articles = db.articles.filter(a => a.id != req.params.id);
    writeDB(db);
    res.json({ message: "Artikel berhasil dihapus!" });
});

// --- API CRUD EVENT ---
app.post('/api/events/create', (req, res) => {
    const db = readDB();
    const newEvent = { id: Date.now(), ...req.body };
    if (!db.events) db.events = [];
    db.events.push(newEvent);
    writeDB(db);
    res.status(201).json({ message: 'Event berhasil disimpan!' });
});
app.get('/api/events', (req, res) => { const db = readDB(); res.json(db.events || []); });
app.get('/api/events/:id', (req, res) => {
    const db = readDB();
    const event = db.events.find(e => e.id == req.params.id);
    if (event) { res.json(event); } 
    else { res.status(404).json({ message: "Event tidak ditemukan" }); }
});
app.post('/api/events/update/:id', (req, res) => {
    const db = readDB();
    const index = db.events.findIndex(e => e.id == req.params.id);
    if (index === -1) return res.status(404).json({ message: "Event tidak ditemukan" });
    db.events[index] = { ...db.events[index], ...req.body };
    writeDB(db);
    res.json({ message: "Event berhasil diperbarui!" });
});
app.delete('/api/events/delete/:id', (req, res) => {
    let db = readDB();
    db.events = db.events.filter(e => e.id != req.params.id);
    writeDB(db);
    res.json({ message: "Event berhasil dihapus!" });
});

// --- API CRUD GALERI ---
app.post('/api/albums/create', (req, res) => {
    const db = readDB();
    const newAlbum = { id: Date.now(), ...req.body, photos: [] };
    if (!db.albums) db.albums = [];
    db.albums.unshift(newAlbum);
    writeDB(db);
    res.status(201).json({ message: 'Album berhasil dibuat!' });
});
app.post('/api/photos/add', (req, res) => {
    const { albumId, imageUrls, captionPrefix } = req.body;
    const db = readDB();
    const albumIndex = db.albums.findIndex(a => a.id == albumId);
    if (albumIndex === -1) return res.status(404).json({ message: 'Album tidak ditemukan.' });
    const urls = imageUrls.split('\n').filter(url => url.trim() !== '');
    const newPhotos = urls.map((url, i) => ({ id: Date.now() + i, imageUrl: url.trim(), caption: captionPrefix ? `${captionPrefix.trim()} #${i + 1}` : `Foto #${db.albums[albumIndex].photos.length + i + 1}` }));
    db.albums[albumIndex].photos.unshift(...newPhotos);
    writeDB(db);
    res.status(201).json({ message: `${urls.length} foto berhasil ditambahkan!` });
});
app.get('/api/albums', (req, res) => { const db = readDB(); res.json(db.albums || []); });
app.get('/api/albums/:id', (req, res) => {
    const db = readDB();
    const album = db.albums.find(a => a.id == req.params.id);
    if (album) { res.json(album); } 
    else { res.status(404).json({ message: 'Album tidak ditemukan' }); }
});
app.delete('/api/albums/delete/:id', (req, res) => {
    let db = readDB();
    db.albums = db.albums.filter(a => a.id != req.params.id);
    writeDB(db);
    res.json({ message: "Album berhasil dihapus!" });
});

// ===================================
// ===     KONFIGURASI ADMIN       ===
// ===================================
const ADMIN_USERNAME = "admin143";
const ADMIN_PASSWORD = "Ruang143_"; // GANTI DENGAN PASSWORD YANG KUAT

// ... (semua API Pengguna, Artikel, Event, Galeri, dll. tetap sama) ...


// ===================================
// ===     API LOGIN ADMIN BARU    ===
// ===================================
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Login berhasil, berikan "tiket" sederhana
        res.status(200).json({ success: true, message: 'Login berhasil!' });
    } else {
        res.status(401).json({ success: false, message: 'Username atau password salah.' });
    }
});

// API untuk membuat postingan baru
app.post('/api/posts/create', (req, res) => {
    const { content, userEmail } = req.body; // userEmail didapat dari localStorage di client
    const db = readDB();
    const author = db.users.find(u => u.email === userEmail);
    if (!author) return res.status(404).json({ message: "Pengguna tidak ditemukan" });

    const newPost = {
        id: Date.now(),
        authorId: author.id,
        authorName: author.name,
        // authorAvatar: author.avatarUrl, // Jika nanti ada fitur upload foto profil
        content: content,
        timestamp: new Date().toISOString(),
        likes: [],
        comments: []
    };
    db.posts.unshift(newPost);
    writeDB(db);
    res.status(201).json(newPost);
});

// API untuk mengambil semua postingan
app.get('/api/posts', (req, res) => {
    const db = readDB();
    res.json(db.posts || []);
});

io.emit('new_post_notification', { authorName: newPost.authorName });

io.on('connection', (socket) => {
    console.log('Pengunjung baru terhubung!');
});


// Menjalankan server (WAJIB DI PALING BAWAH)
app.listen(PORT, () => {
    console.log(`Server Ruang 143 berjalan di http://localhost:${PORT}`);
});