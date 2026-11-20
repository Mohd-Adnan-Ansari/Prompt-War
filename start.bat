@echo off
echo ========================================================
echo CrisisAI - Multi-Agent Crisis Command Centre
echo ========================================================
echo Starting Backend FastAPI Server on http://127.0.0.1:8000 ...
start cmd /k "cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo Starting Frontend Dev Server on http://localhost:5173 ...
start cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are launching!
echo Backend API Docs: http://127.0.0.1:8000/docs
echo Frontend Portal:  http://localhost:5173
echo ========================================================
pause
