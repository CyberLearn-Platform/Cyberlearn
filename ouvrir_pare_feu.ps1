# Script pour ouvrir le pare-feu Windows pour CyberForge
# IMPORTANT : Exécutez ce script en tant qu'ADMINISTRATEUR

Write-Host "🔓 Configuration du Pare-feu Windows pour CyberForge" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier les droits administrateur
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ ERREUR : Ce script doit être exécuté en tant qu'ADMINISTRATEUR" -ForegroundColor Red
    Write-Host ""
    Write-Host "Pour l'exécuter en tant qu'admin :" -ForegroundColor Yellow
    Write-Host "1. Clic droit sur PowerShell" -ForegroundColor Yellow
    Write-Host "2. Sélectionnez 'Exécuter en tant qu'administrateur'" -ForegroundColor Yellow
    Write-Host "3. Relancez ce script" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Appuyez sur Entrée pour quitter"
    exit
}

Write-Host "✅ Droits administrateur confirmés" -ForegroundColor Green
Write-Host ""

# Supprimer les règles existantes si elles existent
Write-Host "🗑️  Suppression des anciennes règles..." -ForegroundColor Yellow
Remove-NetFirewallRule -DisplayName "CyberForge Backend" -ErrorAction SilentlyContinue
Remove-NetFirewallRule -DisplayName "CyberForge Frontend" -ErrorAction SilentlyContinue
Write-Host "✅ Anciennes règles supprimées" -ForegroundColor Green
Write-Host ""

# Créer la règle pour le port 5000 (Backend)
Write-Host "🔧 Création de la règle pour le Backend (port 5000)..." -ForegroundColor Yellow
New-NetFirewallRule -DisplayName "CyberForge Backend" `
                     -Direction Inbound `
                     -LocalPort 5000 `
                     -Protocol TCP `
                     -Action Allow `
                     -Profile Any `
                     -Enabled True | Out-Null
Write-Host "✅ Port 5000 ouvert (Backend)" -ForegroundColor Green
Write-Host ""

# Créer la règle pour le port 3000 (Frontend)
Write-Host "🔧 Création de la règle pour le Frontend (port 3000)..." -ForegroundColor Yellow
New-NetFirewallRule -DisplayName "CyberForge Frontend" `
                     -Direction Inbound `
                     -LocalPort 3000 `
                     -Protocol TCP `
                     -Action Allow `
                     -Profile Any `
                     -Enabled True | Out-Null
Write-Host "✅ Port 3000 ouvert (Frontend)" -ForegroundColor Green
Write-Host ""

# Afficher les règles créées
Write-Host "📋 Règles de pare-feu créées :" -ForegroundColor Cyan
Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*CyberForge*"} | Select-Object DisplayName, Enabled, Direction | Format-Table
Write-Host ""

Write-Host "✨ Configuration terminée !" -ForegroundColor Green
Write-Host ""
Write-Host "🎮 Vous pouvez maintenant jouer avec d'autres PC sur votre réseau local" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Votre adresse IP locale :" -ForegroundColor Cyan
ipconfig | Select-String "IPv4" | Select-Object -First 1
Write-Host ""
Write-Host "👉 Les autres PC peuvent accéder au jeu via :" -ForegroundColor Yellow
Write-Host "   http://VOTRE_IP:3000/cybergame" -ForegroundColor White
Write-Host ""
Read-Host "Appuyez sur Entrée pour quitter"
