# 🛡️ DECEPTOR: Autonomous Deception Defense Network

DECEPTOR is a demo platform for an intelligent deception defense system. It does not just block threats — it creates fake assets, tracks attacker behavior, and simulates a live defense response using a multi-agent backend and a real-time dashboard.

## What this project does

- Simulates attacker actions and live packet activity.
- Uses a backend orchestration graph to generate defense analytics.
- Shows a dashboard with threat scores, compromised nodes, and active agent responses.
- Demonstrates how deception techniques can make attackers waste time and expose their tools.

## Key parts

- `backend/` — FastAPI server, WebSocket stream, LangGraph-based agent logic.
- `frontend/` — React + Vite dashboard that subscribes to live attack events.
- `backend/simulator.py` — creates fake attacker events for the demo.
- `backend/agent_graph.py` — defines the agent workflow and response rules.

## Agents in the demo

The current backend uses a multi-agent defense graph with these roles:

- **Behavioral Monitor** — observes attacker behavior and decides how they interact with decoys.
- **Threat Profiler** — scores the attacker severity and updates the threat level.
- **Decoy Architect** — spins up convincing fake services and traps.
- **Lure Designer** — plants breadcrumbs such as fake keys and weak credentials.
- **Distraction Coordinator** — slows connections and returns false banners to keep attackers busy.
- **Honeypot Operator** — routes traffic into honeypots and preserves forensic evidence.
- **Adaptation Agent** — adjusts response rules and defense posture based on attacker actions.
- **Forensic Analyzer** — captures attacker session data and correlates it with patterns.
- **Signal Distributor** — emits deceptive telemetry to hide real assets.
- **Threat Sharing** — propagates indicators of compromise across the simulated cluster.
- **Retreat Controller** — isolates compromised paths and hardens the network.
- **Intelligence Agent** — packages findings for broader threat awareness.

## Dashboard overview

The frontend dashboard is designed to show the live simulation clearly:

- **Live Threat** — current MITRE-style attack phase and severity score.
- **Defense State** — whether the system is contained or actively responding.
- **Tool Count** — number of attacker tools detected in the simulation.
- **Attack Stream** — live event feed with attacker actions and agent chatter.
- **Packet Capture** — simulated raw packet logs to visualize ongoing intrusion activity.
- **Network Map** — a deception topology showing real and fake assets with active paths.
- **Agent Hub** — active statuses for each defense agent in the system.
- **Analysis & Mitigation** — ongoing recommendations, mitigation actions, and resolution state.
- **Notifications** — popup alerts for new attacker events and status changes.

## Run the project

### 1. Start the backend

1. Open a terminal in `e:\Machine-Learninh\backend`
2. Create and activate a Python virtual environment:
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```
3. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```
4. Start the backend:
   ```powershell
   python main.py
   ```

The backend listens on `http://0.0.0.0:8000` and provides a WebSocket at:

`ws://127.0.0.1:8000/ws/attack-stream`

### 2. Start the frontend

1. Open a second terminal in `e:\Machine-Learninh\frontend`
2. Install Node dependencies:
   ```powershell
   npm install
   ```
3. Start the dashboard:
   ```powershell
   npm run dev -- --host 0.0.0.0
   ```

   **Tip:** The dashboard UI includes a **Theme** toggle (Light/Dark).
4. Open the browser at:
   - `http://localhost:5173/`
   - if that port is busy, Vite will choose the next available one (often `5174`).

### 3. View the demo

- Open the frontend URL in your browser.
- The dashboard will automatically connect to the backend.
- Live attack events and agent responses appear immediately.

## Notes

- If the backend reports a port conflict on `8000`, stop the existing process or use another port.
- The frontend uses a WebSocket connection to receive live updates.
- The demo is designed for presentation, so it uses synthetic events and simulated defense reasoning.
