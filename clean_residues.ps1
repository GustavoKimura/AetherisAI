$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$ports = @(8000, 5173)
foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    foreach ($conn in $connections) {
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
    }
}

$root = $PSScriptRoot
$dataDir = Join-Path $root "backend\data"
$dbFile = Join-Path $dataDir "aetheris.db"
$logsDir = Join-Path $dataDir "logs"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   Aetheris AI - Limpeza Total de Dados   " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

if (Test-Path $dbFile) {
    Remove-Item -Path $dbFile -Force
    Write-Host "[OK] Base de conversas aetheris.db removida." -ForegroundColor Green
}

if (Test-Path $logsDir) {
    Get-ChildItem -Path $logsDir -Filter "*.log" | ForEach-Object {
        Remove-Item -Path $_.FullName -Force
    }
    Write-Host "[OK] Todos os logs de auditoria foram expurgados." -ForegroundColor Green
}

$venvPython = Join-Path $root "venv\Scripts\python.exe"
$pythonCmd = if (Test-Path $venvPython) { $venvPython } else { "python" }

& $pythonCmd -c "from app.services.db_service import init_db; init_db()"

Write-Host "[OK] Banco de dados limpo e reinicializado do zero." -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan