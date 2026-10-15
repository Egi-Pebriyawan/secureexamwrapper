# PRD: Secure Exam Wrapper

**Versi:** 1.0 | **Tanggal:** 15 Oktober 2026 | **Status:** Siap dikerjakan (MVP) *Nama produk sementara. Disusun dari hasil sesi tanya-jawab "grill-me".*

---

## 1. Ringkasan

Website pembungkus aman untuk **form ujian eksternal** (Google Form, Tally, dll.). Penyelenggara (guru, trainer, sekolah) cukup menempel link form, membuat token dan daftar nama peserta. Peserta masuk lewat kode ujian + token, memilih nama, lalu mengerjakan form di dalam halaman kita yang berlayar penuh, berwatermark identitas, dan memantau pelanggaran. Semua kejadian masuk laporan setelah ujian.

**Tujuan:** membuat kecurangan lebih sulit, lebih mudah dilacak, dan lebih terbukti, tanpa harus pindah dari form yang sudah dipakai penyelenggara.

**Bukan tujuan MVP:** pembuat soal bawaan, aplikasi native, kamera/AI wajah, pembayaran, bahasa selain Indonesia, penilaian otomatis.

---

## 2. Batasan Teknis (wajib dipahami semua pihak)

Form eksternal tampil di dalam *iframe* dari domain lain, sehingga halaman kita **tidak bisa melihat atau memblokir** apa pun di dalamnya.

| Hal | Status |
| --- | --- |
| Copy/paste/klik kanan **di dalam form** | Tidak bisa dikunci (hanya di halaman pembungkus). Pembuat soal bawaan = fase berikutnya |
| Screenshot, HP kedua, orang di sebelah peserta | Tidak bisa dideteksi web; dilawan dengan watermark (efek jera + pelacakan) |
| Fullscreen di iPhone Safari | Tidak didukung browser; iPhone tetap bisa ujian, laporan menandai "tanpa fullscreen" |
| Pindah tab/aplikasi | Bisa dideteksi (memakai `visibilitychange`/`pagehide`, **bukan** `blur` karena mengetuk isi iframe memicu blur palsu) |
| Pengacakan soal & penyimpanan jawaban | Diatur penyelenggara di form masing-masing |
| Status "sudah kirim" di form | Tidak bisa diverifikasi; memakai tombol "Saya sudah selesai" |
| Link form asli | Bisa terlihat peserta mahir (sisa risiko) |
| Form yang mewajibkan login Google | Bisa bermasalah di Safari (cookie pihak ketiga); panduan menyarankan form tanpa login |

---

## 3. Peran

| Peran | Akun | Kemampuan |
| --- | --- | --- |
| **Penyelenggara** | Ya (Google/email) | Membuat ujian, link form, token, daftar nama, pengaturan, melihat laporan, mengundang pengawas. Otomatis jadi pengawas bila tidak mengundang siapa pun |
| **Pengawas** | Ya (undangan) | Per ujian: memberi kode buka kunci, mengizinkan pilih ulang nama, melihat laporan ujian itu |
| **Peserta** | Tidak | Masuk dengan kode ujian + token, pilih nama, mengerjakan |

---

## 4. Alur Utama

**Penyelenggara:** daftar/login → buat ujian (judul, link form, jendela buka-tutup, durasi, toleransi pelanggaran, transparansi watermark, token) → **Uji tampil** (cek form bisa dimuat di iframe) → isi daftar nama (manual/tempel dari Excel; ID/kelas opsional) → bagikan kode ujian + token → ujian berjalan → lihat laporan → ekspor CSV.

**Peserta:** buka situs → masukkan kode ujian → token → pilih nama (nama yang sudah terpakai perangkat lain tidak tampil) → halaman aturan + persetujuan → tekan **Mulai** → masuk fullscreen (bila didukung) → kerjakan form → tekan **Saya sudah selesai** (dengan konfirmasi) → layar selesai.

