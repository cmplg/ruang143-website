document.addEventListener('DOMContentLoaded', () => {
    const venueSelect = document.getElementById('venueSelect');
    const bandCheckboxContainer = document.getElementById('band-checkbox-container');
    const adminForm = document.getElementById('admin-form');
    const feedbackMessageEl = document.getElementById('feedback-message');

    // 1. Fungsi untuk mengambil data semua venue dari server
    async function populateVenues() {
        try {
            const response = await fetch('/api/users/venues');
            if (!response.ok) throw new Error('Gagal memuat venue');
            const venues = await response.json();
            
            venueSelect.innerHTML = '<option value="">-- Pilih Venue --</option>';
            venues.forEach(venue => {
                const option = document.createElement('option');
                option.value = venue.email;
                option.textContent = venue.name;
                venueSelect.appendChild(option);
            });
        } catch (error) {
            venueSelect.innerHTML = '<option value="">Gagal memuat</option>';
            console.error(error);
        }
    }

    // 2. Fungsi untuk mengambil data semua band dari server
    async function populateBands() {
        try {
            const response = await fetch('/api/users/bands');
            if (!response.ok) throw new Error('Gagal memuat band');
            const bands = await response.json();

            bandCheckboxContainer.innerHTML = '';
            if (bands.length === 0) {
                bandCheckboxContainer.innerHTML = '<p>Belum ada band yang terdaftar.</p>';
                return;
            }
            
            bands.forEach(band => {
                const div = document.createElement('div');
                div.className = 'checkbox-item';
                div.innerHTML = `
                    <input type="checkbox" id="${band.email}" name="bandEmails" value="${band.email}">
                    <label for="${band.email}">${band.name}</label>
                `;
                bandCheckboxContainer.appendChild(div);
            });
        } catch (error) {
            bandCheckboxContainer.innerHTML = '<p>Gagal memuat band.</p>';
            console.error(error);
        }
    }

    // 3. Menjalankan kedua fungsi saat halaman dimuat
    populateVenues();
    populateBands();

    // 4. Logika saat form admin disubmit
    adminForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const venueEmail = formData.get('venueEmail');
        const bandEmails = formData.getAll('bandEmails');
        const points = formData.get('points');

        if (!venueEmail) {
            feedbackMessageEl.textContent = 'Anda harus memilih satu venue.';
            feedbackMessageEl.className = 'feedback error';
            return;
        }

        if (bandEmails.length === 0) {
            feedbackMessageEl.textContent = 'Pilih minimal satu band yang tampil.';
            feedbackMessageEl.className = 'feedback error';
            return;
        }

        const response = await fetch('/api/award-points', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ venueEmail, bandEmails, points: parseInt(points) })
        });

        const result = await response.json();
        feedbackMessageEl.textContent = result.message;

        if (response.ok) {
            feedbackMessageEl.className = 'feedback success';
            event.target.reset();
            populateBands();
        } else {
            feedbackMessageEl.className = 'feedback error';
        }
    });
});