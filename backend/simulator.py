import asyncio
import json
from pydantic import BaseModel

class AttackerEvent(BaseModel):
    id: str
    action: str
    target: str
    tools: list[str]

# A mock generator that yields attacker events
async def simulate_attack_sequence():
    """Generates a sequence of mock events reflecting an attacker navigating the honeypot."""
    events = [
        {"action": "SCAN", "target": "WAN", "tools": ["Nmap", "Masscan"], "delay": 2},
        {"action": "BRUTE_FORCE", "target": "WEB_FA1", "tools": ["Hydra"], "delay": 3},
        {"action": "EXPLOIT", "target": "WEB_FA1", "tools": ["BurpSuite"], "delay": 2},
        {"action": "INJECT", "target": "DB_FA1", "tools": ["SQLMap"], "delay": 3},
        {"action": "DATA_EXFIL", "target": "DB_FA1", "tools": ["Custom Script"], "delay": 2},
    ]
    
    for i, event in enumerate(events):
        await asyncio.sleep(event["delay"])
        yield AttackerEvent(
            id=f"evt_{i}",
            action=event["action"],
            target=event["target"],
            tools=event["tools"]
        )
