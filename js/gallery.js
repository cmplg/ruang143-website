document.addEventListener('DOMContentLoaded', () => {
    // --- LOGIKA HALAMAN DAFTAR ALBUM (gallery.html) ---
    const albumGrid = document.getElementById('album-grid');
    if (albumGrid) {
        fetch('/api/albums')
            .then(res => res.json())
            .then(albums => {
                if (Array.isArray(albums) && albums.length > 0) {
                    albumGrid.innerHTML = albums.map(album => {
                        const photoCount = Array.isArray(album.photos) ? album.photos.length : 0;
                        return `
                        <a href="album.html?id=${album.id}" class="album-card">
                            <img src="${album.coverImageUrl}" alt="${album.title}">
                            <div class="album-card-overlay">
                                <h3>${album.title}</h3>
                                <span>${photoCount} Foto</span>
                            </div>
                        </a>
                        `;
                    }).join('');
                } else {
                    albumGrid.innerHTML = '<p style="text-align: center;">Belum ada album di galeri.</p>';
                }
            });
    }

    // --- LOGIKA HALAMAN DETAIL ALBUM (album.html) ---
const galleryGridFullwidth = document.querySelector('.gallery-grid-fullwidth');
if (galleryGridFullwidth) {
    const params = new URLSearchParams(window.location.search);
    const albumId = params.get('id');

    if (!albumId) {
        window.location.href = 'gallery.html';
    } else {
        fetch(`/api/albums/${albumId}`)
            .then(res => res.json())
            .then(album => {
                // Update Hero Section
                document.title = album.title + " - Galeri Ruang 143";
                document.getElementById('album-title').textContent = album.title;
                document.getElementById('album-hero').style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${album.coverImageUrl}')`;
                document.getElementById('photo-count').textContent = `${album.photos.length} Foto`;

                // Isi Grid Foto
                if (album.photos && album.photos.length > 0) {
                    galleryGridFullwidth.innerHTML = album.photos.map(photo => `
                        <div class="gallery-item">
                            <img src="${photo.imageUrl}" alt="${photo.caption}" data-caption="${photo.caption}">
                            <div class="gallery-item-caption">
                                <span>${photo.caption}</span>
                            </div>
                        </div>
                    `).join('');
                } else {
                    galleryGridFullwidth.innerHTML = '<p style="text-align: center; color: white; padding: 50px;">Album ini belum memiliki foto.</p>';
                }
                setupImageModal();
            });
    }
}
    // --- FUNGSI MODAL (TETAP SAMA) ---
    function setupImageModal() {
        const modal = document.getElementById("image-modal");
        const modalImg = document.getElementById("modal-image");
        const modalCaption = document.getElementById("modal-caption");
        const closeBtn = document.querySelector(".close-button");
        
        document.querySelectorAll('.gallery-item img').forEach(img => {
            img.onclick = function(){
                modal.style.display = "block";
                modalImg.src = this.src;
                modalCaption.textContent = this.dataset.caption;
            }
        });
        
        if(closeBtn) { closeBtn.onclick = function() { modal.style.display = "none"; } }
        window.onclick = function(event) { if (event.target == modal) { modal.style.display = "none"; } }
    }

    // --- SLIDESHOW HERO SECTION ---
    const heroSection = document.querySelector('.hero-gallery');
    if (heroSection) {
        fetch('/api/albums')
            .then(res => res.json())
            .then(albums => {
                const images = albums.map(album => album.coverImageUrl);
                if (images.length > 0) {
                    if (images.length === 1) {
                        heroSection.style.backgroundImage = `url('${images[0]}')`;
                    } else {
                        let currentIndex = 0;
                        heroSection.style.backgroundImage = `url('${images[0]}')`;
                        setInterval(() => {
                            currentIndex = (currentIndex + 1) % images.length;
                            heroSection.style.backgroundImage = `url('${images[currentIndex]}')`;
                        }, 5000);
                    }
                }
            });
    }
});