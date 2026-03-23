#!/bin/bash
# start.sh — Start both backend and frontend

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🎓 Starting EduGenAI..."

# Backend
echo "▶ Starting FastAPI backend on port 8000..."
cd "$SCRIPT_DIR/backend"
if [ ! -d "venv" ]; then
  echo "  Creating virtual environment..."
  python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt -q
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "  ⚠️  Created .env from template — please fill in your API keys!"
fi
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Frontend
echo "▶ Starting React frontend on port 3000..."
cd "$SCRIPT_DIR/frontend"
if [ ! -d "node_modules" ]; then
  echo "  Installing npm packages..."
  npm install
fi
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ EduGenAI is running!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" EXIT
wait
