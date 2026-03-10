# Production Deployment Script
param(
    [string]$Server = "172.27.30.45",
    [string]$User = "faiz"
)

$ErrorActionPreference = "Stop"

function Run-SSH {
    param($Cmd, $Msg)
    Write-Host "[$Msg]" -ForegroundColor Yellow
    Write-Host "> $Cmd"
    ssh $User@$Server $Cmd
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Command failed: $Msg"
    }
    Write-Host "OK`n" -ForegroundColor Green
}

Write-Host "Deploying to $Server..." -ForegroundColor Cyan

# Check connection
write-host "Checking connection..."
ssh -o ConnectTimeout=5 $User@$Server "echo 'Connection OK'"
if ($LASTEXITCODE -ne 0) { exit 1 }

# Check Docker
Run-SSH "su - root -c 'docker --version && docker ps'" "Checking Docker"

# Git Update (Force Reset to match Origin)
Run-SSH "su - root -c 'cd /root/New-Warungin && git fetch origin && git reset --hard origin/main'" "Updating Code"

# Rebuild and Restart
Run-SSH "su - root -c 'cd /root/New-Warungin && docker-compose down'" "Stopping Containers"
Run-SSH "su - root -c 'cd /root/New-Warungin && docker-compose build --no-cache'" "Building Images"
Run-SSH "su - root -c 'cd /root/New-Warungin && docker-compose up -d'" "Starting Containers"

# Verification
Write-Host "Waiting for services to initialize (30s)..." -ForegroundColor Cyan
Start-Sleep -Seconds 30
Run-SSH "su - root -c 'cd /root/New-Warungin && docker-compose ps'" "Verifying Status"

Write-Host "Deployment Complete!" -ForegroundColor Green
