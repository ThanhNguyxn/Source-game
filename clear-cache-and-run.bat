@echo off
echo ========================================
echo   SOURCE GAMES - CLEAR CACHE SCRIPT
echo ========================================
echo.
echo This script will help you clear browser cache
echo and open the game collection with fresh data.
echo.
echo Press any key to continue...
pause >nul

echo.
echo [1/3] Closing all browser instances...
taskkill /F /IM chrome.exe 2>nul
taskkill /F /IM msedge.exe 2>nul
taskkill /F /IM firefox.exe 2>nul
echo Done!

echo.
echo [2/3] Clearing Chrome cache...
if exist "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Cache" (
    rd /s /q "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Cache" 2>nul
    echo Chrome cache cleared!
) else (
    echo Chrome cache not found or already clean.
)

echo.
echo [3/3] Opening index.html in browser...
start "" "index.html"

echo.
echo ========================================
echo   DONE!
echo ========================================
echo.
echo The game collection should now open with NO cache.
echo.
echo If you still see "How to Play" buttons:
echo 1. Press Ctrl+F5 to hard refresh
echo 2. Or press Ctrl+Shift+N to open in Incognito mode
echo.
echo Press any key to exit...
pause >nul

