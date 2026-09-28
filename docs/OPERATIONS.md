# Menjalankan Suara Informatika

Production: https://suarainformatika.vercel.app

## Urutan aktivasi

1. **Resume project Supabase lama** jika Paused. Tunggu sampai Active.
2. Ganti kredensial lama yang pernah masuk Git/chat: service-role/secret key Supabase,
   token bot dari BotFather, serta webhook secret. Penggantian token bot tidak
   mengubah identitas bot atau daftar anggota Telegram.
3. Isi `.env` lokal mengikuti `.env.example`. Gunakan key dari project yang sama
   dengan `SUPABASE_URL`. Jangan menggunakan `VITE_` untuk rahasia backend.
4. `node scripts/ops.mjs prepare` menghasilkan `.env.vercel` untuk import.
   Personal access token Supabase, email bootstrap, dan nomor WA penguji tidak
   ikut diekspor. Jangan commit kedua file environment ini.
5. Isi `SUPABASE_ACCESS_TOKEN` lokal, lalu jalankan `node scripts/ops.mjs migrate`.
   Script menjalankan 002 dan 003 pada project lama; **001 hanya untuk database
   baru**. Migration ledger mendeteksi perubahan isi migrasi yang sudah diterapkan.
6. Buat akun email/password admin di Supabase Authentication bila belum ada.
   Isi `WEB_ADMIN_EMAIL`, `TELEGRAM_OWNER_ID` (User ID pribadi positif), dan
   `TELEGRAM_ADMIN_CHAT_ID` (chat admin lama). Jalankan
   `node scripts/ops.mjs bootstrap` untuk mendaftarkan aksesnya.
7. Import `.env.vercel` ke environment Production Vercel. Hapus variabel lama
   `VITE_SUPABASE_SERVICE_ROLE_KEY` dan `VITE_TELEGRAM_BOT_TOKEN`. Pastikan
   URL/key lama yang konflik tidak tertinggal. Deploy **kode terbaru**.
8. `node scripts/ops.mjs webhook`, lalu buka bot dan kirim `/start` dari akun
   pemilik. Semua pesan bot diproses lewat webhook dengan secret header.
9. `node scripts/ops.mjs diagnose` memeriksa koneksi tanpa mengirim laporan.

SQL dapat dijalankan manual melalui SQL Editor jika akses management tidak
tersedia. Jalankan 002 hingga selesai, baru 003 (enum PostgreSQL baru memerlukan
commit). Bootstrap perlu mendaftarkan UUID akun admin ke `web_admins` dan akun
pemilik ke `bot_members` dengan role `owner`. Script adalah jalur yang disarankan.

## Token anggota

- Pemilik: `/undang` membuat token 7 hari, `/undangan` menampilkan ID undangan,
  `/batal ID_UNDANGAN` membatalkan yang belum dipakai.
- Anggota: chat pribadi bot → `/start` → masukkan token `SI-…`.
- Token diikat ke Telegram **User ID**, bukan username. Database menyimpan SHA-256,
  mengunci undangan saat ditukarkan, dan membatasi percobaan 5 per 15 menit.
- Semua anggota aktif memiliki akses Aspirasi dan Mental Health. Mereka menerima
  pemberitahuan ke chat pribadi. Token tidak memberikan login dashboard web;
  dashboard memakai akun Supabase Auth yang terdaftar di `web_admins`.
- `/anggota` dan `/cabut USER_ID` hanya untuk pemilik. Akses diperiksa lagi saat
  menekan tombol lama. Token yang sudah dipakai tetap tidak dapat dipakai ulang.
- `/catatan TIKET isi catatan` atau tombol Tambah Catatan → balas pesan bot.
- Statistik mencakup jenis lama (kritik/saran), aspirasi, dan Mental Health.

## Pengiriman notifikasi

Trigger PostgreSQL membuat `notification_jobs` dalam transaksi yang sama dengan
laporan. Penerima adalah anggota aktif + chat admin lama, dideduplikasi per chat.
API mencoba mengirim 12 job segera, empat paralel. Semua pemanggilan Telegram
mempunyai timeout. Respons berhasil ke mahasiswa hanya bergantung pada laporan
yang tersimpan, bukan keberhasilan Telegram.

Retry sementara memakai backoff, maksimal 8 percobaan. HTTP 400/403 menjadi
`failed` agar token/recipient yang salah atau bot diblokir tidak dicoba selamanya.
Job `sending` yang ditinggalkan proses dapat diambil ulang setelah 2 menit.
Lease token mencegah worker lama menimpa hasil worker baru.

Vercel Cron bawaan: **harian pukul 00:00 UTC**, kompatibel dengan Hobby. Untuk
retry cepat dan tim >12 penerima, gunakan scheduler eksternal atau Vercel Pro
setiap menit ke `/api/telegram/retry`, header `Authorization: Bearer CRON_SECRET`.
Tanpa scheduler cepat, anggota yang belum terkirim dapat menunggu sampai
cron harian atau `/ulang_notifikasi` dijalankan pemilik.

Telegram tidak menyediakan kunci idempotensi untuk sendMessage. Jika Telegram
sudah menerima pesan tetapi koneksi putus sebelum respons dicatat, retry bisa
menghasilkan duplikat. Pengiriman bersifat **at-least-once**, bukan exactly-once.
Nomor tiket pada pesan membantu mengenali laporan yang sama.

Setelah memperbaiki penyebab job failed, operator dapat mengembalikannya ke
pending melalui SQL Editor (pilih ID job yang telah diperiksa):

```sql
update public.notification_jobs
set state='pending', attempts=0, next_attempt_at=now(), last_error=null
where id = 123 and state='failed'; -- ganti 123 dengan ID job yang benar
```

## Privasi dan penyimpanan

- Keluhan/Aspirasi menyimpan tanpa nama atau WhatsApp. Mental Health memiliki
  `name` tersendiri dan `contact` ternormalisasi untuk tindak lanjut tim.
- Detail laporan hanya untuk admin web atau anggota bot yang aktif.
- Tracking publik hanya mengembalikan metadata/status; nama lama yang pernah
  disimpan sebagai kategori Mental Health juga disamarkan.
- Bucket lampiran private. Form mengirim object path; detail admin mendapatkan
  signed URL 15 menit. Telegram menyediakan tautan dashboard untuk lampiran.
- Upload maksimal 4 MB, disesuaikan dengan batas payload fungsi Vercel.
- Log bot menyimpan aktor, aksi, target, dan waktu; tidak menyimpan isi token.
- Cabut key yang sudah terpapar di riwayat Git; membersihkan file versi sekarang
  tidak menghapusnya dari commit lama. Rewriting history perlu koordinasi terpisah.

## Pemeriksaan

```text
npm test
npm run lint
npm run build
npm run dev:all
```

Tes database menggunakan mesin PostgreSQL PGlite lokal, **bukan** Supabase
production. Pemeriksaan UI browser memakai respons API mock. Untuk uji nyata,
isi TEST_WHATSAPP milik penguji lalu jalankan `node scripts/ops.mjs smoke --send`.
Perintah ini membuat 3 laporan berlabel `[UJI SISTEM]` dan mengirim notifikasi
nyata ke semua anggota aktif. Script mencetak ID laporan; bersihkan hanya laporan
uji tersebut setelah pemeriksaan melalui Supabase Dashboard.

`/api/health` menunjukkan proses hidup. Itu bukan verifikasi kredensial/database.
Forbidden ketika webhook dipanggil tanpa secret header adalah perilaku normal.