**Terkunci:** layar menampilkan **ID kunci** 6 angka → peserta melapor ke pengawas → pengawas memasukkan ID di halaman pengawas → mendapat **kode buka sekali pakai** → peserta mengetik kode → lanjut.

---

## 5. Kebutuhan Fungsional

Semua item di bawah adalah **P0 (MVP)** kecuali ditandai P1.

### 5.1 Ujian & Penyelenggara

| ID | Kebutuhan |
| --- | --- |
| EX-01 | CRUD ujian: judul, link form, kode ujian unik (6–8 karakter), token, jendela buka-tutup, durasi per peserta |
| EX-02 | Status ujian otomatis: Draf → Terjadwal → Berlangsung → Selesai (berdasar jam server) |
| EX-03 | Normalisasi link: link Google Form otomatis diubah ke bentuk embed (`?embedded=true`); provider lain dipakai apa adanya |
| EX-04 | Tombol **Uji tampil**: memuat form dalam iframe dan menampilkan hasil/pesan bila gagal (form memblokir embed, butuh login) |
| EX-05 | Panduan singkat untuk penyelenggara: matikan login Google di form, aktifkan acak soal, atur durasi form sedikit longgar |
| EX-06 | Batas bawaan (konfigurasi, bukan hardcode): 200 peserta per ujian, 5 ujian aktif per akun |

### 5.2 Peserta & Token

| ID | Kebutuhan |
| --- | --- |
| PA-01 | Daftar peserta per ujian: nama wajib; ID/kelas opsional; tempel dari Excel/CSV |
| PA-02 | Token per ujian (bawaan); **token individual per nama** sebagai opsi (daftar bisa diunduh) |
| PA-03 | Pilih nama: nama yang sudah terkunci ke satu perangkat tidak tampil; pilih ulang hanya diizinkan pengawas |
| PA-04 | Percobaan token dibatasi (rate limit per IP/kode ujian); token disimpan ter-*hash* |
| PA-05 | Pengunci perangkat: ID perangkat acak disimpan di browser + ringkasan user-agent |

### 5.3 Sesi Ujian

| ID | Kebutuhan |
| --- | --- |
| SE-01 | Tombol **Mulai** → server mencatat `started_at`; `ends_at = min(started_at + durasi, jam tutup)` |
| SE-02 | Timer tampil di layar, sumber waktu server; peringatan 5 menit sebelum habis; layar **Waktu habis** menutup form |
| SE-03 | Masuk fullscreen saat Mulai bila didukung; jika tidak, tampil pemberitahuan dan tercatat "tanpa fullscreen" |
| SE-04 | Tombol **Saya sudah selesai** + dialog konfirmasi → status `selesai` |
| SE-05 | Heartbeat tiap 15 detik; tidak ada heartbeat >45 detik dicatat sebagai "koneksi putus" (dihitung server) |
| SE-06 | Peserta yang menutup halaman dapat masuk lagi (token + nama sama + perangkat sama) dengan timer tetap berjalan |

### 5.4 Pelanggaran & Kunci

| ID | Kebutuhan |
| --- | --- |
| PV-01 | **Menambah hitungan:** keluar fullscreen, pindah tab, pindah aplikasi |
| PV-02 | **Dicatat + diblokir, tidak menambah hitungan:** copy, paste, cut, klik kanan, print, perubahan ukuran layar mendadak (split-screen/jendela mengambang), DevTools (upaya terbaik di laptop) |
| PV-03 | Toleransi per ujian: 0 (kunci langsung) sampai 3; **bawaan 1** (pelanggaran pertama peringatan, berikutnya terkunci) |
| PV-04 | Status `locked` disimpan di server; muat ulang halaman tidak membuka kunci |
| PV-05 | ID kunci 6 angka dibuat saat terkunci; pengawas memasukkan ID → server membuat **kode buka sekali pakai** (berlaku 10 menit, dibatasi percobaan) |
| PV-06 | Semua kejadian (peringatan, kunci, ID, pembukaan, pelaku pembuka) tercatat dengan jam server |
| PV-07 | Penerapan kunci tidak boleh hanya di sisi klien: mencoba menembus overlay dicatat sebagai pelanggaran |

