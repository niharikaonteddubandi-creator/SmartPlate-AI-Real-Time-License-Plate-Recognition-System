@echo off
echo ========================================================
echo    SmartPlate AI - Real-Time License Plate Recognition
echo ========================================================
echo.

set PATH=C:\Users\hp\AppData\Local\Programs\Python\Python311;C:\Users\hp\AppData\Local\Programs\Python\Python311\Scripts;C:\Users\hp\AppData\Local\Programs\nodejs;%PATH%

echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "SmartPlate AI Backend" cmd /k "cd /d "%~dp0backend" && venv\Scripts\activate && set PYTHONPATH=. && python run.py"

echo [2/2] Starting React Frontend on http://127.0.0.1:5173 ...
start "SmartPlate AI Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ========================================================
echo SmartPlate AI is running!
echo Frontend: http://127.0.0.1:5173
echo Backend API / Docs: http://127.0.0.1:8000/docs
echo ========================================================
pause
