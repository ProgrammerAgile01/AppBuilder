# setup_backend.ps1

# 1) composer install (sekali saja jika vendor belum ada)
if (-not (Test-Path "vendor\autoload.php")) {
  composer install --no-interaction --prefer-dist
}

# 2) dump-autoload
composer dump-autoload

# 3) key:generate (jika APP_KEY belum ada)
if (Test-Path ".env") {
  $envContent = Get-Content ".env" -Raw
  if ($envContent -notmatch '^APP_KEY=.+') {
    php artisan key:generate --force
  }
}

# 4) storage:link (jika symlink belum ada)
if (-not (Test-Path "public\storage")) {
  php artisan storage:link | Out-Null
}

# 5) migrate (opsional) — aktifkan bila mau
php artisan migrate

Write-Host "Backend setup selesai."