### 5.5 Watermark

| ID | Kebutuhan |
| --- | --- |
| WM-01 | Lapisan transparan di atas iframe berisi **nama + ID/kelas (jika ada) + kode ujian + jam**, diulang miring menutupi seluruh layar (tahan crop) |
| WM-02 | Aktif bawaan; transparansi bisa diatur penyelenggara per ujian (bawaan tipis agar soal terbaca) |
| WM-03 | `MutationObserver` + pengecekan berkala: bila watermark dihapus/disembunyikan/diubah opasitasnya → dicatat pelanggaran, watermark dipasang ulang, kunci bila melewati toleransi |
| WM-04 | Lapisan tidak menghalangi interaksi dengan form (`pointer-events: none`) |

### 5.6 Laporan

| ID | Kebutuhan |
| --- | --- |
| RP-01 | Per peserta: waktu masuk/mulai/selesai, durasi, status selesai, daftar kejadian berjam, jumlah pelanggaran, perangkat + browser, tanda "tanpa fullscreen" |
| RP-02 | Ringkasan per ujian: jumlah peserta, selesai, terkunci, pelanggaran terbanyak |
| RP-03 | Tanda **"perlu ditinjau"** bila melewati ambang (bawaan ≥2 pelanggaran atau ≥1 kunci); bukan vonis otomatis |
| RP-04 | Ekspor CSV (ringkasan dan kejadian) |
| RP-05 | Laporan tersedia setelah ujian berstatus Selesai (peserta aktif tidak dipantau langsung di MVP) |

### 5.7 Data & Privasi

| ID | Kebutuhan |
| --- | --- |
| DP-01 | Data minimal: nama, ID/kelas opsional, log kejadian, ringkasan perangkat; tanpa kamera, tanpa lokasi |
| DP-02 | Retensi bawaan **180 hari** (bisa diatur), lalu dihapus otomatis oleh job terjadwal |
| DP-03 | Penyelenggara dapat menghapus ujian beserta datanya kapan saja |
| DP-04 | Syarat penggunaan menyatakan persetujuan peserta (termasuk orang tua/wali bila anak) menjadi tanggung jawab penyelenggara; halaman persetujuan tampil sebelum Mulai |
| DP-05 | Pemisahan data antar penyelenggara lewat *Row Level Security* (setiap tabel punya `organizer_id`) |

---

## 6. Model Data (Ringkas)

`organizers` · `exams` (organizer_id, form_url, code, token_hash, opens_at, closes_at, duration_min, tolerance, wm_opacity, status) · `participants` (exam_id, name, ref_id, individual_token_hash, device_id, locked_name) · `sessions` (participant_id, started_at, ends_at, status, violation_count, locked) · `events` (session_id, type, at, meta) · `unlock_requests` (session_id, lock_id, code_hash, expires_at, used_by) · `supervisors` (exam_id, user_id)

---

## 7. Teknologi

| Lapisan | Pilihan |
| --- | --- |
| Frontend | Vue 3 + Vite + TypeScript, Pinia, Vue Router |
| UI | Tailwind CSS + PrimeVue |
| Backend | Supabase: Postgres, Auth (penyelenggara/pengawas), RLS, Edge Functions |
| Edge Functions | `join-exam`, `start-session`, `heartbeat`, `log-event`, `request-unlock`, `issue-unlock-code`, `redeem-unlock`, `purge-expired` |
| Hosting | Vercel / Netlify / Cloudflare Pages |
| Observabilitas | Sentry + backup database otomatis |

Peserta tidak punya akun Supabase; Edge Function memvalidasi token lalu menerbitkan sesi sementara berumur pendek.

---

## 8. Non-Fungsional

