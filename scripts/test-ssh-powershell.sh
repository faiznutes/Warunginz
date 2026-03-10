#!/bin/bash
# Test SSH connection dari Windows PowerShell via WSL
# Usage: bash test-ssh-powershell.sh

echo "=========================================="
echo "Testing SSH via PowerShell Gateway"
echo "=========================================="
echo ""

# Try to access localhost:22 (Windows SSH server if installed)
echo "Testing: Can we reach Windows host SSH?"
timeout 2 bash -c 'echo > /dev/tcp/172.27.16.1/22' 2>/dev/null && echo "✅ Port 22 open on Windows host" || echo "❌ Port 22 not available"
echo ""

# Try 192.168.1.101 direct
echo "Testing: Can we reach 192.168.1.101:22 directly?"
timeout 2 bash -c 'echo > /dev/tcp/192.168.1.101/22' 2>/dev/null && echo "✅ Port 22 open on 192.168.1.101" || echo "❌ Cannot reach 192.168.1.101:22"
echo ""

# Check available routes
echo "Current network routes:"
ip route show
echo ""

# Suggestion
echo "Solution: Windows host is at 172.27.16.1 (gateway)"
echo "To access 192.168.1.101 from WSL2, we need:"
echo "1. Setup .wslconfig with networkingMode=mirrored"
echo "2. OR use PowerShell native (not WSL)"
echo ""
echo "Next: Open native PowerShell and run:"
echo "  Test-NetConnection -ComputerName 192.168.1.101 -Port 22"
echo "  ssh -i ~/.ssh/id_ed25519 root@192.168.1.101"
