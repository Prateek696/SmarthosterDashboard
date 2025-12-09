# Next.js Build Script - Safely handles src/pages conflict
# Temporarily moves src/pages during build, then restores it

$ErrorActionPreference = "Stop"

$pagesPath = Join-Path $PSScriptRoot "src\pages"
$tempPagesPath = Join-Path $PSScriptRoot "src\react-pages-temp"
$restored = $false

Write-Host "`n🔨 Next.js Build Process" -ForegroundColor Cyan
Write-Host "=" * 40 -ForegroundColor Cyan

try {
    # Step 1: Temporarily rename src/pages
    if (Test-Path $pagesPath) {
        Write-Host "📦 Renaming src/pages → src/react-pages-temp..." -ForegroundColor Yellow
        
        # Clean up any leftover temp directory
        if (Test-Path $tempPagesPath) {
            Remove-Item $tempPagesPath -Recurse -Force -ErrorAction SilentlyContinue
        }
        
        # Use Move-Item instead of Rename-Item for better Windows compatibility
        Move-Item -Path $pagesPath -Destination $tempPagesPath -Force
        Write-Host "   ✓ Done" -ForegroundColor Green
        
        # Build Next.js
        Write-Host "`n🚀 Building Next.js app..." -ForegroundColor Cyan
        npm run build:next
        
        if ($LASTEXITCODE -ne 0) {
            throw "Build failed with exit code $LASTEXITCODE"
        }
        
        Write-Host "   ✓ Build successful!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  src/pages not found, running build directly..." -ForegroundColor Yellow
        npm run build:next
        
        if ($LASTEXITCODE -ne 0) {
            throw "Build failed with exit code $LASTEXITCODE"
        }
    }
    
} catch {
    Write-Host "`n❌ Error: $_" -ForegroundColor Red
    exit 1
} finally {
    # Step 2: Always restore src/pages (even if build failed)
    if (Test-Path $tempPagesPath) {
        Write-Host "`n🔄 Restoring src/pages directory..." -ForegroundColor Yellow
        Move-Item -Path $tempPagesPath -Destination $pagesPath -Force
        Write-Host "   ✓ Restored successfully" -ForegroundColor Green
        $restored = $true
    }
}

if ($restored) {
    Write-Host "`n✨ Build process completed successfully!" -ForegroundColor Green
} else {
    Write-Host "`n✨ Done!" -ForegroundColor Cyan
}
