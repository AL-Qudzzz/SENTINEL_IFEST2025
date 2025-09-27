# Sentinel: Intelligent Contract Lifecycle Management

Sentinel adalah platform manajemen siklus hidup kontrak cerdas yang dirancang untuk membantu organisasi mengelola, menganalisis, dan mengoptimalkan portofolio kontrak mereka secara proaktif. Dibangun dengan Next.js, Firebase, dan Google AI, Sentinel mengubah dokumen hukum statis menjadi aset data strategis.

## Checklist Fitur SENTINEL

Berikut adalah status pengembangan fitur-fitur utama dalam aplikasi Sentinel.

### Modul Inti: Intelligent Foundation & Lifecycle Sentinel
- [X] **Pengumpulan Data & Penyimpanan Cerdas**
  - [X] Formulir digital untuk pengumpulan data melalui dialog unggah.
  - [X] Teknologi OCR (via text extraction) untuk mengubah kontrak fisik (PDF, DOCX) menjadi aset digital.
  - [X] Repositori terpusat yang aman (Firebase Firestore) dengan enkripsi.
- [X] **Ekstraksi Data Cerdas Berbasis AI**
  - [X] Mesin AI dengan NLP untuk membaca dan memahami dokumen secara otomatis.
  - [X] Ekstraksi otomatis untuk metadata kunci, tanggal penting, kewajiban, dan metrik kinerja.
- [X] **Pelacakan Siklus Hidup Otomatis**
  - [X] Sistem pemantauan proaktif untuk setiap kontrak.
  - [X] Notifikasi cerdas yang dapat dikonfigurasi (untuk tenggat waktu 10 hari) untuk perpanjangan atau pengakhiran.

### Modul Keamanan: Aegis Risk & Compliance Engine
- [X] **Deteksi Risiko & Rekomendasi Kebijakan**
  - [X] Analisis klausul oleh AI terhadap database hukum, regulasi, dan kebijakan internal.
  - [X] Pemberian skor risiko otomatis.
  - [X] Penandaan klausul yang ambigu atau tidak standar.
- [X] **Rekomendasi Klausul Cerdas**
  - [X] Sistem merekomendasikan formulasi kalimat atau klausul alternatif yang lebih aman.

### Modul Kolaborasi: Synergy Collaboration Hub
- [X] **Penyusunan & Peninjauan Kontrak Kolaboratif**
  - [X] Ruang kerja real-time untuk revisi, komentar, dan persetujuan.
- [X] **Alur Kerja Persetujuan Dinamis**
  - [X] Alur kerja persetujuan yang fleksibel dan otomatis.
  - [X] Perutean draf cerdas ke pihak berwenang berdasarkan aturan yang telah ditentukan.

### Modul Analitik: Cortex Analytics & Intelligence
- [X] **Dashboard Analitik Interaktif**
  - [X] Visualisasi data performa siklus kontrak (statistik, aktivitas, ringkasan risiko).
  - [X] Analisis pengeluaran dan identifikasi *bottleneck* proses.
- [X] **Pencarian Semantik**
  - [X] Kemampuan mencari kontrak menggunakan bahasa alami (contoh: "tampilkan semua kontrak yang akan berakhir dalam 6 bulan").
- [X] **Asisten AI Generatif**
  - [X] Fitur "Tanya Jawab Kontrak" untuk bertanya langsung pada AI mengenai isi dokumen.


## Project Changelog

Dokumen ini mencatat evolusi, perbaikan bug, dan keputusan arsitektural yang dibuat selama pengembangan aplikasi Sentinel.

---

### **Versi 1.2.1** - *27 Septermber 2025*

-   **Peningkatan:** **Dokumentasi Terpusat.**
    -   Memindahkan catatan perubahan (changelog) ke dalam file `README.md` utama untuk menyediakan sumber informasi tunggal bagi pengembang.
    -   Menghapus halaman `/changelog` dan tautan navigasi terkait untuk menyederhanakan antarmuka.

---

### **Versi 1.2.0** - *27 september 2025*

-   **Fitur:** **Pembaruan Foto Profil Pengguna.**
    -   Mengimplementasikan fungsionalitas bagi pengguna untuk mengunggah dan memperbarui foto profil mereka.
    -   Alur terintegrasi penuh dengan Firebase Storage untuk penyimpanan gambar dan memperbarui `photoURL` di Firebase Auth serta dokumen pengguna di Firestore.

-   **Perbaikan:** **Stabilitas Unggah Gambar.**
    -   Memperbaiki bug kritis di mana gambar profil yang baru dipilih tidak berhasil diunggah ke Firebase Storage saat tombol "Save Changes" ditekan.
    -   Merestrukturisasi logika `onSubmit` pada halaman profil untuk memastikan unggahan gambar (jika ada) terjadi sebelum pembaruan data di database, menciptakan alur yang atomik dan andal.

---

### **Versi 1.1.0** - *26 September 2025*

-   **Perbaikan Kritis:** **Logika Tanggal Kedaluwarsa Kontrak.**
    -   Memperbaiki bug fatal di mana sistem salah menggunakan tanggal hari ini (`new Date()`) sebagai dasar untuk menghitung tanggal kedaluwarsa kontrak jika tanggal tersebut tidak ditemukan secara eksplisit oleh AI.
    -   Logika diubah untuk **selalu** menggunakan `effectiveDate` (tanggal efektif) yang valid dari hasil analisis AI sebagai satu-satunya dasar untuk perhitungan *fallback*, memastikan konsistensi dan akurasi data.

-   **Peningkatan:** **Strukturisasi Data AI (JSON Output).**
    -   Merombak alur `extract-contract-data-flow` untuk memaksa AI menghasilkan output dalam format JSON yang terstruktur dan ketat, terutama untuk tanggal.
    -   Mengubah skema output tanggal dari `string` menjadi objek `{ day: number, month: number, year: number }`. Ini secara dramatis meningkatkan keandalan parsing tanggal dan menghilangkan ambiguitas format.
    -   Frontend disesuaikan untuk memproses struktur objek tanggal yang baru, menyelesaikan masalah parsing dari akarnya.

---

### **Versi 1.0.0** - *26 september 2025*

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
