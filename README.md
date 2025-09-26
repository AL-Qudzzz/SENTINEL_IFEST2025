# Sentinel: Intelligent Contract Lifecycle Management

Sentinel adalah platform manajemen siklus hidup kontrak cerdas yang dirancang untuk membantu organisasi mengelola, menganalisis, dan mengoptimalkan portofolio kontrak mereka secara proaktif. Dibangun dengan Next.js, Firebase, dan Google AI, Sentinel mengubah dokumen hukum statis menjadi aset data strategis.

## Project Changelog

Dokumen ini mencatat evolusi, perbaikan bug, dan keputusan arsitektural yang dibuat selama pengembangan aplikasi Sentinel.

---

### **Versi 1.2.1** - *18 Oktober 2024*

-   **Peningkatan:** **Dokumentasi Terpusat.**
    -   Memindahkan catatan perubahan (changelog) ke dalam file `README.md` utama untuk menyediakan sumber informasi tunggal bagi pengembang.
    -   Menghapus halaman `/changelog` dan tautan navigasi terkait untuk menyederhanakan antarmuka.

---

### **Versi 1.2.0** - *18 Oktober 2024*

-   **Fitur:** **Pembaruan Foto Profil Pengguna.**
    -   Mengimplementasikan fungsionalitas bagi pengguna untuk mengunggah dan memperbarui foto profil mereka.
    -   Alur terintegrasi penuh dengan Firebase Storage untuk penyimpanan gambar dan memperbarui `photoURL` di Firebase Auth serta dokumen pengguna di Firestore.

-   **Perbaikan:** **Stabilitas Unggah Gambar.**
    -   Memperbaiki bug kritis di mana gambar profil yang baru dipilih tidak berhasil diunggah ke Firebase Storage saat tombol "Save Changes" ditekan.
    -   Merestrukturisasi logika `onSubmit` pada halaman profil untuk memastikan unggahan gambar (jika ada) terjadi sebelum pembaruan data di database, menciptakan alur yang atomik dan andal.

---

### **Versi 1.1.0** - *17 Oktober 2024*

-   **Perbaikan Kritis:** **Logika Tanggal Kedaluwarsa Kontrak.**
    -   Memperbaiki bug fatal di mana sistem salah menggunakan tanggal hari ini (`new Date()`) sebagai dasar untuk menghitung tanggal kedaluwarsa kontrak jika tanggal tersebut tidak ditemukan secara eksplisit oleh AI.
    -   Logika diubah untuk **selalu** menggunakan `effectiveDate` (tanggal efektif) yang valid dari hasil analisis AI sebagai satu-satunya dasar untuk perhitungan *fallback*, memastikan konsistensi dan akurasi data.

-   **Peningkatan:** **Strukturisasi Data AI (JSON Output).**
    -   Merombak alur `extract-contract-data-flow` untuk memaksa AI menghasilkan output dalam format JSON yang terstruktur dan ketat, terutama untuk tanggal.
    -   Mengubah skema output tanggal dari `string` menjadi objek `{ day: number, month: number, year: number }`. Ini secara dramatis meningkatkan keandalan parsing tanggal dan menghilangkan ambiguitas format.
    -   Frontend disesuaikan untuk memproses struktur objek tanggal yang baru, menyelesaikan masalah parsing dari akarnya.

---

### **Versi 1.0.0** - *16 Oktober 2024*

-   **Rilis Awal:** **Inisialisasi Proyek Sentinel.**
    -   **Dashboard Utama:** Menyediakan ringkasan statistik kontrak, aktivitas terbaru, tenggat waktu yang akan datang, dan gambaran umum risiko.
    -   **Manajemen Kontrak:** Fungsionalitas CRUD (Create, Read, Update, Delete) untuk semua kontrak, dengan kemampuan pencarian semantik berbasis AI dan filter berdasarkan status.
    -   **Analisis Risiko AI:** Kemampuan untuk menganalisis teks kontrak, memberikan skor risiko, mengidentifikasi faktor risiko, dan menyarankan klausa alternatif yang lebih aman.
    -   **Q&A Kontrak:** Antarmuka untuk mengunggah dokumen dan mengajukan pertanyaan dalam bahasa alami untuk mendapatkan jawaban dari AI.
    -   **Collaboration Hub:** Ruang kerja untuk memantau alur persetujuan (`approval workflow`), menambahkan komentar, dan melihat riwayat aktivitas untuk setiap kontrak.
    -   **Manajemen Pengguna:** Halaman profil bagi pengguna untuk mengelola informasi pribadi dan pengaturan keamanan.
    -   **Arsitektur & Tumpukan Teknologi:**
        -   **Framework:** Next.js dengan App Router.
        -   **UI/UX:** ShadCN UI, Tailwind CSS, dan Lucide Icons.
        -   **Backend & Database:** Firebase (Authentication, Firestore, Storage).
        -   **AI & GenAI:** Google AI (Gemini) melalui Genkit.
