param([int]$Port = 5173)
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$taskBundledNode = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
$taskNodeCommand = Get-Command node -ErrorAction SilentlyContinue
$taskNodePath = if (Test-Path -LiteralPath $taskBundledNode) { $taskBundledNode } elseif ($taskNodeCommand) { $taskNodeCommand.Source } else { throw 'Installeer Node.js 24.15 of nieuwer via een toegestane route.' }
if ([version](& $taskNodePath --version).TrimStart('v') -lt [version]'24.15.0') { throw 'Deze demo vereist Node.js 24.15 of nieuwer. Zie README.md.' }
if (!(Test-Path -LiteralPath 'node_modules\vite\bin\vite.js')) { throw 'Installeer eerst de bibliotheken met npm ci. Zie README.md.' }
Write-Host "Open de demo in een eigen browsertab op http://127.0.0.1:$Port/"
Write-Host 'Stoppen: Ctrl+C. Voor een iPad-test is goedgekeurde HTTPS nodig.'
& $taskNodePath 'node_modules/vite/bin/vite.js' --configLoader native --host 127.0.0.1 --port $Port --strictPort
