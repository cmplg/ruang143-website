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