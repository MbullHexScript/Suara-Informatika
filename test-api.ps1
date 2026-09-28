param([switch]$Send)
$ErrorActionPreference = 'Stop'
Push-Location $PSScriptRoot
try {
  if ($Send) { node scripts/ops.mjs smoke --send }
  else { node scripts/ops.mjs diagnose }
  if ($LASTEXITCODE -ne 0) { throw 'Pemeriksaan gagal. Lihat hasil di atas.' }
} finally { Pop-Location }
