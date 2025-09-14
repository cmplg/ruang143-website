// =======================================================
// === KODE FINAL & LENGKAP UNTUK js/admin.js (DASHBOARD)
// =======================================================
document.addEventListener('DOMContentLoaded', () => {
      // =============================================
    // === "PENJAGA PINTU" / PEMERIKSAAN KEAMANAN ===
    // =============================================
    if (!sessionStorage.getItem('adminAuthenticated')) {
        // Jika tidak ada "tiket", tendang ke halaman login
        window.location.href = 'admin-login.html';
        return; // Hentikan eksekusi sisa kode di file ini
    }

    // --- SETUP DASAR & UNIVERSAL ---
    const modal = document.getElementById('form-modal');
    const modalContent = document.getElementById('modal-form-content');
    const closeModalBtn = modal.querySelector('.close-button');

    const openModal = (html) => { modalContent.innerHTML = html; modal.style.display = 'block'; };
    const closeModal = () => { modal.style.display = 'none'; modalContent.innerHTML = ''; };
    closeModalBtn.onclick = closeModal;
    window.onclick = (event) => { if (event.target == modal) closeModal(); };

    // --- NAVIGASI TAB ---
    document.querySelectorAll('.dashboard-nav-item').forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            document.querySelector('.dashboard-nav-item.active').classList.remove('active');
            document.querySelector('.dashboard-panel.active').classList.remove('active');
            item.classList.add('active');
            document.getElementById(item.dataset.target).classList.add('active');
        });
    });

    // --- TEMPLATE FORM HTML ---
    const articleFormHTML = (article = {}) => `<h2>${article.id ? 'Edit' : 'Tulis'} Artikel</h2><form id="form-article" data-id="${article.id || ''}"><div class="form-group"><label>Judul</label><input type="text" name="title" value="${article.title || ''}" required></div><div class="form-group"><label>Penulis</label><input type="text" name="author" value="${article.author || 'Ruang 143'}" required></div><div class="form-group"><label>URL Gambar</label><input type="text" name="imageUrl" value="${article.imageUrl || ''}"></div><div class="form-group"><label>Konten (Markdown)</label><textarea name="content" rows="15" required>${article.content || ''}</textarea></div><button type="submit" class="btn">${article.id ? 'Simpan' : 'Terbitkan'}</button></form>`;
    const eventFormHTML = (event = {}) => `<h2>${event.id ? 'Edit' : 'Tambah'} Event</h2><form id="form-event" data-id="${event.id || ''}"><div class="form-group"><label>Nama Event</label><input type="text" name="title" value="${event.title || ''}" required></div><div class="form-group"><label>Tanggal</label><input type="date" name="date" value="${event.date ? new Date(event.date).toISOString().split('T')[0] : ''}" required></div><div class="form-group"><label>Tipe</label><select name="type" required><option value="past" ${event.type === 'past' ? 'selected' : ''}>Acara Lampau</option><option value="future" ${event.type === 'future' ? 'selected' : ''}>Rencana Depan</option></select></div><div class="form-group"><label>URL Flyer</label><input type="text" name="imageUrl" value="${event.imageUrl || ''}"></div><div class="form-group"><label>Deskripsi</label><textarea name="description" rows="5" required>${event.description || ''}</textarea></div><button type="submit" class="btn">${event.id ? 'Simpan' : 'Tambah'}</button></form>`;
    const albumFormHTML = (album = {}) => `<h2>${album.id ? 'Edit' : 'Buat'} Album</h2><form id="form-album" data-id="${album.id || ''}"><div class="form-group"><label>Judul Album</label><input type="text" name="title" value="${album.title || ''}" required></div><div class="form-group"><label>URL Gambar Sampul</label><input type="text" name="coverImageUrl" value="${album.coverImageUrl || ''}" required></div><button type="submit" class="btn">${album.id ? 'Simpan' : 'Buat'}</button></form>`;
    const addPhotosFormHTML = (albums) => `<h2>Tambah Foto ke Album</h2><form id="form-add-photos"><div class="form-group"><label>Pilih Album</label><select name="albumId" required>${albums.map(a => `<option value="${a.id}">${a.title}</option>`).join('')}</select></div><div class="form-group"><label>URL Gambar (Satu per baris)</label><textarea name="imageUrls" rows="8" required></textarea></div><div class="form-group"><label>Keterangan Umum</label><input type="text" name="captionPrefix"></div><button type="submit" class="btn">Tambah Foto</button></form>`;

    // --- FUNGSI LOAD DATA ---
    async function loadData(type, containerElement) {
        try {
            const res = await fetch(`/api/${type}s`);
            const items = await res.json();
            containerElement.innerHTML = items.map(item => `<div class="item-card"><h4>${item.title}</h4><div class="item-actions"><button class="btn btn-small btn-edit" data-id="${item.id}" data-type="${type}">Edit</button><button class="btn btn-small btn-delete" data-id="${item.id}" data-type="${type}">Hapus</button></div></div>`).join('');
        } catch (error) { containerElement.innerHTML = `<p>Gagal memuat data.</p>`; }
    }
    
    // --- KELOLA POIN ---
    const venueSelect = document.getElementById('venueSelect');
    const bandCheckboxContainer = document.getElementById('band-checkbox-container');
    const pointsForm = document.getElementById('points-form');
    async function populatePoinForm() {
        const [venuesRes, bandsRes] = await Promise.all([fetch('/api/users/venues'), fetch('/api/users/bands')]);
        const venues = await venuesRes.json();
        const bands = await bandsRes.json();
        venueSelect.innerHTML = '<option value="">-- Pilih Venue --</option>' + venues.map(v => `<option value="${v.email}">${v.name}</option>`).join('');
        bandCheckboxContainer.innerHTML = bands.map(b => `<div class="checkbox-item"><input type="checkbox" id="band-${b.id}" name="bandEmails" value="${b.email}"><label for="band-${b.id}">${b.name}</label></div>`).join('');
    }
    pointsForm.addEventListener('submit', async e => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = { points: parseInt(formData.get('points')), venueEmail: formData.get('venueEmail'), bandEmails: formData.getAll('bandEmails') };
        const res = await fetch('/api/award-points', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        const result = await res.json();
        const feedback = document.getElementById('points-feedback');
        feedback.textContent = result.message;
        feedback.className = res.ok ? 'feedback success' : 'feedback error';
        if (res.ok) e.target.reset();
    });

    // --- EVENT LISTENER UNIVERSAL ---
    document.body.addEventListener('click', async (e) => {
        const { action, id, type } = e.target.dataset;
        // Buka Modal Tambah
        if (action === 'add-article') openModal(articleFormHTML());
        if (action === 'add-event') openModal(eventFormHTML());
        if (action === 'add-album') openModal(albumFormHTML());
        if (action === 'add-photos') { const res = await fetch('/api/albums'); const albums = await res.json(); openModal(addPhotosFormHTML(albums)); }

        // Hapus Item
        if (e.target.classList.contains('btn-delete')) {
            if (confirm('Yakin ingin menghapus item ini?')) {
                await fetch(`/api/${type}s/delete/${id}`, { method: 'DELETE' });
                loadData(type, document.getElementById(`${type}-list`));
            }
        }
        
        // Buka Modal Edit
        if (e.target.classList.contains('btn-edit')) {
            const res = await fetch(`/api/${type}s/${id}`);
            const item = await res.json();
            if (type === 'article') openModal(articleFormHTML(item.main));
            if (type === 'event') openModal(eventFormHTML(item));
            if (type === 'album') openModal(albumFormHTML(item));
        }
    });

    document.body.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const id = form.dataset.id;
        const data = Object.fromEntries(new FormData(form).entries());
        let type = '';
        if (form.id.includes('article')) type = 'article';
        if (form.id.includes('event')) type = 'event';
        if (form.id.includes('album')) type = 'album';

        if (form.id === 'form-add-photos') {
            await fetch('/api/photos/add', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            closeModal();
            return;
        }

        if (type) {
            const url = id ? `/api/${type}s/update/${id}` : `/api/${type}s/create`;
            await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            closeModal();
            loadData(type, document.getElementById(`${type}-list`));
        }
    });

    // Add event listener for editing articles
    document.querySelectorAll('.edit-article').forEach(button => {
        button.addEventListener('click', function() {
            const articleId = this.getAttribute('data-id');
            // Redirect to article editing page with article id, pre-fill can be handled in that page
            window.location.href = `create-article.html?edit=${articleId}`;
        });
    });

    // Add event listener for editing events
    document.querySelectorAll('.edit-event').forEach(button => {
        button.addEventListener('click', function() {
            const eventId = this.getAttribute('data-id');
            // Redirect to event editing page with event id, pre-fill can be handled in that page
            window.location.href = `create-event.html?edit=${eventId}`;
        });
    });

    // Inisialisasi: Muat semua data saat halaman dibuka
    populatePoinForm();
    loadData('article', document.getElementById('article-list'));
    loadData('event', document.getElementById('event-list'));
    loadData('album', document.getElementById('album-list'));
});