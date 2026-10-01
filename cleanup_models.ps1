$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$modelsDir = Join-Path $PSScriptRoot "backend\models"

$modelsToDelete = @(
    "DeepSeek-R1-Distill-Qwen-8B-Abliterated.Q4_K_M.gguf",
    "Meta-Llama-3.1-8B-Instruct-abliterated-Q5_K_M.gguf",
    "Mistral-Nemo-Instruct-2407-abliterated.Q4_K_M.gguf",
    "Qwen2.5-7B-Instruct-abliterated-v2.Q4_K_M.gguf"
)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "    Aetheris AI - Limpeza de Modelos      " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

foreach ($file in $modelsToDelete) {
    $targetPath = Join-Path $modelsDir $file
    if (Test-Path $targetPath) {
        Write-Host "[REMOVENDO] $file ..." -ForegroundColor Yellow
        Remove-Item -Path $targetPath -Force
    }
}

Write-Host "`n[OK] Modelos reprovados foram eliminados." -ForegroundColor Green
Write-Host "Modelos definitivos preservados:" -ForegroundColor Cyan
Get-ChildItem -Path $modelsDir -Filter "*.gguf" | ForEach-Object {
    Write-Host "  -> $($_.Name) ($([math]::Round($_.Length / 1GB, 2)) GB)" -ForegroundColor Green
}
Write-Host "==========================================" -ForegroundColor Cyan