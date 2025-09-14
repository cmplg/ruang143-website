// =======================================================
// ===    KODE SERVER FINAL & LENGKAP - RUANG 143      ===
// =======================================================
const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const { marked } = require('marked');

const app = express();

const PORT = 3000;
const DB_PATH = path.join(__dirname, 'db.json');

// Logging middleware for debugging API requests
app.use((req, res, next) => {
    if (req.url.startsWith('/api/')) {
        console.log(`[API] ${req.method} ${req.url}`);
    }
    next();
});

// Middleware & Fungsi Bantuan Database
app.use(express.json());
// Middleware untuk parsing JSON
// static file serving akan dipasang DI BAWAH agar tidak menginterupsi rute /api

// In-memory DB cache with debounced async writes to disk
let _inMemoryDB = null;
let _pendingSaveTimer = null;
let _pendingSaveData = null;
const DEFAULT_DB = { users: [], articles: [], events: [], albums: [], posts: [] };

// Load DB at startup (sync once)
function loadDBFromDisk() {
    try {
        if (!fs.existsSync(DB_PATH)) {
            fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2));
            _inMemoryDB = JSON.parse(JSON.stringify(DEFAULT_DB));
            return;
        }
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        _inMemoryDB = JSON.parse(data);
        // ensure keys exist
        _inMemoryDB.users = _inMemoryDB.users || [];
        _inMemoryDB.articles = _inMemoryDB.articles || [];
        _inMemoryDB.events = _inMemoryDB.events || [];
        _inMemoryDB.albums = _inMemoryDB.albums || [];
        _inMemoryDB.posts = _inMemoryDB.posts || [];
    } catch (error) {
        console.error('Gagal membaca atau membuat db.json:', error);
        _inMemoryDB = JSON.parse(JSON.stringify(DEFAULT_DB));
    }
}

// Return in-memory DB (shallow copy to avoid accidental external mutation)
const readDB = () => {
    if (!_inMemoryDB) loadDBFromDisk();
    return _inMemoryDB;
};

// Debounced async write: update in-memory state and schedule disk write
const writeDB = (data) => {
    // update the in-memory reference
    _inMemoryDB = data;
    _pendingSaveData = data;
    if (_pendingSaveTimer) clearTimeout(_pendingSaveTimer);
    _pendingSaveTimer = setTimeout(() => {
        const toSave = _pendingSaveData || _inMemoryDB || DEFAULT_DB;
        fs.writeFile(DB_PATH, JSON.stringify(toSave, null, 2), (err) => {
            if (err) console.error('Gagal menyimpan db.json:', err);
        });
        _pendingSaveTimer = null;
        _pendingSaveData = null;
    }, 300); // 300ms debounce
};

// Flush any pending writes synchronously on exit
function flushDBSync() {
    if (_pendingSaveTimer) {
        clearTimeout(_pendingSaveTimer);
        _pendingSaveTimer = null;
    }
    try {
        const finalData = _pendingSaveData || _inMemoryDB || DEFAULT_DB;
        fs.writeFileSync(DB_PATH, JSON.stringify(finalData, null, 2));
    } catch (err) {
        console.error('Gagal flush db.json saat exit:', err);
    }
}

process.on('exit', () => flushDBSync());
process.on('SIGINT', () => { flushDBSync(); process.exit(); });
process.on('SIGTERM', () => { flushDBSync(); process.exit(); });

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
        if (!user) return res.status(401).json({ message: 'Email atau password salah.' });

        // If stored password is a bcrypt hash, compare normally
        try {
            if (await bcrypt.compare(password, user.password)) {
                return res.status(200).json({ message: 'Login berhasil!', email: user.email });
            }
        } catch (err) {
            // bcrypt.compare may throw if stored password isn't a hash - fall through
        }

        // Support legacy plaintext passwords stored in db.json: if they match, rehash and save
        if (user.password === password) {
            try {
                const newHash = await bcrypt.hash(password, 10);
                const userIndex = db.users.findIndex(u => u.email === email);
                if (userIndex !== -1) {
                    db.users[userIndex].password = newHash;
                    writeDB(db);
                }
                return res.status(200).json({ message: 'Login berhasil!', email: user.email });
            } catch (err) {
                // If rehash fails, still allow login but log
                console.error('Gagal rehash password:', err);
                return res.status(200).json({ message: 'Login berhasil!', email: user.email });
            }
        }

        return res.status(401).json({ message: 'Email atau password salah.' });
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
    // Accept { venueEmail, emails: [..], points }
    const { venueEmail, emails, points } = req.body;
    const db = readDB();
    const pts = parseInt(points) || 0;
    if (venueEmail) {
        const venue = db.users.find(u => u.email === venueEmail);
        if (venue) venue.points = (parseInt(venue.points) || 0) + pts;
    }
    if (Array.isArray(emails)) {
        emails.forEach(email => {
            const user = db.users.find(u => u.email === email);
            if (user) user.points = (parseInt(user.points) || 0) + pts;
        });
    }
    writeDB(db);
    res.status(200).json({ message: `${pts} poin berhasil diberikan!` });
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
    const { albumId, imageUrls, captionPrefix, photos } = req.body;
    const db = readDB();
    const albumIndex = db.albums.findIndex(a => a.id == albumId);
    if (albumIndex === -1) return res.status(404).json({ message: 'Album tidak ditemukan.' });

    let newPhotos = [];
    if (Array.isArray(photos)) {
        // photos: [{ imageUrl, caption }, ...]
        newPhotos = photos.map((p, i) => ({ id: Date.now() + i, imageUrl: (p.imageUrl||'').trim(), caption: (p.caption||'').trim() }));
    } else if (typeof imageUrls === 'string') {
        const urls = imageUrls.split('\n').filter(url => url.trim() !== '');
        newPhotos = urls.map((url, i) => ({ id: Date.now() + i, imageUrl: url.trim(), caption: captionPrefix ? `${captionPrefix.trim()} #${i + 1}` : `Foto #${(db.albums[albumIndex].photos||[]).length + i + 1}` }));
    } else {
        return res.status(400).json({ message: 'imageUrls atau photos diperlukan' });
    }

    db.albums[albumIndex].photos = db.albums[albumIndex].photos || [];
    db.albums[albumIndex].photos.unshift(...newPhotos);
    writeDB(db);
    res.status(201).json({ message: `${newPhotos.length} foto berhasil ditambahkan!`, added: newPhotos.length });
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

