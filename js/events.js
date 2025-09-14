// =======================================================
// === KODE FINAL & LENGKAP UNTUK js/events.js         ===
// =======================================================
document.addEventListener('DOMContentLoaded', () => {

    // --- LOGIKA HALAMAN BUAT EVENT (ADMIN) ---
    const eventForm = document.getElementById('event-form');
    if (eventForm) {
        eventForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            const feedbackEl = document.getElementById('feedback-message');
            
            feedbackEl.textContent = 'Menyimpan...';
            feedbackEl.className = 'feedback';

            const response = await fetch('/api/events/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            feedbackEl.textContent = result.message;

            if (response.ok) {
                feedbackEl.className = 'feedback success';
                e.target.reset();
            } else {
                feedbackEl.className = 'feedback error';
            }
        });
    }

    // --- LOGIKA HALAMAN TAMPILAN EVENT (PUBLIK) ---
    const roadmapContainer = document.getElementById('roadmap-container');
    const futurePlansContainer = document.getElementById('future-plans-container');
    if (roadmapContainer && futurePlansContainer) {
        fetch('/api/events')
            .then(res => res.json())
            .then(events => {
                const pastEvents = events.filter(e => e.type === 'past').sort((a, b) => new Date(b.date) - new Date(a.date));
                const futureEvents = events.filter(e => e.type === 'future').sort((a, b) => new Date(a.date) - new Date(b.date));

                // Tampilkan Rencana di Sidebar
                if (futureEvents.length > 0) {
                    futurePlansContainer.innerHTML = futureEvents.map(event => {
                        const formattedDescription = '<p>' + (event.description || '').replace(/\n/g, '</p><p>') + '</p>';
                        return `
                        <div class="plan-card">
                            <h4>${event.title}</h4>
                            <span class="plan-date">Direncanakan: ${new Date(event.date).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
                            ${event.imageUrl ? `<img src="${event.imageUrl}" alt="${event.title}" class="roadmap-flyer">` : ''}
                            <div class="plan-card-body">${formattedDescription}</div>
                        </div>
                        `;
                    }).join('');
                } else {
                    futurePlansContainer.innerHTML = '<p style="text-align: center;">Rencana baru akan segera diumumkan!</p>';
                }

                // Tampilkan Roadmap di Konten Utama
                if (pastEvents.length > 0) {
                    roadmapContainer.innerHTML = pastEvents.map((event, index) => {
                         const formattedDescription = '<p>' + (event.description || '').replace(/\n/g, '</p><p>') + '</p>';
                        return `
                        <div class.roadmap-item ${index % 2 === 0 ? 'left' : 'right'}">
                            <div class="roadmap-content">
                                <h3>${event.title}</h3>
                                <span class="roadmap-date">${new Date(event.date).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
                                ${event.imageUrl ? `<img src="${event.imageUrl}" alt="${event.title}" class="roadmap-flyer">` : ''}
                                <div class="roadmap-description">${formattedDescription}</div>
                            </div>
                        </div>
                        `;
                    }).join('');
                } else {
                    roadmapContainer.innerHTML = '<p style="text-align: center;">Belum ada jejak event yang tercatat.</p>';
                }
                
                setupImageModal();
            });
    }

    // --- FUNGSI MODAL GAMBAR ---
    function setupImageModal() {
        const modal = document.getElementById("image-modal");
        if (!modal) return;
        const modalImg = document.getElementById("modal-image");
        const closeBtn = document.querySelector(".close-button");
        document.querySelectorAll('.roadmap-flyer').forEach(img => {
            img.onclick = function() {
                modal.style.display = "block";
                modalImg.src = this.src;
            }
        });
        if (closeBtn) {
            closeBtn.onclick = function() {
                modal.style.display = "none";
            }
        }
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    }
});