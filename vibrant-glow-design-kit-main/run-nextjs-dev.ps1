# Run Next.js dev server in a new terminal window
# This isolates the dev server

$scriptPath = $PSScriptRoot
$projectPath = if ($scriptPath) { $scriptPath } else { Get-Location }

Write-Host "Starting Next.js dev server in isolated environment..."
Write-Host "Project path: $projectPath"

# Change to project directory and run dev server
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$projectPath'; Write-Host 'Next.js Dev Server'; Write-Host '==================='; Write-Host 'Starting on http://localhost:3000'; Write-Host ''; npm run dev:next"
)

Write-Host "Dev server terminal opened. Server starting on http://localhost:3000"










