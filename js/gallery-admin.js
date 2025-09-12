document.addEventListener('DOMContentLoaded', () => {
    const albumSelect = document.getElementById('albumSelect');
    const createAlbumForm = document.getElementById('create-album-form');
    const addPhotoForm = document.getElementById('add-photo-form');
    const albumFeedback = document.getElementById('album-feedback');
    const photoFeedback = document.getElementById('photo-feedback');

    // Fungsi untuk memuat daftar album ke dalam dropdown
    async function populateAlbums() {
        try {
            const response = await fetch('/api/albums');
            const albums = await response.json();
            albumSelect.innerHTML = '<option value="">-- Pilih Album --</option>';
            albums.forEach(album => {
                const option = document.createElement('option');
                option.value = album.id;
                option.textContent = album.title;
                albumSelect.appendChild(option);
            });
        } catch (error) {
            console.error("Gagal memuat album:", error);
        }
    }

    // Buat Album Baru
    if (createAlbumForm) {
        createAlbumForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            const response = await fetch('/api/albums/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            const result = await response.json();
            albumFeedback.textContent = result.message;
            if (response.ok) {
                albumFeedback.className = 'feedback success';
                e.target.reset();
                populateAlbums(); // Muat ulang daftar album
            } else {
                albumFeedback.className = 'feedback error';
            }
        });
    }

// GANTI BLOK INI DI js/gallery-admin.js
if (addPhotoForm) {
    addPhotoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        // Menampilkan pesan 'loading'
        photoFeedback.textContent = `Menambahkan foto...`;
        photoFeedback.className = 'feedback';

        const response = await fetch('/api/photos/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        photoFeedback.textContent = result.message;
        if (response.ok) {
            photoFeedback.className = 'feedback success';
            e.target.reset(); // Mengosongkan form
            populateAlbums(); // Memuat ulang daftar album jika ada album baru
        } else {
            photoFeedback.className = 'feedback error';
        }
    });
}
});