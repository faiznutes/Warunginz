# Deployment via WSL + SSHPASS
$Server = "192.168.1.101"
$User = "root"
$Pass = "123"

function Remote-Exec {
    param($Cmd, $Msg)
    Write-Host "[$Msg]" -ForegroundColor Yellow
    wsl -d Ubuntu -u root -- sshpass -p $Pass ssh -o StrictHostKeyChecking=no $User@$Server "$Cmd"
}

Write-Host "Deploying to $Server via WSL..." -ForegroundColor Cyan

# 1. Check
Remote-Exec "echo Connection OK" "Checking Connection"

# 2. Update Code
Remote-Exec "cd /root/New-Warungin && git fetch origin && git reset --hard origin/main" "Updating Code"

# 3. Rebuild
Remote-Exec "cd /root/New-Warungin && docker compose down" "Stopping Containers"
Remote-Exec "cd /root/New-Warungin && docker compose build --no-cache" "Building Images"
Remote-Exec "cd /root/New-Warungin && docker compose up -d" "Starting Containers"

# 4. Verify
Write-Host "Waiting for services..."
Start-Sleep -Seconds 20
Remote-Exec "cd /root/New-Warungin && docker compose ps" "Status Check"
Remote-Exec "curl -s http://localhost:3001/api/health" "Health Check"

Write-Host "Deployment Sequence Complete!" -ForegroundColor Green
