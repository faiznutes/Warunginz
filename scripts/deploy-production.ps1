# PHASE 35 Production Deployment - PowerShell Script
# For use on Windows PowerShell (not WSL)
# Requires: sshpass installed (choco install sshpass -y)
# Usage: powershell -ExecutionPolicy Bypass -File .\deploy-production.ps1

# PSScriptAnalyzer: Suppress password plaintext warning (development only)
[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSAvoidUsingPlainTextForPassword', '')]
param()

$ErrorActionPreference = "Stop"

# Configuration
$Server = "192.168.1.101"
$User = "root"
$Password = "123"  # Use SSH keys in production
$ProjectPath = "/root/New-Warungin"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "PHASE 35 Production Deployment" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

try {
    Write-Host "[1/3] Testing SSH connectivity..." -ForegroundColor Yellow
    $testConnection = sshpass -p $Password ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no "$User@$Server" "echo 'SSH OK'" 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        throw "SSH connection failed: $testConnection"
    }
    Write-Host "✅ SSH connection successful" -ForegroundColor Green
    Write-Host ""

    Write-Host "[2/3] Deploying PHASE 35 changes..." -ForegroundColor Yellow
    
    # Build deployment commands
    $commands = @(
        "cd $ProjectPath"
        "git pull origin main"
        "npm ci --production"
        "npx prisma generate"
        "npx prisma migrate deploy"
        "npm run build"
    )
    
    # Execute commands remotely
    $commandScript = $commands -join ' && '
    sshpass -p $Password ssh -o StrictHostKeyChecking=no "$User@$Server" $commandScript
    
    if ($LASTEXITCODE -ne 0) {
        throw "Deployment commands failed"
    }
    Write-Host "✅ Deployment successful" -ForegroundColor Green
    Write-Host ""

    Write-Host "[3/3] Verifying deployment..." -ForegroundColor Yellow
    $gitLog = sshpass -p $Password ssh -o StrictHostKeyChecking=no "$User@$Server" "cd $ProjectPath && git log -1 --oneline" 2>&1
    Write-Host "✅ Latest commit: $gitLog" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "✅ DEPLOYMENT COMPLETE" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. SSH to server: sshpass -p 123 ssh root@$Server"
    Write-Host "2. Start application: npm start"
    Write-Host "3. Check health: curl http://localhost:3000/health"
    Write-Host ""
}
catch {
    Write-Host ""
    Write-Host "❌ DEPLOYMENT FAILED" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    exit 1
}
