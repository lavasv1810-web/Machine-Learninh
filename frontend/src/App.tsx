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
  { from: 'WAN', to: 'FW1', active: false },
  { from: 'FW1', to: 'WEB1', active: false },
  { from: 'WEB1', to: 'DB1', active: false },
  { from: 'FW1', to: 'WEB_FA1', active: true },
  { from: 'WEB_FA1', to: 'DB_FA1', active: true },
  { from: 'FW1', to: 'API_FA1', active: false },
];

export default function App() {
  const [messages, setMessages] = useState<{agent: string, type: string, text: string}[]>([]);
  const [wastedTime, setWastedTime] = useState(0);
  const [tools, setTools] = useState<string[]>([]);
  const [activeThreat, setActiveThreat] = useState(1);

  // Connection to Backend API
  useEffect(() => {
    const ws = new WebSocket("ws://127.0.0.1:8000/ws/attack-stream");

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        
        if (payload.type === 'AGENT_CHATTER') {
          const text: string = payload.data.text;
          
          // Determine CSS theme based on the agent talking
          let msgType = 'system';
          if (text.startsWith('Behavioral Monitor') || text.startsWith('Adaptation')) msgType = 'defense';
          if (text.startsWith('Attacker')) msgType = 'attacker';
          if (text.startsWith('Lure Designer') || text.startsWith('Decoy')) msgType = 'system';

          // Extract agent name from the colon prefix natively if possible
          const agentNameMatch = text.match(/^([\w\s]+):/);
          const agentName = agentNameMatch ? agentNameMatch[1] : payload.data.agent;

          setMessages(prev => [...prev, {
            agent: agentName,
            type: msgType,
            text: text
          }]);
        }
        
        if (payload.type === 'ATTACKER_ACTION') {
           // Gather tools used from the attacker simulation
           setTools(prev => {
             const newTools = [...prev];
             payload.data.tools.forEach((t: string) => {
               if(!newTools.includes(t)) newTools.push(t);
             });
             return newTools;
           });
           
           // Increase active threat level mock visual
           setActiveThreat(prev => prev + 1.5);
        }
      } catch (err) {
        console.error("WebSocket message parsing error:", err);
      }
    };

    ws.onclose = () => console.log("WebSocket Disconnected");
    
    return () => {
      ws.close();
    };
  }, []);

  // Threat Time Ticker
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
            <span style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px' }}>LIVE ATTACK DETECTED</span>
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

      {/* Center Panel: Network Map */}
      <div className="panel" style={{ gridColumn: '2', gridRow: '2' }}>
        <div className="panel-header">
          <Network size={16} /> Active Topography
        </div>
        <div className="panel-content" style={{ padding: 0 }}>
          <div className="network-map">
            {/* SVG Connections */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}>
              {connections.map((c, i) => {
                const fromNode = initialNodes.find(n => n.id === c.from);
                const toNode = initialNodes.find(n => n.id === c.to);
                if (!fromNode || !toNode) return null;
                return (
                  <line 
                    key={i}
                    x1={fromNode.x + 30} 
                    y1={fromNode.y + 30} 
                    x2={toNode.x + 30} 
                    y2={toNode.y + 30} 
                    stroke={c.active ? 'var(--accent-red)' : 'var(--bg-panel-border)'}
                    strokeWidth={c.active ? 2 : 1}
                    style={{
                      filter: c.active ? 'drop-shadow(0 0 5px var(--accent-red))' : 'none'
                    }}
                  />
                );
              })}
            </svg>

            {/* Nodes */}
            {initialNodes.map(node => {
              const Icon = node.icon;
              return (
                <div 
                  key={node.id} 
                  className={`node ${node.type} ${node.type === 'fake' && messages.length > 3 ? 'compromised' : ''}`}
                  style={{ left: node.x, top: node.y }}
                >
                  <Icon size={20} />
                  <span>{node.id}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Panel: Live Threat Intel */}
      <div className="panel" style={{ gridColumn: '3', gridRow: '2' }}>
        <div className="panel-header">
          <Crosshair size={16} /> Threat Intel Engine
        </div>
        <div className="panel-content">
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
              {tools.length === 0 && <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontStyle: 'italic' }}>Analyzing packets...</span>}
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
    </div>
  );
}
