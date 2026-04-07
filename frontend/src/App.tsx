import { useEffect, useState } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  Terminal, 
  Network, 
  Server, 
  Database, 
  Globe, 
  Clock, 
  Activity as Ping, 
  Crosshair, 
  Fingerprint 
} from 'lucide-react';

const initialNodes = [
  { id: 'WAN', label: 'Internet', x: 50, y: 50, type: 'attacker', icon: Globe },
  { id: 'FW1', label: 'Firewall', x: 200, y: 150, type: 'real', icon: ShieldAlert },
  { id: 'WEB1', label: 'Main App', x: 400, y: 100, type: 'real', icon: Server },
  { id: 'DB1', label: 'Core DB', x: 600, y: 100, type: 'real', icon: Database },
  { id: 'WEB_FA1', label: 'Legacy Portal', x: 400, y: 250, type: 'fake', icon: Server },
  { id: 'DB_FA1', label: 'Backup DB', x: 600, y: 250, type: 'fake', icon: Database },
  { id: 'API_FA1', label: 'Staging API', x: 400, y: 400, type: 'fake', icon: Network },
];

const connections = [
  { from: 'WAN', to: 'FW1' },
  { from: 'FW1', to: 'WEB1' },
  { from: 'WEB1', to: 'DB1' },
  { from: 'FW1', to: 'WEB_FA1' },
  { from: 'WEB_FA1', to: 'DB_FA1' },
  { from: 'FW1', to: 'API_FA1' },
];