- **Skala:** 200 peserta bersamaan per ujian; target awal 1.000 peserta bersamaan lintas ujian.
- **Performa:** halaman ujian termuat \<3 detik di 3G cepat; pencatatan event tidak memblokir UI (antrean lokal bila offline).
- **Keamanan:** HTTPS, token ter-hash, rate limit, validasi semua aksi di server, tanpa rahasia di klien.
- **Kompatibilitas:** Chrome/Edge/Firefox/Safari 2 versi terakhir; Android Chrome; iPhone Safari (mode terbatas).
- **Aksesibilitas:** kontras memadai, teks watermark tidak mengganggu pembaca layar, ukuran sentuh ≥44px.

---

## 9. Panduan Gaya Visual (Neo-Brutalism)

**Referensi:** gaya situs Programmer Zaman Now (dari screenshot beranda). Gaya ini dikenal sebagai *neo-brutalism*: garis hitam tebal, bayangan keras tanpa blur, warna datar yang kontras, dan huruf kapital besar. Yang ditiru hanya **gayanya**; logo, ilustrasi, dan teks situs rujukan tidak dipakai. Kode warna di bawah adalah perkiraan dari screenshot; finalkan dengan color picker.

### 9.1 Warna

| Token | Perkiraan | Pemakaian |
| --- | --- | --- |
| `cream` | `#F0EEE3` | Latar halaman (dengan pola titik halus) |
| `ink` | `#0A0A0A` | Teks utama, garis, bayangan, blok hitam |
| `ink-soft` | `#4A4A4A` | Teks isi/paragraf |
| `blue` | `#2B2BE0` | Tombol utama, kata penekanan, fokus |
| `lime` | `#D9F94A` | Badge, label, aksen di atas blok hitam |
| `white` | `#FFFFFF` | Tombol sekunder, kartu |
| `danger` | `#E5322D` | Pelanggaran, kesalahan (tambahan kita) |
| `ok` | `#1FA463` | Sukses, selesai (tambahan kita) |

### 9.2 Tipografi

- **Judul:** grotesque tebal, **huruf kapital**, jarak rapat (usulan Google Fonts: *Archivo* berat 800–900). Boleh satu baris bergaya garis tepi (*outline*) dan satu kata berwarna biru, **hanya di halaman depan**.
- **Label, angka, badge:** monospace kapital dengan jarak huruf lebar (usulan: *JetBrains Mono*).
- **Isi teks:** sans-serif biasa (usulan: *Inter*), ukuran minimal 16px.

### 9.3 Komponen

| Komponen | Aturan |
| --- | --- |
| Garis | Hitam `3px` (HP: `2px`); sudut tajam (`radius 0`) |
| Bayangan | Offset keras `4px 4px 0 ink`, tanpa blur (HP: `3px`) |
| Tombol utama | Latar biru, teks putih kapital, border + bayangan hitam |
| Tombol sekunder | Latar putih, teks hitam kapital, border + bayangan hitam |
| Interaksi tombol | *Hover*: geser 2px dan bayangan mengecil; *active*: bayangan hilang; fokus: cincin biru tebal |
| Badge | Kotak `lime`, border hitam, teks mono kapital, titik bulat di kiri |
| Navbar | Garis bawah hitam tebal; logo kiri; menu kapital kecil; tombol "Masuk" biru |
| Kartu statistik | Kotak dengan pemisah horizontal tebal; angka mono besar, label mono kecil di kanan |
| Blok informasi | Latar `ink` penuh, teks putih, label `lime` |
| Input | Border hitam tebal, latar putih, label mono kapital di atas, pesan galat merah |
| Tabel | Border tebal, header `ink` teks putih, baris berselang-seling krem/putih |
| Chip status ujian | Draf = abu, Terjadwal = biru, Berlangsung = `lime`, Selesai = hitam teks putih |

### 9.4 Penerapan per Halaman