// Simple admin auth middleware: expect header 'x-admin-auth' === ADMIN_PASSWORD
function requireAdmin(req, res, next) {
    const token = req.headers['x-admin-auth'];
    if (!token || token !== ADMIN_PASSWORD) return res.status(401).json({ message: 'Unauthorized - admin header missing or invalid' });
    next();
}

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
    if (!db.posts) db.posts = [];
    db.posts.unshift(newPost);
    writeDB(db);
    res.status(201).json(newPost);
});

// Temporary debug endpoint to check admin auth quickly
app.get('/api/test-admin', (req, res) => {
    const token = req.headers['x-admin-auth'];
    const ok = token && token === ADMIN_PASSWORD;
    res.json({ ok, received: !!token, message: ok ? 'Admin auth OK' : 'Admin auth invalid', adminPreview: ADMIN_PASSWORD ? (ADMIN_PASSWORD[0] + '*'.repeat(Math.max(0, ADMIN_PASSWORD.length-2)) + ADMIN_PASSWORD.slice(-1)) : null });
});

// Toggle like on a post
app.post('/api/posts/:id/like', (req, res) => {
    const { userEmail } = req.body;
    if (!userEmail) return res.status(400).json({ message: 'userEmail required' });
    const db = readDB();
    if (!db.posts) db.posts = [];
    const idx = db.posts.findIndex(p => p.id == req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Post not found' });
    const post = db.posts[idx];
    if (!post.likes) post.likes = [];
    const li = post.likes.indexOf(userEmail);
    if (li === -1) post.likes.push(userEmail); else post.likes.splice(li,1);
    db.posts[idx] = post;
    writeDB(db);
    res.json(post);
});

// Add comment to post
app.post('/api/posts/:id/comment', (req, res) => {
    const { userEmail, comment } = req.body;
    if (!userEmail || !comment) return res.status(400).json({ message: 'userEmail and comment required' });
    const db = readDB();
    if (!db.posts) db.posts = [];
    const idx = db.posts.findIndex(p => p.id == req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Post not found' });
    const author = db.users.find(u => u.email === userEmail);
    const newComment = { id: Date.now(), userEmail, authorName: author ? author.name : userEmail, text: comment, timestamp: new Date().toISOString() };
    if (!db.posts[idx].comments) db.posts[idx].comments = [];
    db.posts[idx].comments.push(newComment);
    writeDB(db);
    res.status(201).json(newComment);
});

// Admin: delete a post
app.delete('/api/admin/posts/delete/:id', requireAdmin, (req, res) => {
    let db = readDB();
    db.posts = (db.posts || []).filter(p => p.id != req.params.id);
    writeDB(db);
    res.json({ message: 'Post deleted' });
});

// Admin CRUD endpoints for users
app.get('/api/admin/users', requireAdmin, (req, res) => { const db = readDB(); res.json(db.users || []); });
app.post('/api/admin/users/create', requireAdmin, (req, res) => {
    const db = readDB();
    const user = req.body; if (!db.users) db.users = [];
    user.id = Date.now(); db.users.push(user); writeDB(db); res.status(201).json(user);
});
app.post('/api/admin/users/update/:email', requireAdmin, (req, res) => {
    const db = readDB(); const idx = (db.users||[]).findIndex(u=>u.email==req.params.email);
    if (idx===-1) return res.status(404).json({message:'User not found'});
    db.users[idx] = {...db.users[idx], ...req.body}; writeDB(db); res.json(db.users[idx]);
});
app.delete('/api/admin/users/delete/:email', requireAdmin, (req,res)=>{ let db=readDB(); db.users = (db.users||[]).filter(u=>u.email!=req.params.email); writeDB(db); res.json({message:'User deleted'}); });

// Admin CRUD endpoints for articles/events/albums
app.get('/api/admin/articles', requireAdmin, (req,res)=>{ const db=readDB(); res.json(db.articles||[]); });
app.post('/api/admin/articles/create', requireAdmin, (req,res)=>{ const db=readDB(); const a={id:Date.now(),...req.body,date:new Date().toISOString()}; db.articles = db.articles||[]; db.articles.unshift(a); writeDB(db); res.status(201).json(a); });
app.post('/api/admin/articles/update/:id', requireAdmin, (req,res)=>{ const db=readDB(); const i=db.articles.findIndex(a=>a.id==req.params.id); if(i===-1) return res.status(404).json({message:'Article not found'}); db.articles[i]={...db.articles[i],...req.body}; writeDB(db); res.json(db.articles[i]); });
app.delete('/api/admin/articles/delete/:id', requireAdmin, (req,res)=>{ let db=readDB(); db.articles=(db.articles||[]).filter(a=>a.id!=req.params.id); writeDB(db); res.json({message:'Article deleted'}); });

app.get('/api/admin/events', requireAdmin, (req,res)=>{ const db=readDB(); res.json(db.events||[]); });
app.post('/api/admin/events/create', requireAdmin, (req,res)=>{ const db=readDB(); const e={id:Date.now(),...req.body}; db.events = db.events||[]; db.events.unshift(e); writeDB(db); res.status(201).json(e); });
app.post('/api/admin/events/update/:id', requireAdmin, (req,res)=>{ const db=readDB(); const i=db.events.findIndex(e=>e.id==req.params.id); if(i===-1) return res.status(404).json({message:'Event not found'}); db.events[i]={...db.events[i],...req.body}; writeDB(db); res.json(db.events[i]); });
app.delete('/api/admin/events/delete/:id', requireAdmin, (req,res)=>{ let db=readDB(); db.events=(db.events||[]).filter(e=>e.id!=req.params.id); writeDB(db); res.json({message:'Event deleted'}); });

app.get('/api/admin/albums', requireAdmin, (req,res)=>{ const db=readDB(); res.json(db.albums||[]); });
app.post('/api/admin/albums/create', requireAdmin, (req,res)=>{ const db=readDB(); const a={id:Date.now(),...req.body,photos:[]}; db.albums=db.albums||[]; db.albums.unshift(a); writeDB(db); res.status(201).json(a); });
app.post('/api/admin/albums/update/:id', requireAdmin, (req,res)=>{ const db=readDB(); const i=db.albums.findIndex(a=>a.id==req.params.id); if(i===-1) return res.status(404).json({message:'Album not found'}); db.albums[i]={...db.albums[i],...req.body}; writeDB(db); res.json(db.albums[i]); });
app.delete('/api/admin/albums/delete/:id', requireAdmin, (req,res)=>{ let db=readDB(); db.albums=(db.albums||[]).filter(a=>a.id!=req.params.id); writeDB(db); res.json({message:'Album deleted'}); });

// Admin: list posts
app.get('/api/admin/posts', requireAdmin, (req,res)=>{ const db=readDB(); res.json(db.posts||[]); });

// Temporary debug endpoint to inspect admin middleware behavior
app.get('/api/test-admin', (req, res) => {
    const token = req.headers['x-admin-auth'] || null;
    res.json({ ok: true, tokenProvided: !!token, tokenValue: token ? token : null, adminPassword: ADMIN_PASSWORD });
});

// API untuk mengambil semua postingan
app.get('/api/posts', (req, res) => {
    const db = readDB();
    res.json(db.posts || []);
});

// Endpoint debug sementara: tampilkan apa yang server baca dari db.json
app.get('/api/_debug_db', (req, res) => {
    try {
        const db = readDB();
        res.json({ ok: true, usersCount: (db.users || []).length, articlesCount: (db.articles || []).length, albumsCount: (db.albums || []).length, sampleUsers: db.users ? db.users.map(u => ({ email: u.email, name: u.name })) : [] });
    } catch (err) {
        res.status(500).json({ ok: false, error: String(err) });
    }
});


// Menjalankan server (WAJIB DI PALING BAWAH)
// Serve static files (after all API routes)
app.use(express.static(__dirname));

app.listen(PORT, () => {
    console.log(`Server Ruang 143 berjalan di http://localhost:${PORT}`);
});
