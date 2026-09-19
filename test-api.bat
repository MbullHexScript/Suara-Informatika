@echo off
REM ============================================
REM SUARA INFORMATIKA - TEST API (CMD/BAT version)
REM Jalankan: test-api.bat
REM ============================================

set BASE=https://suarainformatika.vercel.app
set TOKEN=8602045416:AAF6CK7HA4ClDWb_hvLCXW1V9VofXxJS6ug
set SECRET=584a1136889eacf0db1fec43960f663a5baaa8e3c01c3cf13db13983ba874a91
set CHAT_ID=5721987142

echo === HEALTH CHECK ===
curl -s "%BASE%/api/health"

echo.
echo === TEST LAPORAN KELUHAN ===
curl -s -X POST "%BASE%/api/reports" ^
  -H "Content-Type: application/json" ^
  -d "{\"type\":\"keluhan\",\"target\":\"jurusan\",\"category\":\"Akademik\",\"title\":\"Test Keluhan\",\"description\":\"Test via bat\",\"attachments\":[]}"

echo.
echo === TEST LAPORAN MENTAL HEALTH ===
curl -s -X POST "%BASE%/api/reports" ^
  -H "Content-Type: application/json" ^
  -d "{\"type\":\"mental_health\",\"target\":null,\"category\":\"Test User\",\"title\":\"Konsultasi Mental Health\",\"description\":\"Test via bat\",\"contact\":\"081234567890\",\"attachments\":[]}"

echo.
echo === SET WEBHOOK ===
curl -s -X POST "https://api.telegram.org/bot%TOKEN%/setWebhook" ^
  -H "Content-Type: application/json" ^
  -d "{\"url\":\"https://suarainformatika.vercel.app/api/telegram/webhook\",\"secret_token\":\"%SECRET%\"}"

echo.
echo === CEK WEBHOOK INFO ===
curl -s "https://api.telegram.org/bot%TOKEN%/getWebhookInfo"

echo.
echo === TEST WEBHOOK /help ===
curl -s -X POST "%BASE%/api/telegram/webhook" ^
  -H "Content-Type: application/json" ^
  -H "x-telegram-bot-api-secret-token: %SECRET%" ^
  -d "{\"message\":{\"chat\":{\"id\":\"%CHAT_ID%\"},\"text\":\"/help\"}}"

echo.
echo === DONE ===