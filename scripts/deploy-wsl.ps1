# Direct WSL Deployment Script
$ErrorActionPreference = "Stop"

$WSL_DISTRO = "Ubuntu"
$REPO_URL = "https://github.com/faiznutes/New-Warungin.git"
$REPO_DIR = "/root/New-Warungin"
$LOCAL_ENV = "/mnt/f/Backup W11/Project/New-Warungin/.env"

function Run-WSL {
    param($Cmd, $Msg)
    Write-Host "[$Msg]" -ForegroundColor Yellow
    Write-Host "> $Cmd"
    wsl -d $WSL_DISTRO -u root bash -c "$Cmd"
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Command failed: $Msg"
    }
    Write-Host "OK`n" -ForegroundColor Green
}

Write-Host "Deploying directly to WSL ($WSL_DISTRO)..." -ForegroundColor Cyan

# 1. Start WSL
wsl -d $WSL_DISTRO -e date

# 2. Clone or Update
Write-Host "Checking for existing repo..."
wsl -d $WSL_DISTRO -u root bash -c "[ -d $REPO_DIR ]"
if ($LASTEXITCODE -ne 0) {
    # Clone
    Run-WSL "git clone $REPO_URL $REPO_DIR" "Cloning Repository"
}
else {
    # Reset
    Run-WSL "cd $REPO_DIR && git fetch origin && git reset --hard origin/main" "Updating Repository"
}

# 3. Copy .env
Run-WSL "cp '$LOCAL_ENV' '$REPO_DIR/.env'" "Copying .env file"

# 4. Rebuild & Start
# Using docker-compose.exe since native docker is missing in distro
Run-WSL "cd $REPO_DIR && docker-compose.exe down" "Stopping Containers"
Run-WSL "cd $REPO_DIR && docker-compose.exe build --no-cache" "Building Images"
Run-WSL "cd $REPO_DIR && docker-compose.exe up -d" "Starting Containers"

# 5. Verify
Write-Host "Waiting for services..."
Start-Sleep -Seconds 30
Run-WSL "cd $REPO_DIR && docker-compose.exe ps" "Status Check"
Run-WSL "curl -s http://localhost:3001/api/health" "Health Check"

Write-Host "Deployment Complete!" -ForegroundColor Green
