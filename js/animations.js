// Kode untuk js/animations.js
document.addEventListener('DOMContentLoaded', () => {
    
    function revealOnScroll() {
        const reveals = document.querySelectorAll('.reveal');
        
        for (let i = 0; i < reveals.length; i++) {
            const windowHeight = window.innerHeight;
            const elementTop = reveals[i].getBoundingClientRect().top;
            const elementVisible = 150; // Jarak dari bawah layar sebelum elemen muncul

            if (elementTop < windowHeight - elementVisible) {
                reveals[i].classList.add('active');
            } else {
                reveals[i].classList.remove('active');
            }
        }
    }

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Jalankan sekali saat halaman dimuat
});

// Tambahkan kode ini ke dalam file js/animations.js

document.addEventListener('DOMContentLoaded', () => {

    // --- Efek saat Halaman Utama (index.html) Dimuat ---
    if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
        
        // 1. Memicu animasi fade-in
        // Menunggu sebentar agar transisi terlihat
        setTimeout(() => {
            document.body.classList.add('loaded');
        }, 100);

        // 2. Efek Parallax untuk logo di background
        const bgLogo = document.querySelector('.background-logo-container img');
        if (bgLogo) {
            window.addEventListener('mousemove', (e) => {
                const xAxis = (window.innerWidth / 2 - e.pageX) / 25; // Pembagi lebih besar = gerakan lebih halus
                const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
                bgLogo.style.transform = `translateX(${xAxis}px) translateY(${yAxis}px)`;
            });
        }
    }

    // Fungsi revealOnScroll yang sudah ada sebelumnya
    function revealOnScroll() {
        const reveals = document.querySelectorAll('.reveal');
        for (let i = 0; i < reveals.length; i++) {
            const windowHeight = window.innerHeight;
            const elementTop = reveals[i].getBoundingClientRect().top;
            const elementVisible = 150;
            if (elementTop < windowHeight - elementVisible) {
                reveals[i].classList.add('active');
            } else {
                reveals[i].classList.remove('active');
            }
        }
    }
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll();

});

// ===================================
// === LOGIKA NOTIFIKASI REAL-TIME ===
// ===================================

// Fungsi untuk menampilkan notifikasi
function showFloatingNotification(message) {
    const container = document.getElementById('notification-container');
    if (!container) return;

    // Buat elemen notifikasi baru
    const notification = document.createElement('div');
    notification.className = 'floating-notification';
    notification.textContent = message;

    // Tambahkan ke halaman
    container.appendChild(notification);

    // Memicu animasi masuk
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Hapus notifikasi setelah beberapa detik
    setTimeout(() => {
        notification.classList.remove('show');
        // Hapus elemen dari DOM setelah animasi keluar selesai
        setTimeout(() => {
            if (container.contains(notification)) {
                container.removeChild(notification);
            }
        }, 500);
    }, 5000); // Notifikasi akan hilang setelah 5 detik
}

// Inisialisasi koneksi ke server Socket.io
const socket = io();

// "Dengarkan" event 'new_post_notification' dari server
socket.on('new_post_notification', (data) => {
    // Panggil fungsi untuk menampilkan notifikasi dengan pesan yang diterima
    showFloatingNotification(`${data.authorName} telah membuat postingan: "${data.postContent.substring(0, 30)}..."`);
});