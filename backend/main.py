from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
from simulator import simulate_attack_sequence
from agent_graph import deceptor_graph
from dotenv import load_dotenv

load_dotenv()

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
    try:
        # Initialize LangGraph state
        state = {
            "messages": [],
            "attacker_events": [],
            "active_threat_level": 1,
            "tools_detected": []
        }
        
        async for attacker_event in simulate_attack_sequence():
            # 1. Notify frontend about the attacker action
            await websocket.send_json({
                "type": "ATTACKER_ACTION",
                "data": attacker_event.model_dump()
            })
            
            # 2. Update state and trigger graph
            state["attacker_events"].append(attacker_event.model_dump())
            result = deceptor_graph.invoke(state)
            
            # 3. Stream the agent responses back to UI
            for msg in result.get("messages", []):
                # Using a small delay to simulate human-readable typing of agent thoughts
                await asyncio.sleep(0.5)
                await websocket.send_json({
                    "type": "AGENT_CHATTER",
                    "data": {
                        "agent": "System Defense", # Derive agent name from AIMessage content prefix
                        "text": msg.content
                    }
                })
                
    except WebSocketDisconnect:
        print("Frontend disconnected.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
