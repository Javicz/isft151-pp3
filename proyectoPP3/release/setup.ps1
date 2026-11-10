param(
    [switch]$SkipInstall
)

$ErrorActionPreference = "Stop"
$env:NODE_NO_WARNINGS = "1"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

Write-Host "[setup] Node.js version:"
node --version

if (-not $SkipInstall) {
    Write-Host "[setup] Installing dependencies..."
    npm install
}

Write-Host "[setup] Initializing database..."
node release/init-db.mjs

Write-Host "[setup] Environment ready."
