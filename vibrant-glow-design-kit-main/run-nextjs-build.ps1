# Run Next.js build in a new terminal window
# This isolates the build process

$scriptPath = $PSScriptRoot
$projectPath = if ($scriptPath) { $scriptPath } else { Get-Location }

Write-Host "Starting Next.js build in isolated environment..."
Write-Host "Project path: $projectPath"

# Change to project directory and run build
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$projectPath'; Write-Host 'Next.js Build Terminal'; Write-Host '==================='; npm run build:next; Write-Host ''; Write-Host 'Press any key to exit...'; $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')"
)

Write-Host "Build terminal opened. Check the new window for build progress."










