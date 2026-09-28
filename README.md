# Suara Informatika

Ruang Keluhan, Aspirasi, dan konsultasi Mental Health mahasiswa Informatika.
React + TypeScript + Vite, Supabase, serta bot Telegram berbasis undangan.

## Menjalankan lokal

```sh
npm install
npm run dev:all
```

Salin `.env.example` menjadi `.env`, lalu isi kredensial project. Frontend hanya
menggunakan URL/key publik Supabase; service key dan token Telegram hanya di server.
`npm run dev:all` menjalankan Vite dan API Express; keduanya menggunakan handler
backend yang sama dengan deployment Vercel.

## Verifikasi

```sh
npm test
npm run lint
npm run build
```

## Aktivasi production

Domain: **https://suarainformatika.vercel.app**

Baca [panduan operasi](docs/OPERATIONS.md) untuk migrasi Supabase, bootstrap
pemilik bot/admin web, environment Vercel, webhook, token anggota, dan retry
notifikasi. Perintah siap salin untuk Windows ada di [`cs.txt`](cs.txt).

```sh
node scripts/ops.mjs prepare
node scripts/ops.mjs diagnose
node scripts/ops.mjs migrate
node scripts/ops.mjs bootstrap
# Import .env.vercel ke Vercel dan deploy kode terbaru, kemudian:
node scripts/ops.mjs webhook
```

Build lokal yang lulus belum berarti production aktif. Database harus Active,
migrasi dan bootstrap sudah diterapkan, environment benar, serta webhook terpasang.
