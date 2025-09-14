// Kerangka awal untuk js/feed.js
document.addEventListener('DOMContentLoaded', () => {
    // 1. Periksa apakah user sudah login. Jika tidak, tendang ke login.html
    const loggedInUserEmail = localStorage.getItem('loggedInUser');
    if (!loggedInUserEmail) {
        window.location.href = 'login.html';
        return;
    }

    // 2. Muat data profil user di sidebar kiri
    async function loadUserProfile() {
        const profileInfo = document.getElementById('profile-info');
        const pointsEl = document.getElementById('profile-points');
        if (!profileInfo) return;
        profileInfo.textContent = 'Memuat data profil...';
        try {
            const res = await fetch(`/api/profile/${loggedInUserEmail}`);
            if (!res.ok) throw new Error('Gagal memuat profil');
            const user = await res.json();
            let html = `<strong>${user.name}</strong><br>
                <span>${user.email}</span><br>
                <span>(${user.userType === 'band' ? 'Band/Musisi' : user.userType === 'venue' ? 'Venue' : 'Member'})</span>`;
            if (user.genre) html += `<br><span>Genre: ${user.genre}</span>`;
            if (user.memberCount) html += `<br><span>Personel: ${user.memberCount}</span>`;
            if (user.address) html += `<br><span>Alamat: ${user.address}</span>`;
            if (user.capacity) html += `<br><span>Kapasitas: ${user.capacity}</span>`;
            profileInfo.innerHTML = html;
            pointsEl.textContent = user.points || 0;
        } catch (err) {
            profileInfo.textContent = 'Gagal memuat data profil.';
        }
    }

    // 3. Muat semua postingan
    async function loadPosts() {
        const postFeed = document.getElementById('post-feed-container');
        postFeed.innerHTML = '<p>Memuat postingan...</p>';
        try {
            const res = await fetch('/api/posts');
            if (!res.ok) throw new Error('Gagal memuat postingan');
            const posts = await res.json();
            if (!posts.length) {
                postFeed.innerHTML = '<p>Belum ada postingan.</p>';
                return;
            }
            postFeed.innerHTML = posts.map(post => `
                <div class="post-card" data-post-id="${post.id}">
                    <div class="post-author">
                        <strong>${post.authorName}</strong>
                        <span class="post-date">${new Date(post.timestamp).toLocaleString('id-ID')}</span>
                    </div>
                    <div class="post-content">${post.content}</div>
                    <div class="post-actions">
                        <button class="btn like-btn" data-post-id="${post.id}">Like <span class="like-count">${(post.likes||[]).length}</span></button>
                        <button class="btn comment-toggle" data-post-id="${post.id}">Comment</button>
                    </div>
                    <div class="post-comments">
                        ${(post.comments||[]).map(c=>`<div class="comment"><strong>${c.authorName}</strong> <span class="comment-date">${new Date(c.timestamp).toLocaleString('id-ID')}</span><div class="comment-text">${c.text}</div></div>`).join('')}
                    </div>
                    <form class="comment-form" data-post-id="${post.id}" style="display:none;margin-top:8px;">
                        <input type="text" name="comment" placeholder="Tulis komentar..." style="width:70%;padding:8px;border-radius:6px;border:1px solid #333;background:#0b0b0b;color:#fff;">
                        <button class="btn" type="submit">Kirim</button>
                    </form>
                </div>
            `).join('');

            // Attach action handlers
            document.querySelectorAll('.like-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const postId = e.currentTarget.dataset.postId;
                    try {
                        const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ userEmail: loggedInUserEmail }) });
                        if (!res.ok) throw new Error('like failed');
                        await loadPosts();
                    } catch (err) { console.error(err); }
                });
            });
            document.querySelectorAll('.comment-toggle').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const postId = e.currentTarget.dataset.postId;
                    const form = document.querySelector(`.comment-form[data-post-id="${postId}"]`);
                    if (form) form.style.display = form.style.display === 'none' ? 'flex' : 'none';
                });
            });
            document.querySelectorAll('.comment-form').forEach(form => {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const postId = e.currentTarget.dataset.postId;
                    const commentText = e.currentTarget.comment.value.trim();
                    if (!commentText) return;
                    try {
                        const res = await fetch(`/api/posts/${postId}/comment`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ userEmail: loggedInUserEmail, comment: commentText }) });
                        if (!res.ok) throw new Error('comment failed');
                        e.currentTarget.reset();
                        e.currentTarget.style.display = 'none';
                        await loadPosts();
                    } catch (err) { console.error(err); }
                });
            });
        } catch (err) {
            postFeed.innerHTML = '<p>Gagal memuat postingan.</p>';
        }
    }


    // Tombol logout
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            localStorage.removeItem('loggedInUser');
            window.location.href = 'login.html';
        });
    }

    // Tangani submit form postingan baru
    const createPostForm = document.getElementById('create-post-form');
    createPostForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const content = createPostForm.content.value.trim();
        if (!content) return;
        createPostForm.querySelector('button').disabled = true;
        let errorMsg = document.getElementById('post-error-message');
        if (errorMsg) errorMsg.remove();
        try {
            const res = await fetch('/api/posts/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, userEmail: loggedInUserEmail })
            });
            if (!res.ok) throw new Error('Gagal membuat postingan');
            createPostForm.reset();
            loadPosts();
        } catch (err) {
            errorMsg = document.createElement('div');
            errorMsg.id = 'post-error-message';
            errorMsg.style.color = 'red';
            errorMsg.style.marginTop = '8px';
            errorMsg.textContent = 'Gagal mengirim feed. Silakan coba lagi.';
            createPostForm.parentNode.appendChild(errorMsg);
        } finally {
            createPostForm.querySelector('button').disabled = false;
        }
    });

    // Inisialisasi
    loadUserProfile();
    loadPosts();
});