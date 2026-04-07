@echo off
echo 🛡️ Starting DECEPTOR Backend...
start cmd /k "cd backend && .\.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000"

echo 🎨 Starting DECEPTOR Frontend...
start cmd /k "cd frontend && npm run dev"

echo ✅ Both servers are launching! 
echo 🌐 Open http://localhost:5173 in your browser.
pause
