# scripts/trigger-deploy.ps1
# Usage: .\scripts\trigger-deploy.ps1

$SSH_USER = "faiz"
$SSH_HOST = "192.168.1.101"
# Password is '123' based on history, but we let SSH prompt or use key if set.

Write-Host "Triggering Deployment on $SSH_HOST..." -ForegroundColor Cyan

# Check for SSH
if (-not (Get-Command ssh -ErrorAction SilentlyContinue)) {
    Write-Error "SSH not found."
    exit 1
}

# The command to run on the server
# We assume the repo is at ~/New-Warungin or ~/Warungin
$RemoteCmd = "
    if [ -d 'New-Warungin' ]; then cd New-Warungin; 
    elif [ -d 'Warungin' ]; then cd Warungin; 
    else echo 'Repo not found'; exit 1; fi
    
    chmod +x scripts/deploy.sh
    ./scripts/deploy.sh
"

ssh -t $SSH_USER@$SSH_HOST "bash -c '$RemoteCmd'"
