# 🎓 EduGenAI v2.0 — Enhanced AI Video Lesson Generator

## ✨ What's New in v2.0

| Feature | Details |
|---|---|
| 🌐 Multilingual | English, Tamil, Hindi |
| 🔐 Authentication | Signup, Login, JWT, Dashboard |
| 📊 PowerPoint Export | Download .pptx with styled slides |
| 🧠 AI Quiz | 5 auto-generated MCQ questions |
| 💬 Doubt Solver | Chat with AI about the lesson |
| 🎨 Learning Styles | Visual, Example-based, Story-driven |
| 🗄️ Database | SQLite (upgradeable to PostgreSQL) |
| ⚡ Groq Support | Ultra-fast LLM via Llama 3.3 70B |

---

## 📁 Project Structure

```
EduGenAI/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── database/
│   │   ├── db.py
│   │   └── models.py
│   └── modules/
│       ├── script_generator.py
│       ├── scene_generator.py
│       ├── slide_generator.py
│       ├── voice_generator.py
│       ├── video_compiler.py
│       ├── auth/
│       ├── quiz/
│       ├── lesson/
│       ├── pptx/
│       └── translation/
└── frontend/src/
    ├── App.jsx
    ├── context/AuthContext.js
    ├── pages/
    │   ├── HomePage.jsx
    │   ├── LoginPage.jsx
    │   ├── SignupPage.jsx
    │   └── DashboardPage.jsx
    └── components/
        ├── quiz/QuizPanel.jsx
        └── chat/DoubtSolver.jsx
```

---

## ⚙️ Installation

```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env
# Edit .env - add GROQ_API_KEY
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm start
```

---

## 🔑 .env Setup

```env
AI_PROVIDER=groq
GROQ_API_KEY=gsk_your_key_here
VOICE_PROVIDER=gtts
SECRET_KEY=any-random-string-here
DATABASE_URL=sqlite+aiosqlite:///./edugenai.db
OUTPUT_DIR=output
```

---

## 🌐 API Routes

| Method | Route | Description |
|---|---|---|
| POST | /auth/signup | Create account |
| POST | /auth/login | Login (JWT) |
| POST | /generate | Start generation |
| GET | /status/{id} | Poll progress |
| GET | /download/video/{id} | Download MP4 |
| GET | /download/pptx/{id} | Download PPTX |
| GET | /quiz/{id} | Get quiz |
| POST | /doubt | Ask AI |

---

## 🎯 Supported Languages

| Language | Script | gTTS Code |
|---|---|---|
| English | Latin | en |
| Tamil | Tamil script | ta |
| Hindi | Devanagari | hi |