- **Halaman depan penyelenggara:** judul besar (satu kata biru, satu baris outline), dua tombol (Mulai, Lihat cara kerja), panel kanan berisi poin keunggulan bergaya kartu statistik (token, kunci nama, watermark, laporan).
- **Halaman peserta (kode → token → nama):** satu kartu besar di tengah, satu langkah per layar, input dan tombol berukuran besar.
- **Halaman ujian:** tampilan paling sederhana. Bilah atas tipis (nama, timer mono, status), form memenuhi layar, watermark di atasnya. **Tanpa outline text, tanpa animasi, tanpa dekorasi** agar soal terbaca.
- **Peringatan pelanggaran:** kotak `lime` dengan border hitam. **Layar terkunci:** blok `ink` penuh, **ID kunci** besar bergaya mono warna `lime`, tombol "Masukkan kode buka". **Waktu habis:** blok `ink` penuh.
- **Dasbor penyelenggara & pengawas:** tabel dan chip status sesuai 9.3; tombol aksi utama selalu biru.

### 9.5 Aksesibilitas & Responsif

- Kontras hitam di atas krem sangat tinggi; teks isi `ink-soft` diuji ≥ 4.5:1.
- Ukuran sentuh ≥ 44px; garis dan bayangan mengecil di layar kecil.
- Hormati `prefers-reduced-motion`; mode gelap tidak termasuk MVP.
- Watermark (bagian 5.5) diuji terbaca di atas semua warna latar form.

### 9.6 Implementasi (Tailwind + PrimeVue)

- Token di `tailwind.config`: warna (tabel 9.1), `boxShadow.brutal = 4px 4px 0 0 #0A0A0A`, `borderWidth.DEFAULT = 3px`, `fontFamily` (judul, mono, isi).
- Buat komponen dasar sendiri (`BrButton`, `BrBadge`, `BrCard`, `BrInput`, `BrChip`) dengan Tailwind. Untuk komponen rumit (tabel data, dialog, dropdown) pakai PrimeVue dalam **mode unstyled** dengan kelas Tailwind agar gayanya seragam.
- Semua halaman wajib memakai token dan komponen ini; tidak ada warna atau bayangan yang ditulis langsung.

---

## 10. Metrik Keberhasilan

| Metrik | Target MVP |
| --- | --- |
| Peserta berhasil masuk dan mulai tanpa bantuan | ≥ 95% |
| Ujian pilot selesai tanpa gangguan sistem | ≥ 99% sesi |
| Form yang lolos *Uji tampil* | ≥ 90% (Google Form & Tally) |
| Laporan dianggap berguna oleh penyelenggara (survei pilot) | ≥ 4/5 |

---

## 11. Risiko

| Risiko | Mitigasi |
| --- | --- |
| Penyelenggara mengira copy-paste di form terkunci | Peringatan jelas di pengaturan ujian dan panduan |
| Pelanggaran palsu (telepon masuk, notifikasi) | Toleransi bawaan 1 kali, tanda "perlu ditinjau" bukan vonis |
| Peserta memilih nama orang lain | Nama terkunci per perangkat, token individual opsional, watermark |
| Link form bocor | Panduan: gunakan form tertutup/berbatas waktu bila tersedia |
| Pengawas tidak ada di ujian rumah | Pengawas bisa daring (chat/telepon) memberi kode buka |
| Data anak | Data minimal, retensi 180 hari, tanggung jawab persetujuan di penyelenggara; konfirmasi kebijakan ke penasihat hukum |
| Form provider mengubah aturan embed | *Uji tampil* wajib sebelum ujian; pesan kesalahan jelas |

---

## 12. Tiket MVP (urut kerja, untuk AI agent / programmer junior)

Aturan umum: satu tiket = satu pull request kecil; tiap tiket wajib punya tes sederhana; jangan mengerjakan tiket berikutnya sebelum kriteria selesai terpenuhi.