export default function App() {
  const [messages, setMessages] = useState<{agent: string, type: string, text: string}[]>([]);
  const [wastedTime, setWastedTime] = useState(0);
  const [tools, setTools] = useState<string[]>([]);
  const [activeThreat, setActiveThreat] = useState(1);
  const [lastMitre, setLastMitre] = useState("T1046");
  const [activePath, setActivePath] = useState<{from: string, to: string} | null>(null);
  const [compromisedNodes, setCompromisedNodes] = useState<string[]>([]);
  const [attackerInfo, setAttackerInfo] = useState({ ip: '---', location: '---' });
  const [rawLogs, setRawLogs] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<{id: number, text: string}[]>([]);

  // Connection to Backend API
  useEffect(() => {
    const ws = new WebSocket("ws://127.0.0.1:8000/ws/attack-stream");

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        
        if (payload.type === 'AGENT_CHATTER') {
          const text: string = payload.data.text;
          
          let msgType = 'system';
          if (text.startsWith('Behavioral Monitor') || text.startsWith('Adaptation')) msgType = 'defense';
          if (text.startsWith('Attacker')) msgType = 'attacker';
          if (text.startsWith('Lure Designer') || text.startsWith('Decoy')) msgType = 'system';

          const agentNameMatch = text.match(/^([\w\s]+):/);
          const agentName = agentNameMatch ? agentNameMatch[1] : payload.data.agent;

          setMessages(prev => [...prev, {
            agent: agentName,
            type: msgType,
            text: text
          }].slice(-20)); // Keep last 20 messages
        }
        
        if (payload.type === 'ATTACKER_ACTION') {
           setTools(prev => {
             const newTools = [...prev];
             payload.data.tools.forEach((t: string) => {
               if(!newTools.includes(t)) newTools.push(t);
             });
             return newTools;
           });
           
           setLastMitre(payload.data.mitre_id);
           setCompromisedNodes(prev => [...new Set([...prev, payload.data.target])]);
           setAttackerInfo({ ip: payload.data.attacker_ip, location: payload.data.attacker_location });
           setRawLogs(prev => [payload.data.raw_packet, ...prev].slice(0, 50));
           
           const newId = Date.now();
           setNotifications(prev => [{ id: newId, text: `ALERT: ${payload.data.action} from ${payload.data.attacker_ip}` }, ...prev].slice(0, 3));
           setTimeout(() => {
             setNotifications(prev => prev.filter(n => n.id !== newId));
           }, 5000);
           
           if (payload.data.target === 'WAN') {
             setActivePath({ from: 'WAN', to: 'WAN' });
           } else if (payload.data.target === 'FW1') {
             setActivePath({ from: 'WAN', to: 'FW1' });
           } else {
             setActivePath({ from: 'FW1', to: payload.data.target });
           }

           setActiveThreat(prev => Math.min(prev + 0.8, 10));
        }
      } catch (err) {
        console.error("WebSocket message parsing error:", err);
      }
    };

    ws.onclose = () => console.log("WebSocket Disconnected");
    return () => ws.close();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setWastedTime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo">
          <ShieldAlert size={28} className="logo-accent" />
          DECEPT<span className="logo-accent">O</span>R
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px', color: 'var(--accent-red)', alignItems: 'center' }}>
            <Activity className="logo-accent" size={18} color="var(--accent-red)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px' }}>
              LIVE ATTACK: <span style={{ color: '#fff', background: 'var(--accent-red)', padding: '2px 6px', borderRadius: '4px', marginLeft: '4px' }}>{lastMitre}</span>
            </span>
          </div>
        </div>
      </header>

      {/* Left Panel: Agent Chatter */}
      <div className="panel" style={{ gridColumn: '1', gridRow: '2' }}>
        <div className="panel-header">
          <Terminal size={16} /> Autonomous Defense Agents
        </div>
        <div className="panel-content">
          <div className="chat-container">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.type}`}>
                <div className="agent-name">{msg.agent}</div>
                <div className="agent-text">{msg.text}</div>
              </div>
            ))}
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
              <Ping size={12} className="logo-accent" style={{ animation: 'pulse 1.5s infinite' }} /> Listening to WebSocket...
            </div>
          </div>
        </div>
      </div>

      {/* Center Panel: Network Map + Terminal */}
      <div className="panel" style={{ gridColumn: '2', gridRow: '2' }}>
        <div className="panel-header">
          <Network size={16} /> Active Topography
        </div>
        <div className="panel-content" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
          <div className="network-map" style={{ height: '400px', position: 'relative', flexShrink: 0 }}>
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}>
              {connections.map((c, i) => {
                const fromNode = initialNodes.find(n => n.id === c.from);
                const toNode = initialNodes.find(n => n.id === c.to);
                if (!fromNode || !toNode) return null;
                const isActive = (activePath?.from === c.from && activePath?.to === c.to) || 
                               (compromisedNodes.includes(c.from) && compromisedNodes.includes(c.to));
                
                return (
                  <g key={i}>
                    <line 
                      x1={fromNode.x + 30} 
                      y1={fromNode.y + 30} 
                      x2={toNode.x + 30} 
                      y2={toNode.y + 30} 
                      stroke={isActive ? 'var(--accent-red)' : 'var(--bg-panel-border)'}
                      strokeWidth={isActive ? 2 : 1}
                      style={{ transition: 'stroke 0.5s ease' }}
                    />
                    {activePath?.from === c.from && activePath?.to === c.to && (
                      <circle r="4" fill="var(--accent-red)">
                        <animateMotion 
                          dur="1.5s" 
                          repeatCount="indefinite" 
                          path={`M ${fromNode.x + 30} ${fromNode.y + 30} L ${toNode.x + 30} ${toNode.y + 30}`} 
                        />
                        <animate r="2;6;2" dur="1s" repeatCount="indefinite" />
                      </circle>
                    )}
                  </g>
                );
              })}
            </svg>

            {initialNodes.map(node => {
              const Icon = node.icon;
              return (
                <div 
                  key={node.id} 
                  className={`node ${node.type} ${compromisedNodes.includes(node.id) ? 'compromised' : ''}`}
                  style={{ left: node.x, top: node.y }}
                >
                  <Icon size={20} />
                  <span>{node.id}</span>
                </div>
              );
            })}
          </div>

          <div className="dpi-terminal" style={{ flex: 1, borderTop: '1px solid var(--bg-panel-border)' }}>
            <div className="terminal-header">
              <Terminal size={12} /> DEEP PACKET INSPECTION (RAW LOGS)
            </div>
            <div className="terminal-body" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {rawLogs.map((log, i) => (
                <div key={i} className="terminal-line">
                  <span className="timestamp">[{new Date().toLocaleTimeString()}]</span> {log}
                </div>
              ))}
              {rawLogs.length === 0 && <div className="terminal-line muted">Awaiting ingest...</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Live Threat Intel */}
      <div className="panel" style={{ gridColumn: '3', gridRow: '2' }}>
        <div className="panel-header">
          <Crosshair size={16} /> Threat Intel Engine
        </div>
        <div className="panel-content">
          <div className="stat-card" style={{ padding: '12px' }}>
            <div className="stat-title">Attacker Origin</div>
            <div className="map-container" style={{ height: '100px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', position: 'relative' }}>
              <svg viewBox="0 0 200 100" style={{ width: '100%', height: '100%', fill: 'var(--bg-panel-border)' }}>
                <path d="M10,40 Q30,20 50,40 T90,40 T130,40 T170,40 T190,60 L190,90 L10,90 Z" />
                <circle cx={attackerInfo.location.includes('CN') ? 160 : attackerInfo.location.includes('RU') ? 130 : 150} cy="45" r="3" fill="var(--accent-red)">
                  <animate attributeName="r" values="2;5;2" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0.2;1" dur="1.5s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>
            <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>IP: <b style={{ color: 'var(--accent-cyan)' }}>{attackerInfo.ip}</b></span>
              <span style={{ color: 'var(--text-secondary)' }}>LOC: <b style={{ color: 'var(--accent-red)' }}>{attackerInfo.location}</b></span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-title"><Clock size={12} style={{display:'inline', marginRight:'4px'}}/> Time Wasted</div>
            <div className="stat-value safe">{formatTime(wastedTime)}</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title"><Fingerprint size={12} style={{display:'inline', marginRight:'4px'}}/> Sophistication Score</div>
            <div className="stat-value danger">
              {activeThreat.toFixed(1)}<span style={{fontSize: '1rem', color: 'var(--text-secondary)'}}>/10</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-title">Tools Detected</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
              {tools.length === 0 && <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontStyle: 'italic' }}>Analyzing...</span>}
              {tools.map((t, i) => (
                <span key={i} style={{ padding: '4px 8px', background: 'var(--bg-dark)', border: '1px solid var(--accent-cyan)', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)'}}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-title">Real Systems Compromised</div>
            <div className="stat-value safe" style={{ color: 'var(--accent-green)'}}>0</div>
          </div>
        </div>
      </div>

      <div className="notification-toast-container">
        {notifications.map(n => (
          <div key={n.id} className="toast">
            <ShieldAlert size={14} /> {n.text}
          </div>
        ))}
      </div>
    </div>
  );
}
