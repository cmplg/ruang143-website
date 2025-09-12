// Isi untuk js/auth.js
document.addEventListener('DOMContentLoaded', () => {
    const feedbackMessageEl = document.getElementById('feedback-message');

    // --- Registrasi ---
    const registerForm = document.getElementById('register-form');
    if (registerForm) { 
                const userTypeSelect = document.getElementById('userType');
        const nameLabel = document.getElementById('name-label');
        const bandFields = document.getElementById('band-fields');
        const venueFields = document.getElementById('venue-fields');

        userTypeSelect.addEventListener('change', (e) => {
            const selectedType = e.target.value;
            bandFields.style.display = 'none';
            venueFields.style.display = 'none';

            if (selectedType === 'band') {
                nameLabel.textContent = 'Nama Band / Musisi';
                bandFields.style.display = 'block';
            } else if (selectedType === 'venue') {
                nameLabel.textContent = 'Nama Venue';
                venueFields.style.display = 'block';
            } else {
                nameLabel.textContent = 'Nama';
            }
        });

        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(event.target);
            const data = Object.fromEntries(formData.entries());

            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            feedbackMessageEl.textContent = result.message;
            if (response.ok) {
                feedbackMessageEl.className = 'feedback success';
                setTimeout(() => { window.location.href = 'login.html'; }, 2000);
            } else {
                feedbackMessageEl.className = 'feedback error';
            }
        });
    }

    // --- Login ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
                loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = event.target.email.value;
            const password = event.target.password.value;
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const result = await response.json();
            if (response.ok) {
                localStorage.setItem('loggedInUser', result.email);
                window.location.href = 'profile.html';
            } else {
                feedbackMessageEl.textContent = result.message;
                feedbackMessageEl.className = 'feedback error';
            }
        });
    }

    // --- Profil ---
    if (window.location.pathname.endsWith('profile.html')) {       
        const loggedInUserEmail = localStorage.getItem('loggedInUser');
        if (!loggedInUserEmail) {
            window.location.href = 'login.html';
        } else {
            fetch(`/api/profile/${loggedInUserEmail}`)
                .then(res => res.json())
                .then(user => {
                    document.getElementById('profile-name').textContent = user.name;
                    document.getElementById('profile-email').textContent = user.email;
                    document.getElementById('profile-points').textContent = user.points;
                    
                    const specificInfoContainer = document.getElementById('profile-specific-info');
                    let specificInfoHtml = '';

                    if (user.userType === 'band') {
                        document.getElementById('profile-title').textContent = 'Profil Band';
                        specificInfoHtml = `
                            <p><strong>Genre:</strong> ${user.genre || '-'}</p>
                            <p><strong>Jumlah Personel:</strong> ${user.memberCount || '-'}</p>
                        `;
                    } else if (user.userType === 'venue') {
                        document.getElementById('profile-title').textContent = 'Profil Venue';
                        specificInfoHtml = `
                            <p><strong>Alamat:</strong> ${user.address || '-'}</p>
                            <p><strong>Kapasitas:</strong> ${user.capacity || '-'} orang</p>
                        `;
                    }
                    specificInfoContainer.innerHTML = specificInfoHtml;
                });
        }
    }
    // --- Logout ---
    const logoutButton = document.getElementById('logout-button');
    if(logoutButton) {
                logoutButton.addEventListener('click', () => {
            localStorage.removeItem('loggedInUser');
            window.location.href = 'login.html';
        });
    }
    
    // --- Edit Profil ---
    if (window.location.pathname.endsWith('edit-profile.html')) {
                const loggedInUserEmail = localStorage.getItem('loggedInUser');
        if (!loggedInUserEmail) {
            window.location.href = 'login.html'; // Tendang jika belum login
        }

        const editForm = document.getElementById('edit-form');
        const nameLabel = document.getElementById('name-label');
        const bandFields = document.getElementById('band-fields');
        const venueFields = document.getElementById('venue-fields');

        // 1. Ambil data lama dan isi formulir
        fetch(`/api/profile/${loggedInUserEmail}`)
            .then(res => res.json())
            .then(user => {
                // Isi semua field yang ada
                document.getElementById('userType').value = user.userType;
                document.getElementById('name').value = user.name;
                document.getElementById('email').value = user.email;
                document.getElementById('genre').value = user.genre || '';
                document.getElementById('memberCount').value = user.memberCount || '';
                document.getElementById('address').value = user.address || '';
                document.getElementById('capacity').value = user.capacity || '';

                // Tampilkan field yang relevan (band atau venue)
                if (user.userType === 'band') {
                    nameLabel.textContent = 'Nama Band / Musisi';
                    bandFields.style.display = 'block';
                } else if (user.userType === 'venue') {
                    nameLabel.textContent = 'Nama Venue';
                    venueFields.style.display = 'block';
                }
            });

        // 2. Kirim data yang sudah diubah saat form disubmit
        editForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(event.target);
            const data = Object.fromEntries(formData.entries());
            data.originalEmail = loggedInUserEmail; // Kirim email lama sebagai identitas

            const response = await fetch('/api/profile/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            const feedbackMessageEl = document.getElementById('feedback-message');
            feedbackMessageEl.textContent = result.message;

            if (response.ok) {
                feedbackMessageEl.className = 'feedback success';
                // Update email di localStorage jika diubah
                localStorage.setItem('loggedInUser', result.newEmail);
                setTimeout(() => { window.location.href = 'profile.html'; }, 2000);
            } else {
                feedbackMessageEl.className = 'feedback error';
            }
        });
    }
});