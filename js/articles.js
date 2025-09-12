// ====================================================================
// === KODE FINAL DAN LENGKAP UNTUK FILE: js/articles.js           ===
// ====================================================================
document.addEventListener('DOMContentLoaded', () => {

    // --- LOGIKA HALAMAN BUAT ARTIKEL ---
    const articleForm = document.getElementById('article-form');
    if (articleForm) {
        articleForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            const response = await fetch('/api/articles/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            const feedbackEl = document.getElementById('feedback-message');
            feedbackEl.textContent = result.message;
            if (response.ok) {
                feedbackEl.className = 'feedback success';
                e.target.reset();
            } else {
                feedbackEl.className = 'feedback error';
            }
        });
    }

    // --- LOGIKA HALAMAN DAFTAR ARTIKEL ---
    const featuredContainer = document.getElementById('featured-article');
    const gridContainer = document.getElementById('article-grid');
    if (featuredContainer && gridContainer) {
        fetch('/api/articles')
            .then(res => res.json())
            .then(articles => {
                if (articles.length === 0) {
                    featuredContainer.innerHTML = '<h2>Belum ada artikel.</h2>';
                    gridContainer.innerHTML = '';
                    const articleListTitle = document.querySelector('.article-list-title');
                    if(articleListTitle) articleListTitle.style.display = 'none';
                    return;
                }

                const featured = articles[0];
                featuredContainer.innerHTML = `
                    <a href="single-article.html?id=${featured.id}" class="featured-article-link">
                        <img src="${featured.imageUrl || 'https://via.placeholder.com/800x400.png?text=Gambar+Utama'}" alt="${featured.title}">
                        <div class="featured-article-content">
                            <span class="article-date">${new Date(featured.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            <h1>${featured.title}</h1>
                            <p>${featured.content.substring(0, 150)}...</p>
                        </div>
                    </a>
                `;

                const otherArticles = articles.slice(1);
                const articleListTitle = document.querySelector('.article-list-title');
                if (otherArticles.length > 0) {
                    if (articleListTitle) articleListTitle.style.display = 'block';
                    gridContainer.innerHTML = otherArticles.map(article => `
                        <a href="single-article.html?id=${article.id}" class="article-card">
                            <img src="${article.imageUrl || 'https://via.placeholder.com/400x200.png?text=Gambar'}" alt="${article.title}">
                            <div class="article-card-content">
                                <h3>${article.title}</h3>
                                <span class="article-date">${new Date(article.date).toLocaleDateString('id-ID')}</span>
                            </div>
                        </a>
                    `).join('');
                } else {
                    gridContainer.innerHTML = '';
                    if (articleListTitle) articleListTitle.style.display = 'none';
                }
            });
    }

    // --- LOGIKA HALAMAN ARTIKEL TUNGGAL (VERSI DIPERKUAT) ---
    if (window.location.pathname.endsWith('single-article.html')) {
        const params = new URLSearchParams(window.location.search);
        const articleId = params.get('id');

        if (!articleId) {
            window.location.href = 'articles.html';
        } else {
            fetch(`/api/articles/${articleId}`)
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`Server responded with status: ${res.status}`);
                    }
                    return res.json();
                })
                .then(data => {
                    if (!data || !data.main) {
                        throw new Error('Invalid data structure received from server.');
                    }

                    const article = data.main;
                    document.title = article.title + " - Ruang 143";
                    document.getElementById('article-title').textContent = article.title;
                    
                    if (article.imageUrl) {
                        document.getElementById('article-image').innerHTML = `<img src="${article.imageUrl}" alt="${article.title}">`;
                    }

                    document.getElementById('article-meta').innerHTML = `
                        <span>Oleh: <strong>${article.author || 'N/A'}</strong></span> | 
                        <span>Diterbitkan: ${new Date(article.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    `;
                    
                    const content = article.content || '';
                    const formattedContent = '<p>' + content.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>') + '</p>';
                    document.getElementById('article-content').innerHTML = formattedContent;

                    const navContainer = document.getElementById('article-navigation');
                    if (navContainer && data.navigation) {
                        let navHtml = '';
                        if (data.navigation.prev) {
                            navHtml += `<a href="single-article.html?id=${data.navigation.prev.id}" class="nav-prev">← Artikel Sebelumnya</a>`;
                        }
                        if (data.navigation.next) {
                            navHtml += `<a href="single-article.html?id=${data.navigation.next.id}" class="nav-next">Artikel Selanjutnya →</a>`;
                        }
                        navContainer.innerHTML = navHtml;
                    }

                    const sidebarContainer = document.getElementById('sidebar-article-list');
                    if (sidebarContainer && data.sidebar && data.sidebar.length > 0) {
                        sidebarContainer.innerHTML = data.sidebar.map(item => `
                            <a href="single-article.html?id=${item.id}" class="sidebar-item">
                                <img src="${item.imageUrl || 'https://via.placeholder.com/150x100.png?text=Image'}" alt="${item.title}">
                                <h4>${item.title || 'Tanpa Judul'}</h4>
                            </a>
                        `).join('');
                    } else if (sidebarContainer) {
                        sidebarContainer.innerHTML = '<p>Tidak ada artikel lain.</p>';
                    }
                })
                .catch(error => {
                    console.error("Failed to render article:", error);
                    document.title = "Artikel Tidak Ditemukan - Ruang 143";
                    document.getElementById('article-title').textContent = "Error: 404";
                    document.getElementById('article-content').innerHTML = "<p>Artikel yang Anda cari tidak dapat ditemukan atau terjadi kesalahan saat memuat. Silakan kembali ke <a href='articles.html'>halaman arsip</a>.</p>";
                });
        }
    }
});