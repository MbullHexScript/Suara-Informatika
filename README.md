# web-pengaduan — Suara Informatika (Vite + React)

PRD: reuse `web-aspirasi` (form anonim, Supabase, Telegram realtime). Desain: Apple Fluid + Frontend Design (translucent glass, spring 1.0/0.35, GSAP hero, reduced-motion).

## Stack
Vite React-TS, Tailwind 4, Framer Motion, GSAP, react-router-dom, Supabase, papaparse, shadcn primitives, lucide.

## Env
Copy `.env.example` → `.env` (sudah ada, copy dari web-aspirasi). Butuh:
```
VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_SUPABASE_SERVICE_ROLE_KEY
TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN_CHAT_ID, TELEGRAM_WEBHOOK_SECRET
VITE_TELEGRAM_BOT_TOKEN, VITE_TELEGRAM_ADMIN_CHAT_ID, VITE_APP_URL, PORT
```

## Dev
```bash
npm install
# terminal 1
npm run dev          # vite 5173
# terminal 2
npm run dev:server   # express 3001 — proxy /api, webhook, upload, CSV
```
Vite proxy `/api` → `http://localhost:3001` (lihat vite.config.ts).

## Build
```bash
npm run build   # tsc -b && vite build → dist/
```

## Supabase
Jalankan `supabase/migrations/001_initial.sql` (enum + reports table + RLS). Bucket `report-attachments` (private) + policy anon INSERT, authenticated SELECT.

## Telegram webhook
Setelah deploy:
```
https://api.telegram.org/bot<TOKEN>/setWebhook?url=<DOMAIN>/api/telegram/webhook&secret_token=<SECRET>
```
Commands: `/laporan_hari_ini` `/laporan_minggu_ini` `/laporan_bulan_ini` `/statistik` `/help` (juga via keyboard 📅🗓📆📊). Whitelist `TELEGRAM_ADMIN_CHAT_ID`.

## Deploy (akan dilanjut)
Tahap deploy ke GitHub → Vercel + penentuan domain — pending arahanmu.
