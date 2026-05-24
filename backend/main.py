from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
from simulator import simulate_attack_sequence
from agent_graph import deceptor_graph
from ml_adaptive import AdaptiveDecisionModel

app = FastAPI(title="DECEPTOR Multi-Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "DECEPTOR Backend Active"}

@app.websocket("/ws/attack-stream")
async def attack_stream(websocket: WebSocket):
    await websocket.accept()
    adaptive_model = AdaptiveDecisionModel()
    try:
        # Initialize LangGraph state
        state = {
            "messages": [],
            "attacker_events": [],
            "active_threat_level": 1,
            "tools_detected": [],
            "mitigations": [],
            "analysis": [],
            "resolved": False,
        }
        
        async for attacker_event in simulate_attack_sequence():
            event_payload = attacker_event.model_dump()
            # 1. Notify frontend about the attacker action
            await websocket.send_json({
                "type": "ATTACKER_ACTION",
                "data": event_payload,
            })
            
            # 2. Update state and trigger graph
            state["attacker_events"].append(event_payload)
            result = deceptor_graph.invoke(state)
            state.update(result)

            # 2a. Predict adaptive response using ML
            prediction = adaptive_model.predict(event_payload)
            await websocket.send_json({
                "type": "ML_PREDICTION",
                "data": prediction,
            })
            
            # 3. Stream the agent responses back to UI
            for msg in result.get("messages", []):
                # Using a small delay to simulate human-readable typing of agent thoughts
                await asyncio.sleep(0.5)

                # Stable agent mapping for the frontend Agent Hub.
                # We infer from the message prefix but normalize it to the exact UI labels.
                raw_prefix = msg.content.split(":", 1)[0] if ":" in msg.content else ""
                raw_prefix = raw_prefix.strip()

                agent_map = {

                    "Behavioral Monitor": "Behavioral Monitor",
                    "Threat Profiler": "Threat Profiler",
                    "Decoy Architect": "Decoy Architect",
                    "Lure Designer": "Lure Designer",
                    "Distraction Coordinator": "Distraction Coordinator",
                    "Honeypot Operator": "Honeypot Operator",
                    "Adaptation Agent": "Adaptation Agent",
                    "Forensic Analyzer": "Forensic Analyzer",
                    "Signal Distributor": "Signal Distributor",
                    "Threat Sharing": "Threat Sharing",
                    "Retreat Controller": "Retreat Controller",
                    "Intelligence Agent": "Intelligence Agent",
                }

                agent_name = agent_map.get(raw_prefix, "System Defense")

                await websocket.send_json({
                    "type": "AGENT_CHATTER",
                    "data": {
                        "agent": agent_name,
                        "text": msg.content,
                    },
                })

            
            # 4. Send analysis and mitigation updates to the frontend
            await websocket.send_json({
                "type": "ANALYSIS_UPDATE",
                "data": {
                    "active_threat_level": state.get("active_threat_level", 1),
                    "analysis": state.get("analysis", []),
                    "mitigations": state.get("mitigations", []),
                    "resolved": state.get("resolved", False),
                },
            })
                
    except WebSocketDisconnect:
        print("Frontend disconnected.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
