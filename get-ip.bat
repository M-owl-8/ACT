@echo off
echo ========================================
echo Finding your local IP address...
echo ========================================
echo.

ipconfig | findstr /i "IPv4"

echo.
echo ========================================
echo Copy one of the IP addresses above
echo (usually starts with 192.168 or 10.0)
echo.
echo Then edit apps/mobile/.env and set:
echo EXPO_PUBLIC_API_BASE_URL=http://YOUR_IP:8000
echo.
echo Example:
echo EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:8000
echo ========================================
pause