# Script pour lancer le projet (Backend Flask + Frontend React)

Write-Host "Demarrage du projet..." -ForegroundColor Cyan

# Verifier si Python est installe
Write-Host "`nVerification de Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Python detecte: $pythonVersion" -ForegroundColor Green
}
catch {
    Write-Host "Python n'est pas installe ou n'est pas dans le PATH" -ForegroundColor Red
    exit 1
}

# Verifier si Node.js est installe
Write-Host "`nVerification de Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "Node.js detecte: $nodeVersion" -ForegroundColor Green
}
catch {
    Write-Host "Node.js n'est pas installe ou n'est pas dans le PATH" -ForegroundColor Red
    exit 1
}

# Installation des dependances backend si necessaire
Write-Host "`nInstallation des dependances backend..." -ForegroundColor Yellow
if (Test-Path "backend/venv") {
    Write-Host "Environnement virtuel existant detecte" -ForegroundColor Green
}
else {
    Write-Host "Creation de l'environnement virtuel..." -ForegroundColor Cyan
    python -m venv backend/venv
}

# Activer l'environnement virtuel et installer les dependances
Write-Host "Installation des packages Python..." -ForegroundColor Cyan
& backend/venv/Scripts/python.exe -m pip install --upgrade pip --quiet
& backend/venv/Scripts/python.exe -m pip install -r backend/requirements.txt --quiet

# Installation des dependances frontend si necessaire
Write-Host "`nInstallation des dependances frontend..." -ForegroundColor Yellow
if (Test-Path "frontend/node_modules") {
    Write-Host "node_modules existant detecte" -ForegroundColor Green
}
else {
    Write-Host "Installation des packages npm..." -ForegroundColor Cyan
    Set-Location frontend
    npm install
    Set-Location ..
}

# Lancer le backend
Write-Host "`nDemarrage du backend Flask (port 5000)..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    & backend/venv/Scripts/python.exe backend/app.py
}

# Attendre un peu pour que le backend demarre
Start-Sleep -Seconds 3

# Lancer le frontend
Write-Host "Demarrage du frontend React (port 3000)..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD/frontend
    npm start
}

Write-Host "`nProjet lance avec succes!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nAppuyez sur Ctrl+C pour arreter les serveurs..." -ForegroundColor Yellow

# Afficher les logs en temps reel
try {
    while ($true) {
        $backendOutput = Receive-Job -Job $backendJob -ErrorAction SilentlyContinue
        $frontendOutput = Receive-Job -Job $frontendJob -ErrorAction SilentlyContinue
        
        if ($backendOutput) {
            Write-Host "[BACKEND] $backendOutput" -ForegroundColor Blue
        }
        if ($frontendOutput) {
            Write-Host "[FRONTEND] $frontendOutput" -ForegroundColor Magenta
        }
        
        Start-Sleep -Milliseconds 500
        
        # Verifier si les jobs sont toujours en cours
        if ($backendJob.State -ne 'Running' -and $frontendJob.State -ne 'Running') {
            break
        }
    }
}
finally {
    Write-Host "`nArret des serveurs..." -ForegroundColor Red
    Stop-Job -Job $backendJob, $frontendJob
    Remove-Job -Job $backendJob, $frontendJob
    Write-Host "Serveurs arretes" -ForegroundColor Green
}
