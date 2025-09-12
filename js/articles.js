// =======================================================
// === KODE FINAL UNTUK FILE: js/articles.js (DIPERBAIKI)
// =======================================================
document.addEventListener('DOMContentLoaded', () => {

    // --- LOGIKA HALAMAN BUAT ARTIKEL ---
    const articleForm = document.getElementById('article-form');
    if (articleForm) {
        articleForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            const response = await fetch('/api/articles/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            const result = await response.json();
            const feedbackEl = document.getElementById('feedback-message');
            feedbackEl.textContent = result.message;
            if (response.ok) { feedbackEl.className = 'feedback success'; e.target.reset(); } 
            else { feedbackEl.className = 'feedback error'; }
        });
    }

    // --- LOGIKA HALAMAN DAFTAR ARTIKEL (DENGAN SLIDER + GRID LENGKAP) ---
    const featuredWrapper = document.getElementById('featured-article-wrapper');
    const gridContainer = document.getElementById('article-grid');
    if (featuredWrapper && gridContainer) {
        fetch('/api/articles')
            .then(res => res.json())
            .then(articles => {
                const articleListTitle = document.querySelector('.article-list-title');
                if (articles.length === 0) {
                    const sliderElement = document.querySelector('.featured-article-slider');
                    if(sliderElement) sliderElement.innerHTML = '<h2>Belum ada artikel.</h2>';
                    gridContainer.innerHTML = '';
                    if(articleListTitle) articleListTitle.style.display = 'none';
                    return;
                }

                // Ambil 5 artikel teratas HANYA untuk slider
                const featuredArticles = articles.slice(0, 5);

                // --- Bangun Slide untuk Artikel Unggulan ---
                featuredWrapper.innerHTML = featuredArticles.map(featured => `
                    <div class="swiper-slide">
                        <a href="single-article.html?id=${featured.id}" class="featured-article-link">
                            <img src="${featured.imageUrl || 'https://via.placeholder.com/1200x600.png?text=Gambar+Utama'}" alt="${featured.title}">
                            <div class="featured-article-content">
                                <span class="article-date">${new Date(featured.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                <h1>${featured.title}</h1>
                            </div>
                        </a>
                    </div>
                `).join('');

                // Inisialisasi Slider
                new Swiper('.featured-article-slider', {
                    loop: true,
                    autoplay: { delay: 4000, disableOnInteraction: false },
                    pagination: { el: '.swiper-pagination', clickable: true },
                    navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
                });

                // --- Tampilkan SEMUA artikel di grid di bawah ---
                if (articleListTitle) articleListTitle.style.display = 'block';
                gridContainer.innerHTML = articles.map(article => `
                    <a href="single-article.html?id=${article.id}" class="article-card">
                        <img src="${article.imageUrl || 'https://via.placeholder.com/400x200.png?text=Gambar'}" alt="${article.title}">
                        <div class="article-card-content">
                            <h3>${article.title}</h3>
                            <span class="article-date">${new Date(article.date).toLocaleDateString('id-ID')}</span>
                        </div>
                    </a>
                `).join('');
            });
    }

    // --- LOGIKA HALAMAN ARTIKEL TUNGGAL ---
    if (window.location.pathname.endsWith('single-article.html')) {
        const params = new URLSearchParams(window.location.search);
        const articleId = params.get('id');
        if (!articleId) { window.location.href = 'articles.html'; } 
        else {
            fetch(`/api/articles/${articleId}`)
                .then(res => { if (!res.ok) throw new Error('Artikel tidak ditemukan'); return res.json(); })
                .then(data => {
                    const article = data.main;
                    document.title = article.title + " - Ruang 143";
                    document.getElementById('article-title').textContent = article.title;
                    if (article.imageUrl) { document.getElementById('article-image').innerHTML = `<img src="${article.imageUrl}" alt="${article.title}">`; }
                    document.getElementById('article-meta').innerHTML = `<span>Oleh: <strong>${article.author}</strong></span> | <span>Diterbitkan: ${new Date(article.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>`;
                    const formattedContent = '<p>' + article.content.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>') + '</p>';
                    document.getElementById('article-content').innerHTML = formattedContent;
                    const navContainer = document.getElementById('article-navigation');
                    let navHtml = '';
                    if (data.navigation.prev) { navHtml += `<a href="single-article.html?id=${data.navigation.prev.id}" class="nav-prev">← Artikel Sebelumnya</a>`; }
                    if (data.navigation.next) { navHtml += `<a href="single-article.html?id=${data.navigation.next.id}" class="nav-next">Artikel Selanjutnya →</a>`; }
                    navContainer.innerHTML = navHtml;
                    const sidebarContainer = document.getElementById('sidebar-article-list');
                    if (data.sidebar && data.sidebar.length > 0) {
                        sidebarContainer.innerHTML = data.sidebar.map(item => `<a href="single-article.html?id=${item.id}" class="sidebar-item"><img src="${item.imageUrl || 'https://via.placeholder.com/150x100.png?text=Image'}" alt="${item.title}"><h4>${item.title}</h4></a>`).join('');
                    } else if (sidebarContainer) { sidebarContainer.innerHTML = ''; }
                })
                .catch(error => {
                    document.title = "Artikel Tidak Ditemukan - Ruang 143";
                    document.getElementById('article-title').textContent = "Error: 404";
                    document.getElementById('article-content').innerHTML = "<p>Artikel yang Anda cari tidak dapat ditemukan. Silakan kembali ke <a href='articles.html'>halaman arsip</a>.</p>";
                });
        }
    }
});