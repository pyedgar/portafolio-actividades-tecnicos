@echo off
title Subiendo Portafolio a GitHub...
cd /d "%~dp0"
echo =======================================================
echo    Subiendo Portafolio a GitHub (Rama main)...
echo =======================================================
echo.
"C:\Program Files\Git\cmd\git.exe" push origin main
echo.
if %ERRORLEVEL% equ 0 (
    echo =======================================================
    echo    EXITO: Tu portafolio se subio correctamente!
    echo    Abre tu enlace:
    echo    https://pyedgar.github.io/portafolio-actividades-tecnicos/
    echo =======================================================
) else (
    echo Ocurrio un inconveniente al conectar con GitHub.
)
echo.
pause
