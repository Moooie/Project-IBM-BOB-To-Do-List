# Project-IBM-BOB-To-Do-List

Aplikasi web manajemen tugas (To-Do List) interaktif yang dibangun menggunakan HTML5, CSS3, dan Vanilla JavaScript modular. Dikembangkan untuk program IBM BOB.

##  Fitur Utama

- **Manajemen Tugas Lengkap (CRUD):** Tambah tugas baru, tandai selesai (*toggle complete*), edit teks dan tenggat waktu via modal, serta hapus tugas.
- **Jadwal & Tenggat Waktu (*Due Date & Time*):** Dukungan penetapan tanggal dan jam batas waktu dengan indikator otomatis untuk tugas yang telah terlewat (*overdue*).
- **Filter Status Tugas:** Pemilahan tampilan tugas berdasarkan tab *All*, *Active*, dan *Completed*.
- **Indikator Progres Real-Time:** Menampilkan rasio persentase penyelesaian tugas (*progress bar*) dan jumlah tugas aktif secara dinamis.
- **Penyimpanan Lokal Persisten:** Seluruh data tugas tersimpan di peramban menggunakan `localStorage` sehingga data tidak hilang saat halaman dimuat ulang.
- **Aksesibilitas & Pintasan Keyboard:** Dukungan `Ctrl` / `Cmd` + `K` untuk fokus cepat ke input tugas dan `Esc` untuk menutup modal dialog.
- **Desain Modern & Responsif:** Antarmuka bersih dengan transisi dan animasi mikro CSS yang halus.

## 📁 Struktur Direktori

```text
├── index.html              # Struktur utama halaman web
├── css/
│   ├── reset.css          # Reset gaya bawaan browser
│   ├── variables.css      # Variabel tema CSS (warna, spasi, tipografi)
│   ├── components.css     # Komponen UI (tombol, input, kartu tugas, modal)
│   ├── animations.css     # Animasi mikro dan transisi interaktif
│   └── main.css           # Tata letak utama halaman
└── js/
    ├── store.js           # Data layer & persistensi localStorage
    ├── dom.js             # DOM factory & helper antarmuka
    └── app.js             # Application controller & event listener
```

## 🛠️ Cara Menjalankan

1. Klon repositori ini:
   ```bash
   git clone https://github.com/Moooie/Project-IBM-BOB-To-Do-List.git
   ```
2. Buka berkas `index.html` langsung di peramban web (browser) pilihan Anda, atau gunakan ekstensi live server lokal (seperti *Live Server* di VS Code).
