param(
  [string]$ApiUrl = "http://localhost:8000/api",  # sesuaikan jika perlu
  [switch]$Build
)

function Write-Step($msg) { Write-Host "› $msg" -ForegroundColor Cyan }
function Write-Ok($msg)   { Write-Host "✔ $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "⚠ $msg" -ForegroundColor Yellow }

# cek node/npm
try { node -v | Out-Null; npm -v | Out-Null } catch {
  Write-Warn "Node.js / npm tidak terdeteksi."
  exit 1
}

# 1) .env.local
if (-not (Test-Path ".env.local")) {
  "NEXT_PUBLIC_API_URL=$ApiUrl" | Out-File -FilePath ".env.local" -Encoding utf8 -NoNewline
  Write-Ok ".env.local dibuat (NEXT_PUBLIC_API_URL=$ApiUrl)"
} else {
  Write-Ok ".env.local sudah ada — tidak diubah"
}

# 2) npm install
if (-not (Test-Path "node_modules")) {
  Write-Step "Menjalankan npm install"
  npm install --legacy-peer-deps
  if ($LASTEXITCODE -ne 0) { throw "npm install gagal" }
  Write-Ok "npm install selesai"
} else {
  Write-Ok "node_modules sudah ada — skip"
}

# 3) build (opsional)
if ($Build) {
  npm run build
  if ($LASTEXITCODE -ne 0) { throw "npm run build gagal" }
  Write-Ok "Build selesai"
}

Write-Ok "Frontend setup selesai."
Write-Host "Jalankan dev server: npm run dev"
