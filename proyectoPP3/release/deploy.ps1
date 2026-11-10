param(
    [string]$DeployDir = "",
    [switch]$SkipTests,
    [switch]$Start,
    [switch]$NoStart
)

$ErrorActionPreference = "Stop"
$env:NODE_NO_WARNINGS = "1"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

Write-Host "[deploy] Preparing environment..."
& "$PSScriptRoot\setup.ps1"

if (-not $SkipTests) {
    Write-Host "[deploy] Running tests..."
    node --test testing/unit/*.test.js testing/integration/*.test.js
    if ($LASTEXITCODE -ne 0) {
        throw "Tests failed. Deployment aborted."
    }
}

if ($DeployDir -eq "") {
    $DeployDir = Join-Path $ProjectRoot "dist"
}
$DeployDir = [System.IO.Path]::GetFullPath($DeployDir)
$ProjectRootFull = [System.IO.Path]::GetFullPath($ProjectRoot)

if ($DeployDir -eq $ProjectRootFull -or $DeployDir -eq [System.IO.Path]::GetFullPath($PSScriptRoot)) {
    throw "Invalid deployment directory: $DeployDir"
}

Write-Host "[deploy] Building production directory: $DeployDir"
if (Test-Path $DeployDir) {
    Remove-Item -Recurse -Force $DeployDir
}
New-Item -ItemType Directory -Force -Path $DeployDir | Out-Null

Copy-Item (Join-Path $ProjectRoot "backend") $DeployDir -Recurse
Copy-Item (Join-Path $ProjectRoot "frontend") $DeployDir -Recurse
Copy-Item (Join-Path $ProjectRoot "package.json") $DeployDir
if (Test-Path (Join-Path $ProjectRoot "package-lock.json")) {
    Copy-Item (Join-Path $ProjectRoot "package-lock.json") $DeployDir
}

$ReleaseTarget = Join-Path $DeployDir "release"
New-Item -ItemType Directory -Force -Path $ReleaseTarget | Out-Null
Copy-Item (Join-Path $PSScriptRoot "init-db.mjs") $ReleaseTarget
Copy-Item (Join-Path $PSScriptRoot "serve-frontend.mjs") $ReleaseTarget

Push-Location $DeployDir
try {
    Write-Host "[deploy] Installing production dependencies..."
    npm install --omit=dev

    Write-Host "[deploy] Initializing production database..."
    node release/init-db.mjs
}
finally {
    Pop-Location
}

if ($Start -and -not $NoStart) {
    Write-Host "[deploy] Starting server..."
    Start-Process -FilePath "node" -ArgumentList "backend/server/main.mjs" -WorkingDirectory $DeployDir
    Write-Host "[deploy] Server started from $DeployDir"
} else {
    Write-Host "[deploy] Deployment ready. Nothing was started."
    Write-Host "[deploy] Start it with: cd `"$DeployDir`"; node backend/server/main.mjs"
}

Write-Host "[deploy] Serve the frontend with Apache or another static server from: $DeployDir\frontend"
