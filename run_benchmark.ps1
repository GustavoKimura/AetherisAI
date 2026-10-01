$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$root = $PSScriptRoot
$venvPython = Join-Path $root "venv\Scripts\python.exe"
$pythonCmd = if (Test-Path $venvPython) { $venvPython } else { "python" }

$benchmarkScript = Join-Path $root "backend\benchmark_models.py"

& $pythonCmd $benchmarkScript