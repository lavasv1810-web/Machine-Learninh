# 🛡️ DECEPTOR: Autonomous Deception Defense Network

DECEPTOR is a next-generation cybersecurity platform that weaponizes deception. Instead of just blocking attackers, DECEPTOR creates an intelligent, shifting network of fake targets (honeypots) to lure attackers in, waste their time, construct threat profiles, and automatically adapt real network defenses in real-time.

![DECEPTOR Dashboard](frontend/src/assets/demo.png)

## 🌟 How It Works

DECEPTOR operates using a **7-Agent AI Swarm** orchestrated via LangGraph:
1. **Decoy Architect:** Dynamically spawns convincing vulnerable services.
2. **Lure Designer:** Drops breadcrumbs (fake AWS keys, weak passwords).
3. **Behavioral Monitor:** Analyzes incoming attacker packets/tools.
4. **Threat Profiler:** Evaluates the sophistication of the attacker.
5. **Distraction Coordinator:** Implements tarpits (e.g., slowing TCP responses).
6. **Adaptation Agent:** Generates WAF rules to protect real infrastructure.
7. **Intelligence Agent:** Packages threat signatures for global distribution.

---

## 🚀 Tech Stack

- **Frontend:** React + Vite, Custom CSS (Dark-Mode premium UI)
- **Backend:** FastAPI, WebSockets
- **Intelligence Orchestration:** LangGraph, LangChain
- **Inference:** Groq (LLaMA-3) for ultra-low latency agent reasoning

---

## 🛠️ Getting Started

### 1. Start the Backend (Multi-Agent API)
Requires Python 3.10+.
```bash
cd backend
python -m venv .venv
# Activate virtual environment
pip install -r requirements.txt

# Add your Groq API Key to backend/.env
# GROQ_API_KEY="your_key"

uvicorn main:app --reload --port 8000
```

### 2. Start the Frontend (Dashboard)
Requires Node.js.
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:5174` (or whichever port Vite yields). As soon as the page loads, the frontend will connect to the backend WebSocket and the live, autonomous attack simulation will begin!