| # | Tiket | Instruksi inti | Selesai bila |
| --- | --- | --- | --- |
| T00 | Design system | Token Tailwind, font, komponen dasar `Br*`, wrapper PrimeVue unstyled, halaman `/styleguide` (bagian 9) | `/styleguide` menampilkan semua komponen dan warna; kontras teks lolos 4.5:1 |
| T01 | Setup proyek | Vue 3 + Vite + TS, Tailwind, PrimeVue (kerjakan T01 dulu, lalu T00), Router, Pinia, ESLint, deploy ke hosting | Halaman kosong termuat di URL publik |
| T02 | Setup Supabase | Buat proyek, skema tabel (bagian 6), RLS per `organizer_id` | Penyelenggara A tidak bisa membaca data B (tes) |
| T03 | Login penyelenggara | Supabase Auth (Google + email), rute terproteksi | Login/logout berfungsi, rute `/dashboard` terkunci |
| T04 | CRUD ujian | Form ujian (EX-01, EX-06), daftar ujian | Ujian bisa dibuat, diubah, dihapus; batas 5 ujian aktif berlaku |
| T05 | Normalisasi link + Uji tampil | EX-03, EX-04 | Link Google Form dan Tally tampil di pratinjau; link gagal memberi pesan jelas |
| T06 | Daftar peserta | PA-01: input manual + tempel Excel/CSV, batas 200 | 200 nama bisa diimpor; baris duplikat ditandai |
| T07 | Token | PA-02, PA-04: token per ujian + opsi individual (unduh CSV) | Token tersimpan ter-hash; percobaan salah >5 kali diblokir sementara |
| T08 | Join ujian | Edge Function `join-exam`: kode + token → daftar nama tersedia | Nama terkunci tidak muncul |
| T09 | Pilih nama + kunci perangkat | PA-03, PA-05 | Nama yang sama tidak bisa dipilih dari perangkat lain |
| T10 | Halaman aturan & persetujuan | DP-04 | Tombol Mulai aktif hanya setelah persetujuan dicentang |
| T11 | Mulai sesi + timer | SE-01, SE-02 (server time) | Timer tetap benar setelah muat ulang; waktu habis menutup form |
| T12 | Halaman ujian + iframe + fullscreen | SE-03, status tanpa fullscreen | Android Chrome masuk fullscreen; iPhone tampil pemberitahuan dan tercatat |
| T13 | Heartbeat & koneksi putus | SE-05, SE-06 | Matikan jaringan 1 menit → event "koneksi putus" tercatat; masuk ulang melanjutkan timer |
| T14 | Pencatat event | PV-01, PV-02 via `log-event`; antrean offline | Pindah tab/keluar fullscreen tercatat; copy/paste di pembungkus diblokir dan dicatat |
| T15 | Aturan toleransi & kunci | PV-03, PV-04, PV-07 | Pelanggaran ke-(toleransi+1) mengunci; muat ulang tetap terkunci |
| T16 | Alur buka kunci | PV-05, PV-06; halaman pengawas | Kode sekali pakai, kedaluwarsa 10 menit, tidak bisa dipakai dua kali |
| T17 | Watermark | WM-01..04 | Watermark tampak di screenshot; menghapus elemen via DevTools tercatat dan terpasang ulang |
| T18 | Tombol selesai | SE-04 | Dialog konfirmasi, status `selesai` tercatat |
| T19 | Peran pengawas | Undangan pengawas per ujian; halaman pengawas | Pengawas hanya melihat ujian yang diundangkan |
| T20 | Laporan | RP-01..05 + ekspor CSV | Laporan sesuai kejadian uji; tanda "perlu ditinjau" muncul sesuai ambang |
| T21 | Retensi & hapus data | DP-02, DP-03 (`purge-expired`) | Data lewat 180 hari terhapus; hapus ujian menghapus semua turunan |
| T22 | Panduan penyelenggara + Sentry + backup | EX-05, pelacak error, backup | Halaman panduan tampil; error uji muncul di Sentry |
| T23 | Uji pilot | 1 ujian nyata, ±30 peserta (Android, iPhone, laptop) | Daftar bug dicatat dan diprioritaskan |

---

## 13. Setelah MVP (Fase 2+)

Pembuat soal bawaan (kunci copy-paste penuh, acak soal, autosave), dashboard pemantauan langsung, bahasa Inggris, paket berbayar, dan integrasi LMS.