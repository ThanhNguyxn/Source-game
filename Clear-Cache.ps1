# Source Games - Clear Cache PowerShell Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SOURCE GAMES - CLEAR CACHE TOOL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/4] Stopping all browser processes..." -ForegroundColor Yellow
Get-Process chrome,msedge,firefox -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Write-Host "✓ Browsers closed" -ForegroundColor Green

Write-Host ""
Write-Host "[2/4] Clearing Chrome cache..." -ForegroundColor Yellow
$chromeCachePath = "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Cache"
if (Test-Path $chromeCachePath) {
    Remove-Item -Path "$chromeCachePath\*" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✓ Chrome cache cleared" -ForegroundColor Green
} else {
    Write-Host "! Chrome cache not found" -ForegroundColor Gray
}

Write-Host ""
Write-Host "[3/4] Clearing Edge cache..." -ForegroundColor Yellow
$edgeCachePath = "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Cache"
if (Test-Path $edgeCachePath) {
    Remove-Item -Path "$edgeCachePath\*" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✓ Edge cache cleared" -ForegroundColor Green
} else {
    Write-Host "! Edge cache not found" -ForegroundColor Gray
}

Write-Host ""
Write-Host "[4/4] Opening game collection..." -ForegroundColor Yellow
Start-Process "index.html"
Write-Host "✓ Opened index.html" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  COMPLETED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If you still see 'How to Play' buttons:" -ForegroundColor Yellow
Write-Host "  → Press Ctrl+F5 to hard refresh" -ForegroundColor White
Write-Host "  → Or open in Incognito: Ctrl+Shift+N" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

