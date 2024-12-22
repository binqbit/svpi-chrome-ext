@echo off

set "CURRENT_DIR=%~dp0"
echo %CURRENT_DIR%

set "APP_NAME=com.binqbit.svpi_chrome_app"
set "JSON_PATH=%CURRENT_DIR%com.binqbit.svpi_chrome_app.json"

echo APP_NAME: %APP_NAME%
echo JSON_PATH: %JSON_PATH%

reg add "HKEY_CURRENT_USER\SOFTWARE\Google\Chrome\NativeMessagingHosts" /f
reg add "HKEY_CURRENT_USER\SOFTWARE\Google\Chrome\NativeMessagingHosts\%APP_NAME%" /ve /t REG_SZ /d "%JSON_PATH%" /f
