# Website Komunitas Kreatif Ruang 143

Selamat datang di repositori resmi untuk website Ruang 143. Proyek ini adalah sebuah aplikasi web dinamis yang dibangun dari nol untuk mengelola komunitas kreatif, termasuk band, musisi, dan venue.

![Screenshot Halaman Utama](![Uploading {51001A02-01A0-4013-B020-D09B44BBA814}.png…]()
) 
*(Catatan: Ganti URL screenshot di atas dengan URL gambar screenshot halaman utama Anda jika sudah ada)*

## Fitur Utama

Website ini memiliki fungsionalitas lengkap yang mencakup:

*   **Sistem Member (Band & Venue):** Pengguna bisa mendaftar sebagai "Band/Musisi" atau "Venue", dengan kolom data yang berbeda untuk setiap tipe.
*   **Sistem Poin:** Admin dapat memberikan poin kepada member yang berpartisipasi dalam event.
*   **Sistem Artikel Dinamis:**
    *   Tampilan daftar artikel modern yang terinspirasi dari portal berita, lengkap dengan slider artikel unggulan.
    *   Halaman detail artikel dengan layout profesional (sidebar dan navigasi artikel).
    *   Dukungan format **Markdown** untuk teks tebal, miring, gambar di tengah, dan lain-lain.
*   **Sistem Galeri Berbasis Album:**
    *   Admin dapat membuat album dan mengunggah banyak foto sekaligus.
    *   Tampilan daftar album yang elegan.
    *   Halaman detail album dengan gaya *full-width* yang imersif.
*   **Sistem Event & Roadmap:**
    *   Halaman interaktif yang menampilkan roadmap acara lampau dan rencana masa depan.
    *   Layout profesional dengan sidebar dan area konten yang bisa di-scroll.
*   **Dashboard Admin Terpusat:**
    *   Satu halaman pusat untuk mengelola semua konten: Poin, Event, Artikel, dan Galeri.
    *   Fungsionalitas **Tambah, Edit, dan Hapus (CRUD)** untuk setiap fitur.
    *   Dilindungi oleh halaman **Login Admin** yang aman.
*   **Keamanan:** Password pengguna dienkripsi menggunakan `bcrypt` untuk keamanan data.

## Teknologi yang Digunakan

*   **Front-End:** HTML5, CSS3, JavaScript (Vanilla JS)
*   **Back-End:** Node.js, Express.js
*   **Database:** File JSON sederhana (`db.json`) sebagai database lokal.
*   **Lainnya:** `bcrypt` untuk enkripsi, `marked` untuk parsing Markdown, `Swiper.js` untuk slider.

---

## Cara Menjalankan Proyek Ini Secara Lokal

Untuk menjalankan proyek ini di komputer Anda, ikuti langkah-langkah berikut:

### Prasyarat

Pastikan Anda sudah menginstal:
*   [Git](https://git-scm.com/downloads)
*   [Node.js](https://nodejs.org/) (versi LTS direkomendasikan)

### Instalasi & Setup

1.  **Clone repositori ini:**
    Buka terminal atau command prompt, navigasikan ke folder tempat Anda ingin menyimpan proyek, lalu jalankan:
    ```bash
    git clone https://github.com/cmplg/ruang143-website.git
    ```

2.  **Masuk ke direktori proyek:**
    ```bash
    cd ruang143-website
    ```

3.  **Install semua dependensi yang dibutuhkan:**
    Perintah ini akan membaca `package.json` dan menginstal `express`, `bcrypt`, dll.
    ```bash
    npm install
    ```

### Menjalankan Server

1.  Setelah instalasi selesai, jalankan server dengan perintah:
    ```bash
    node server.js
    ```
2.  Jika berhasil, Anda akan melihat pesan: `Server Ruang 143 berjalan di http://localhost:3000`

### Mengakses Website

*   **Situs Publik:** Buka browser dan kunjungi `http://localhost:3000`
*   **Login Admin:** Untuk mengakses dashboard, buka `http://localhost:3000/admin-login.html`
*   **Dashboard:** Setelah login, Anda akan diarahkan ke `http://localhost:3000/dashboard.html`

### Kredensial Admin Default

Kredensial untuk login admin didefinisikan langsung di dalam file `server.js`.

*   **Username:** `admin143`
*   **Password:** `passwordRahasiaAnda`

> **Penting:** Ganti password default di dalam file `server.js` sebelum mempublikasikan website ini secara online.

---

Terima kasih telah melihat proyek ini!
