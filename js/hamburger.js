// Global hamburger handler: overlay, close on outside click, append copyright
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger-menu');
    const nav = document.getElementById('main-nav');
    if (!hamburger || !nav) return;

    // Toggle nav on hamburger click
    hamburger.addEventListener('click', function(e) {
        e.stopPropagation();
        const isOpen = nav.classList.toggle('nav-open');
        hamburger.classList.toggle('is-active');

        // Manage overlay
        let overlay = document.querySelector('.nav-overlay');
        if (isOpen) {
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'nav-overlay';
                document.body.appendChild(overlay);
                // Close nav when clicking outside
                overlay.addEventListener('click', () => {
                    nav.classList.remove('nav-open');
                    hamburger.classList.remove('is-active');
                    overlay.remove();
                });
            }
        } else {
            if (overlay) overlay.remove();
        }
    });

    // Close nav if a nav link is clicked
    document.querySelectorAll('#main-nav a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('nav-open');
            hamburger.classList.remove('is-active');
            const overlay = document.querySelector('.nav-overlay');
            if (overlay) overlay.remove();
        });
    });

    // Close nav when clicking outside of it
    document.addEventListener('click', (event) => {
        if (!nav.contains(event.target) && !hamburger.contains(event.target)) {
            nav.classList.remove('nav-open');
            hamburger.classList.remove('is-active');
            const overlay = document.querySelector('.nav-overlay');
            if (overlay) overlay.remove();
        }
    });

    // Append copyright notice to the nav if it doesn't exist
    if (!document.getElementById('nav-copyright')) {
        const copyright = document.createElement('div');
        // Updated to a more professional style and adjusted positioning
        copyright.id = 'nav-copyright';
        copyright.textContent = '© 2025 cmplg - RUANG143. All rights reserved.';
        // Adjust styling to position it away from the member menu
        copyright.style.marginTop = '20px';
        copyright.style.fontSize = '0.8em';
        copyright.style.textAlign = 'center';
        nav.appendChild(copyright);
    }
});