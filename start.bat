@echo off
setlocal
cd /d "%~dp0"

if not exist ".venv\Scripts\python.exe" (
    echo First-time setup: creating a local Python environment...
    where py >nul 2>&1
    if not errorlevel 1 (
        py -3 -m venv .venv
    )
    if not exist ".venv\Scripts\python.exe" (
        where python >nul 2>&1
        if not errorlevel 1 (
            python -m venv .venv
        )
    )
    if not exist ".venv\Scripts\python.exe" (
        echo [ERROR] Python was not found on your system.
        echo Please install Python 3.10 or newer from https://www.python.org/
        echo Make sure to check "Add python.exe to PATH" during installation.
        echo.
        pause
        exit /b 1
    )
    echo Installing dependencies...
    ".venv\Scripts\python.exe" -m pip install -r requirements.txt
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies from requirements.txt.
        echo.
        pause
        exit /b 1
    )
) else (
    ".venv\Scripts\python.exe" -c "import pdfplumber" >nul 2>&1
    if errorlevel 1 (
        echo Installing missing dependencies...
        ".venv\Scripts\python.exe" -m pip install -r requirements.txt
        if errorlevel 1 (
            echo [ERROR] Failed to install dependencies from requirements.txt.
            echo.
            pause
            exit /b 1
        )
    )
)

".venv\Scripts\python.exe" app.py %*
if errorlevel 1 (
    echo.
    echo Application exited with an error.
    pause
)
