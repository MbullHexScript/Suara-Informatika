# ============================================
# SUARA INFORMATIKA - TEST API SCRIPTS
# Jalankan: powershell -ExecutionPolicy Bypass -File test-api.ps1
# ============================================

$BASE = "https://suarainformatika.vercel.app"

Write-Host "=== HEALTH CHECK ===" -ForegroundColor Green
curl -s "$BASE/api/health"

Write-Host "`n=== TEST LAPORAN KELUHAN ===" -ForegroundColor Green
$bodyKeluhan = @{
    type = "keluhan"
    target = "jurusan"
    category = "Akademik"
    title = "Test Keluhan dari Script"
    description = "Test notifikasi keluhan via PowerShell script"
    attachments = @()
} | ConvertTo-Json -Depth 5

curl -s -X POST "$BASE/api/reports" -H "Content-Type: application/json" -d $bodyKeluhan

Write-Host "`n=== TEST LAPORAN MENTAL HEALTH ===" -ForegroundColor Green
$bodyMental = @{
    type = "mental_health"
    target = $null
    category = "Test User dari Script"
    title = "Konsultasi Mental Health"
    description = "Test notifikasi mental health via PowerShell script"
    contact = "081234567890"
    attachments = @()
} | ConvertTo-Json -Depth 5

curl -s -X POST "$BASE/api/reports" -H "Content-Type: application/json" -d $bodyMental

Write-Host "`n=== TEST LAPORAN ASPIRASI ===" -ForegroundColor Green
$bodyAspirasi = @{
    type = "aspirasi"
    target = "himpunan"
    category = "Kegiatan Kemahasiswaan"
    title = "Test Aspirasi"
    description = "Test notifikasi aspirasi via PowerShell script"
    attachments = @()
} | ConvertTo-Json -Depth 5

curl -s -X POST "$BASE/api/reports" -H "Content-Type: application/json" -d $bodyAspirasi

Write-Host "`n=== SET TELEGRAM WEBHOOK ===" -ForegroundColor Green
$webhookBody = @{
    url = "https://suarainformatika.vercel.app/api/telegram/webhook"
    secret_token = "584a1136889eacf0db1fec43960f663a5baaa8e3c01c3cf13db13983ba874a91"
} | ConvertTo-Json -Depth 5

curl -s -X POST "https://api.telegram.org/bot8602045416:AAF6CK7HA4ClDWb_hvLCXW1V9VofXxJS6ug/setWebhook" `
  -H "Content-Type: application/json" `
  -d $webhookBody

Write-Host "`n=== CEK WEBHOOK INFO ===" -ForegroundColor Green
curl -s "https://api.telegram.org/bot8602045416:AAF6CK7HA4ClDWb_hvLCXW1V9VofXxJS6ug/getWebhookInfo"

Write-Host "`n=== TEST WEBHOOK /help ===" -ForegroundColor Green
$webhookTest = @{
    message = @{
        chat = @{ id = "5721987142" }
        text = "/help"
    }
} | ConvertTo-Json -Depth 5

curl -s -X POST "https://suarainformatika.vercel.app/api/telegram/webhook" `
  -H "Content-Type: application/json" `
  -H "x-telegram-bot-api-secret-token: 584a1136889eacf0db1fec43960f663a5baaa8e3c01c3cf13db13983ba874a91" `
  -d $webhookTest

Write-Host "`n=== DONE ===" -ForegroundColor Green