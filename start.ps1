# SmartPlate AI - One-Click Launcher for Windows PowerShell
$root = $PSScriptRoot
$env:Path = "C:\Users\hp\AppData\Local\Programs\Python\Python311;C:\Users\hp\AppData\Local\Programs\Python\Python311\Scripts;C:\Users\hp\AppData\Local\Programs\nodejs;$env:Path"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   SmartPlate AI - Real-Time License Plate Recognition" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

Write-Host "`n[1/2] Starting Backend Server (FastAPI + EasyOCR)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; `$env:PYTHONPATH='.'; .\venv\Scripts\Activate.ps1; python run.py"

Write-Host "[2/2] Starting Frontend App (React + Vite)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; `$env:Path = 'C:\Users\hp\AppData\Local\Programs\nodejs;' + `$env:Path; npm run dev"

Write-Host "`nSmartPlate AI is launching in your browser!" -ForegroundColor Yellow
Write-Host "Frontend:    http://127.0.0.1:5173" -ForegroundColor White
Write-Host "Backend API: http://127.0.0.1:8000/docs" -ForegroundColor White
Start-Process "http://127.0.0.1:5173"
