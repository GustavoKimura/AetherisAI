$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "Aetheris AI - Core Service"

$ports = @(8000, 5173)
foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    foreach ($conn in $connections) {
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
    }
}

$env:PYTHONDONTWRITEBYTECODE = "1"
$root = $PSScriptRoot

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "         Iniciando Aetheris AI            " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$frontendDir = Join-Path $root "frontend"
$nodeModules = Join-Path $frontendDir "node_modules"

if (-not (Test-Path $nodeModules)) {
    Write-Host "[SETUP] node_modules ausente. Instalando dependencias do frontend..." -ForegroundColor Yellow
    Push-Location $frontendDir
    npm install
    Pop-Location
}

$venvPython = Join-Path $root "venv\Scripts\python.exe"
$pythonCmd = if (Test-Path $venvPython) { $venvPython } else { "python" }

$backendDir = Join-Path $root "backend"
Write-Host "[1/2] Iniciando Backend em background..." -ForegroundColor Yellow

$backendProc = Start-Process -FilePath $pythonCmd -ArgumentList "-m uvicorn app.main:app --host 0.0.0.0 --port 8000 --log-level error" -WorkingDirectory $backendDir -NoNewWindow -PassThru

if ($backendProc) {
    try {
        $backendProc.PriorityClass = [System.Diagnostics.ProcessPriorityClass]::High
    } catch {}
}

Start-Sleep -Seconds 3

Write-Host "[2/2] Iniciando Frontend (Vite) no terminal ativo..." -ForegroundColor Green
Write-Host "Acesse: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Pressione CTRL+C para encerrar ambos os servicos." -ForegroundColor DarkGray
Write-Host "==========================================" -ForegroundColor Cyan

Push-Location $frontendDir
try {
    npm run dev -- --host 0.0.0.0 --port 5173
}
finally {
    Pop-Location
    Write-Host "`n[ENCERRANDO] Finalizando processos do Aetheris..." -ForegroundColor Yellow
    if ($backendProc -and -not $backendProc.HasExited) {
        Stop-Process -Id $backendProc.Id -Force -ErrorAction SilentlyContinue
    }
    foreach ($port in $ports) {
        $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
        foreach ($conn in $connections) {
            Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
        }
    }
    Write-Host "[OK] Todos os servicos foram finalizados com seguranca." -ForegroundColor Green
}