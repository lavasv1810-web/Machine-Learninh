import { useEffect, useRef, useState } from 'react';
import {
  ShieldAlert,
  Activity,
  Terminal,
  Network,
  Server,
  Database,
  Globe,
  ShieldCheck,
  ListChecks,
  Zap,
  Layers,
  PieChart,
} from 'lucide-react';

const initialNodes = [
  { id: 'WAN', label: 'Internet', x: 80, y: 160, type: 'attacker', icon: Globe },
  { id: 'FW1', label: 'Firewall', x: 260, y: 160, type: 'real', icon: ShieldAlert },
  { id: 'WEB1', label: 'Main App', x: 460, y: 100, type: 'real', icon: Server },
  { id: 'DB1', label: 'Core DB', x: 460, y: 260, type: 'real', icon: Database },
  { id: 'API_FA1', label: 'Staging API', x: 620, y: 100, type: 'fake', icon: Network },
  { id: 'API_FA2', label: 'Hidden API', x: 760, y: 160, type: 'fake', icon: Network },
  { id: 'WEB_FA1', label: 'Legacy Portal', x: 320, y: 340, type: 'fake', icon: Server },
  { id: 'HON1', label: 'Honeypot A', x: 520, y: 420, type: 'fake', icon: Database },
  { id: 'DB_FA2', label: 'Audit DB', x: 700, y: 420, type: 'fake', icon: Database },
];

const connections = [
  { from: 'WAN', to: 'FW1' },
  { from: 'FW1', to: 'WEB1' },
  { from: 'WEB1', to: 'DB1' },
  { from: 'FW1', to: 'WEB_FA1' },
  { from: 'WEB_FA1', to: 'HON1' },
  { from: 'HON1', to: 'DB_FA2' },
  { from: 'WEB1', to: 'API_FA1' },
  { from: 'API_FA1', to: 'API_FA2' },
];

type DemoAttackEvent = {
  tools: string[];
  mitre_id: string;
  target: string;
  attacker_ip: string;
  attacker_location: string;
  raw_packet: string;
  action: string;
};

type DemoPrediction = {
  predicted_response: string;
  next_likely_target: string;
  confidence: number;
  explanation: string;
};

type DemoStep = {
  attackerEvent: DemoAttackEvent;
  messages: { agent: string; content: string }[];
  analysis: string[];
  mitigations: string[];
  threatLevel: number;
  compromised: string[];
  activePath: { from: string; to: string } | null;
  activeAgents: string[];
  prediction: DemoPrediction;
  resolved?: boolean;
};

const demoSequence: DemoStep[] = [
  {
    attackerEvent: {
      tools: ['Nmap'],
      mitre_id: 'T1595',
      target: 'FW1',
      attacker_ip: '203.0.113.12',
      attacker_location: 'Unknown Region',
      raw_packet: 'SYN flood from 203.0.113.12 to port 443',
      action: 'Port scan detected',
    },
    messages: [
      { agent: 'Attacker', content: 'Attacker: Running reconnaissance against perimeter firewall' },
      { agent: 'Behavioral Monitor', content: 'Behavioral Monitor: Unusual scan fingerprint detected, elevating threat score' },
    ],
    analysis: ['Reconnaissance identified at firewall edge', 'Attack surface narrowing in progress'],
    mitigations: ['Enforce firewall rate limiting', 'Sinkhole suspicious IPs'],
    prediction: {
      predicted_response: 'Monitor and delay',
      next_likely_target: 'WEB_FA1',
      confidence: 0.85,
      explanation: 'Reconnaissance behavior suggests low-risk observation; keep attacker engaged and gather intel.',
    },
    threatLevel: 2.8,
    compromised: ['FW1'],
    activePath: { from: 'WAN', to: 'FW1' },
    activeAgents: ['Behavioral Monitor', 'Threat Profiler'],
  },
  {
    attackerEvent: {
      tools: ['SQLMap'],
      mitre_id: 'T1190',
      target: 'WEB1',
      attacker_ip: '203.0.113.12',
      attacker_location: 'Unknown Region',
      raw_packet: 'POST /login HTTP/1.1 with suspicious payload',
      action: 'Application exploitation attempt',
    },
    messages: [
      { agent: 'Attacker', content: 'Attacker: Sending crafted SQL payload to main app' },
      { agent: 'Decoy Architect', content: 'Decoy Architect: Redirecting exploit attempt into decoy realm' },
      { agent: 'Lure Designer', content: 'Lure Designer: Serving fake credentials to keep attacker engaged' },
    ],
    analysis: ['Potential SQL injection attempt', 'Deceptive decoy session engaged'],
    mitigations: ['Apply WAF rule for SQL patterns', 'Activate honeypot response path'],
    prediction: {
      predicted_response: 'Redirect to fake service',
      next_likely_target: 'DB_FA1',
      confidence: 0.78,
      explanation: 'Detected exploitation attempt on the main app; reroute into deception to protect critical assets.',
    },
    threatLevel: 5.5,
    compromised: ['FW1', 'WEB1'],
    activePath: { from: 'FW1', to: 'WEB1' },
    activeAgents: ['Decoy Architect', 'Lure Designer', 'Threat Profiler'],
  },
  {
    attackerEvent: {
      tools: ['Mimikatz'],
      mitre_id: 'T1550',
      target: 'DB1',
      attacker_ip: '203.0.113.12',
      attacker_location: 'Unknown Region',
      raw_packet: 'DB auth handshake completed from anomalous source',
      action: 'Lateral movement detected',
    },
    messages: [
      { agent: 'Attacker', content: 'Attacker: Pivoting into the database backend' },
      { agent: 'Honeypot Operator', content: 'Honeypot Operator: Capturing attacker telemetry inside deceptive asset' },
      { agent: 'Forensic Analyzer', content: 'Forensic Analyzer: Logging all malicious activity for investigation' },
    ],
    analysis: ['Lateral movement to database observed', 'Deception traps are isolating attacker activity'],
    mitigations: ['Isolate suspicious database sessions', 'Preserve forensic artifacts'],
    prediction: {
      predicted_response: 'Deploy trap and isolate DB',
      next_likely_target: 'API_FA1',
      confidence: 0.82,
      explanation: 'Lateral movement toward database resources is high-risk; isolate and trap the attacker.',
    },
    threatLevel: 7.1,
    compromised: ['FW1', 'WEB1', 'DB1'],
    activePath: { from: 'WEB1', to: 'DB1' },
    activeAgents: ['Honeypot Operator', 'Forensic Analyzer'],
  },
  {
    attackerEvent: {
      tools: ['Cobalt Strike'],
      mitre_id: 'T1105',
      target: 'API_FA1',
      attacker_ip: '203.0.113.12',
      attacker_location: 'Unknown Region',
      raw_packet: 'Data exfiltration channel opened to hidden API',
      action: 'Credential harvesting attempt',
    },
    messages: [
      { agent: 'Attacker', content: 'Attacker: Establishing covert channel into staging API' },
      { agent: 'Signal Distributor', content: 'Signal Distributor: Diverting attacker to fake API endpoint' },
      { agent: 'Adaptation Agent', content: 'Adaptation Agent: Tweaking defense posture based on attacker behavior' },
    ],
    analysis: ['Covert command-and-control behavior detected', 'Attacker diverted to deception assets'],
    mitigations: ['Block outbound C2 traffic', 'Rotate deceptive endpoints'],
    prediction: {
      predicted_response: 'Terminate channel and redirect',
      next_likely_target: 'API_FA2',
      confidence: 0.9,
      explanation: 'Exfiltration-like behavior detected; terminate the connection and divert the attacker toward deception.',
    },
    threatLevel: 8.4,
    compromised: ['FW1', 'WEB1', 'DB1', 'API_FA1'],
    activePath: { from: 'WEB1', to: 'API_FA1' },
    activeAgents: ['Signal Distributor', 'Adaptation Agent'],
  },
  {
    attackerEvent: {
      tools: ['Unknown'],
      mitre_id: 'T1562',
      target: 'FW1',
      attacker_ip: '203.0.113.12',
      attacker_location: 'Unknown Region',
      raw_packet: 'Connection reset by defensive controls',
      action: 'Containment succeed',
    },
    messages: [
      { agent: 'Retreat Controller', content: 'Retreat Controller: Containing attacker session and locking down impacted segments' },
      { agent: 'Intelligence Agent', content: 'Intelligence Agent: Compiling incident report and attacker timeline' },
    ],
    analysis: ['Attack flow contained', 'Recovery and follow-up recommended'],
    mitigations: ['Lock down suspicious sessions', 'Begin post-incident review'],
    prediction: {
      predicted_response: 'Cut channel and preserve evidence',
      next_likely_target: 'FW1',
      confidence: 0.94,
      explanation: 'Containment is required after the attack reached critical infrastructure; preserve forensic evidence.',
    },
    threatLevel: 3.2,
    compromised: ['FW1', 'WEB1', 'DB1', 'API_FA1'],
    activePath: { from: 'FW1', to: 'FW1' },
    activeAgents: ['Retreat Controller', 'Intelligence Agent'],
    resolved: true,
  },
];

const initialAgentStatuses = [
  { id: 'behavioral_monitor', label: 'Behavioral Monitor', role: 'Behavior Analysis', status: 'Standby' },
  { id: 'threat_profiler', label: 'Threat Profiler', role: 'Threat Scoring', status: 'Standby' },
  { id: 'decoy_architect', label: 'Decoy Architect', role: 'Deception Design', status: 'Standby' },
  { id: 'lure_designer', label: 'Lure Designer', role: 'Breadcrumbing', status: 'Standby' },
  { id: 'distraction_coordinator', label: 'Distraction Coordinator', role: 'Attacker Engagement', status: 'Standby' },
  { id: 'honeypot_operator', label: 'Honeypot Operator', role: 'Trap Management', status: 'Standby' },
  { id: 'adaptation_agent', label: 'Adaptation Agent', role: 'WAF Adjustments', status: 'Standby' },
  { id: 'forensic_analyzer', label: 'Forensic Analyzer', role: 'Evidence Collection', status: 'Standby' },
  { id: 'signal_distributor', label: 'Signal Distributor', role: 'Telemetry Misdirection', status: 'Standby' },
  { id: 'threat_sharing', label: 'Threat Sharing', role: 'IOC Exchange', status: 'Standby' },
  { id: 'retreat_controller', label: 'Retreat Controller', role: 'Asset Isolation', status: 'Standby' },
  { id: 'intelligence_agent', label: 'Intelligence Agent', role: 'Reporting', status: 'Standby' },
];

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('deceptor_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('deceptor_theme', theme);
  }, [theme]);


  const [messages, setMessages] = useState<{ agent: string; type: string; text: string }[]>([]);
  const [agentStatuses, setAgentStatuses] = useState(initialAgentStatuses);
  const [tools, setTools] = useState<string[]>([]);
  const [activeThreat, setActiveThreat] = useState(1);
  const [lastMitre, setLastMitre] = useState('T1046');
  const [activePath, setActivePath] = useState<{ from: string; to: string } | null>(null);
  const [compromisedNodes, setCompromisedNodes] = useState<string[]>([]);
  const [attackerInfo, setAttackerInfo] = useState({ ip: '---', location: '---' });
  const [rawLogs, setRawLogs] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<{ id: number; text: string }[]>([]);
  const [incidentAnalysis, setIncidentAnalysis] = useState<string[]>([]);
  const [mitigations, setMitigations] = useState<string[]>([]);
  const [attackResolved, setAttackResolved] = useState(false);
  const [mlPrediction, setMlPrediction] = useState<{ predicted_response: string; next_likely_target: string; confidence: number; explanation: string }>({
    predicted_response: 'Awaiting prediction',
    next_likely_target: 'Unknown',
    confidence: 0,
    explanation: 'Waiting for the adaptive ML model to determine the best deception response.',
  });
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [demoIndex, setDemoIndex] = useState(0);
  const demoTimer = useRef<number | null>(null);

  const resetSimulationState = () => {
    setMessages([]);
    setTools([]);
    setCompromisedNodes([]);
    setAttackerInfo({ ip: '203.0.113.12', location: 'Simulated Network' });
    setRawLogs([]);
    setNotifications([]);
    setIncidentAnalysis([]);
    setMitigations([]);
    setAttackResolved(false);
    setMlPrediction({
      predicted_response: 'Awaiting prediction',
      next_likely_target: 'Unknown',
      confidence: 0,
      explanation: 'Waiting for the adaptive ML model to determine the best deception response.',
    });
    setActiveThreat(1);
    setLastMitre('T1046');
    setAgentStatuses(initialAgentStatuses);
    setActivePath(null);
  };

  const clearDemoTimer = () => {
    if (demoTimer.current !== null) {
      window.clearTimeout(demoTimer.current);
      demoTimer.current = null;
    }
  };

  const applyDemoStep = (step: DemoStep) => {
    setTools((prev) => {
      const next = [...prev];
      step.attackerEvent.tools.forEach((tool) => {
        if (!next.includes(tool)) next.push(tool);
      });
      return next;
    });

    setLastMitre(step.attackerEvent.mitre_id);
    setCompromisedNodes(step.compromised);
    setAttackerInfo({ ip: step.attackerEvent.attacker_ip, location: step.attackerEvent.attacker_location });
    setRawLogs((prev) => [step.attackerEvent.raw_packet, ...prev].slice(0, 50));
    setActivePath(step.activePath);
    setActiveThreat(step.threatLevel);
    setIncidentAnalysis(step.analysis);
    setMitigations(step.mitigations);
    setAttackResolved(step.resolved ?? false);

    const newMessages = step.messages.map((msg) => {
      let msgType = 'system';
      if (msg.content.startsWith('Behavioral Monitor') || msg.content.startsWith('Adaptation') || msg.content.startsWith('Forensic Analyzer') || msg.content.startsWith('Retreat Controller') || msg.content.startsWith('Intelligence Agent')) msgType = 'defense';
      if (msg.content.startsWith('Attacker')) msgType = 'attacker';
      if (msg.content.startsWith('Lure Designer') || msg.content.startsWith('Decoy Architect') || msg.content.startsWith('Signal Distributor') || msg.content.startsWith('Honeypot Operator')) msgType = 'deception';

      const agentNameMatch = msg.content.match(/^([\w\s]+):/);
      const agentName = agentNameMatch ? agentNameMatch[1] : msg.agent;

      return { agent: agentName, type: msgType, text: msg.content };
    });

    setMessages((prev) => [...prev, ...newMessages].slice(-24));
    setMlPrediction(step.prediction);
    setAgentStatuses(initialAgentStatuses.map((agent) => ({
      ...agent,
      status: step.activeAgents.includes(agent.label) ? 'Active' : 'Standby',
    })));

    const newId = Date.now();
    setNotifications((prev) => [{ id: newId, text: `DEMO: ${step.attackerEvent.action} (${step.attackerEvent.attacker_ip})` }, ...prev].slice(0, 4));
    window.setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== newId)), 5500);
  };

  const startDemoSimulation = () => {
    resetSimulationState();
    setDemoIndex(0);
    setIsDemoActive(true);
  };

  const stopDemoSimulation = () => {
    clearDemoTimer();
    setIsDemoActive(false);
    setDemoIndex(0);
  };

  const statusCards = [
    {
      icon: Activity,
      title: 'Live Threat',
      value: lastMitre,
      tone: 'danger',
      description: 'Current MITRE focus',
    },
    {
      icon: ShieldCheck,
      title: 'Defense State',
      value: attackResolved ? 'Containment' : 'Engaged',
      tone: attackResolved ? 'safe' : 'warning',
      description: attackResolved ? 'Attack contained' : 'Response active',
    },
    {
      icon: Zap,
      title: 'Threat Score',
      value: `${activeThreat.toFixed(1)}/10`,
      tone: 'danger',
      description: 'Real-time severity index',
    },
    {
      icon: PieChart,
      title: 'Tool Count',
      value: String(tools.length),
      tone: 'cyan',
      description: 'Detected attacker tooling',
    },
  ];

  useEffect(() => {
    if (isDemoActive) return;

    const ws = new WebSocket('ws://127.0.0.1:8000/ws/attack-stream');

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        if (payload.type === 'AGENT_CHATTER') {
          const text: string = payload.data.text;
          let msgType = 'system';
          if (text.startsWith('Behavioral Monitor') || text.startsWith('Adaptation') || text.startsWith('Forensic Analyzer')) msgType = 'defense';
          if (text.startsWith('Attacker')) msgType = 'attacker';
          if (text.startsWith('Lure Designer') || text.startsWith('Decoy Architect') || text.startsWith('Signal Distributor')) msgType = 'deception';

          const agentNameMatch = text.match(/^([\w\s]+):/);
          const agentName = agentNameMatch ? agentNameMatch[1] : payload.data.agent;

          setMessages((prev) => [...prev, { agent: agentName, type: msgType, text }].slice(-24));
        }

        if (payload.type === 'ATTACKER_ACTION') {
          setTools((prev) => {
            const newTools = [...prev];
            payload.data.tools.forEach((t: string) => {
              if (!newTools.includes(t)) newTools.push(t);
            });
            return newTools;
          });

          setLastMitre(payload.data.mitre_id);
          setCompromisedNodes((prev) => [...new Set([...prev, payload.data.target])]);
          setAttackerInfo({ ip: payload.data.attacker_ip, location: payload.data.attacker_location });
          setRawLogs((prev) => [payload.data.raw_packet, ...prev].slice(0, 50));
          setAttackResolved(false);

          const newId = Date.now();
          setNotifications((prev) => [{ id: newId, text: `ALERT: ${payload.data.action} from ${payload.data.attacker_ip}` }, ...prev].slice(0, 4));
          setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== newId)), 5500);

          if (payload.data.target === 'WAN') {
            setActivePath({ from: 'WAN', to: 'WAN' });
          } else if (payload.data.target === 'FW1') {
            setActivePath({ from: 'WAN', to: 'FW1' });
          } else {
            setActivePath({ from: 'FW1', to: payload.data.target });
          }

          setActiveThreat((prev) => Math.min(prev + 0.9, 10));
        }

        if (payload.type === 'ANALYSIS_UPDATE') {
          setIncidentAnalysis(payload.data.analysis || []);
          setMitigations(payload.data.mitigations || []);
          setAttackResolved(payload.data.resolved || false);
          setActiveThreat(payload.data.active_threat_level ?? activeThreat);
        }

        if (payload.type === 'ML_PREDICTION') {
          setMlPrediction({
            predicted_response: payload.data.predicted_response,
            next_likely_target: payload.data.next_likely_target,
            confidence: payload.data.confidence,
            explanation: payload.data.explanation || 'Adaptive model explanation unavailable.',
          });
        }

        if (payload.type === 'AGENT_CHATTER') {
          const agentName = payload.data.agent;
          setAgentStatuses((prev) => prev.map((agent) => (agent.label === agentName ? { ...agent, status: 'Active' } : agent)));
        }
      } catch (err) {
        console.error('WebSocket message parsing error:', err);
      }
    };

    ws.onclose = () => console.log('WebSocket Disconnected');
    return () => ws.close();
  }, [isDemoActive]);

  useEffect(() => {
    if (!isDemoActive) return;
    if (demoIndex >= demoSequence.length) {
      setIsDemoActive(false);
      return;
    }

    clearDemoTimer();
    demoTimer.current = window.setTimeout(() => {
      applyDemoStep(demoSequence[demoIndex]);
      setDemoIndex((value) => value + 1);
    }, 1300);

    return () => clearDemoTimer();
  }, [isDemoActive, demoIndex]);

  return (
    <div className="dashboard-shell">
      <header className="topbar">
        <div className="brand-panel">
          <div className="brand-title">
            <ShieldAlert size={30} className="brand-icon" />
            <div>
              <h1>DECEPTOR</h1>
              <p>Real-time attack analysis and deception operations</p>
            </div>
          </div>
          <div className="summary-pill">
            <span>Interface overhaul active</span>
            <strong>Major redesign delivered</strong>
          </div>
          <div className="demo-actions">
            <button
              type="button"
              className={`demo-button ${isDemoActive ? 'demo-stop' : 'demo-start'}`}
              onClick={isDemoActive ? stopDemoSimulation : startDemoSimulation}
            >
              {isDemoActive ? 'Stop Demo' : 'Launch Demo'}
            </button>
            {isDemoActive && <span className="demo-badge">Demo Live</span>}
          </div>
        </div>

        <div className="top-status-grid">
          <div className="status-card status-cyan" style={{ alignItems: 'center' }}>
            <div style={{ display: 'grid', placeItems: 'center', width: 42, height: 42, borderRadius: 14, background: 'rgba(56, 189, 248, 0.14)' }}>
              <Layers size={18} />
            </div>
            <div>
              <div className="status-label">Theme</div>
              <div className="status-value" style={{ fontSize: '1.1rem' }}>{theme === 'dark' ? 'Dark' : 'Light'}</div>
              <button
                type="button"
                className="demo-button"
                style={{ padding: '8px 12px', marginTop: 8, borderRadius: 999, fontWeight: 700 }}
                onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
              >
                Toggle
              </button>
            </div>
          </div>

          {statusCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className={`status-card status-${card.tone}`}>
                <div className="status-icon"><Icon size={18} /></div>
                <div>
                  <div className="status-label">{card.title}</div>
                  <div className="status-value">{card.value}</div>
                  <div className="status-desc">{card.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </header>

      <main className="main-grid">
        <section className="panel attack-feed">
          <div className="panel-header">
            <ListChecks size={18} /> Attack Stream & Incident Feed
          </div>
          <div className="panel-content split-column">
            <div className="feed-list">
              {messages.slice().reverse().map((msg, idx) => (
                <div key={idx} className={`feed-item ${msg.type}`}>
                  <div className="feed-meta">
                    <span>{msg.agent}</span>
                    <span>{msg.type.toUpperCase()}</span>
                  </div>
                  <p>{msg.text}</p>
                </div>
              ))}
              {messages.length === 0 && <div className="empty-state">Awaiting live attack chatter...</div>}
            </div>

            <div className="log-panel">
              <div className="log-header"><Terminal size={14} /> Live Packet Capture</div>
              <div className="log-body">
                {rawLogs.map((log, i) => (
                  <div key={i} className="log-line">
                    <span className="timestamp">[{new Date().toLocaleTimeString()}]</span> {log}
                  </div>
                ))}
                {rawLogs.length === 0 && <div className="empty-state">No raw packets yet.</div>}
              </div>
            </div>
          </div>
        </section>

        <section className="panel network-view">
          <div className="panel-header">
            <Network size={18} /> Network Deception Map
          </div>
          <div className="panel-content">
            <div className="topology-shell">
              <svg className="topology-grid" viewBox="0 0 900 520">
                {connections.map((c, i) => {
                  const fromNode = initialNodes.find((n) => n.id === c.from);
                  const toNode = initialNodes.find((n) => n.id === c.to);
                  if (!fromNode || !toNode) return null;
                  const active = activePath?.from === c.from && activePath?.to === c.to;
                  return (
                    <line
                      key={i}
                      x1={fromNode.x + 30}
                      y1={fromNode.y + 30}
                      x2={toNode.x + 30}
                      y2={toNode.y + 30}
                      className={active ? 'connection-line active' : 'connection-line'}
                    />
                  );
                })}
              </svg>
              {initialNodes.map((node) => {
                const Icon = node.icon;
                const isCompromised = compromisedNodes.includes(node.id);
                return (
                  <div
                    key={node.id}
                    className={`topology-node ${node.type} ${isCompromised ? 'compromised' : ''}`}
                    style={{ left: node.x, top: node.y }}
                  >
                    <Icon size={18} />
                    <span>{node.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="node-summary">
              <div>
                <strong>Active Link</strong>
                <p>{activePath ? `${activePath.from} → ${activePath.to}` : 'No active flow'}</p>
              </div>
              <div>
                <strong>Compromised</strong>
                <p>{compromisedNodes.join(', ') || 'None'}</p>
              </div>
              <div>
                <strong>Attacker Profile</strong>
                <p>{attackerInfo.ip} · {attackerInfo.location}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="panel agent-hub">
          <div className="panel-header">
            <Layers size={18} /> Agent Orchestration Hub
          </div>
          <div className="panel-content agent-grid">
            {agentStatuses.map((agent) => (
              <div key={agent.id} className={`agent-card ${agent.status === 'Active' ? 'agent-active' : ''}`}>
                <div>
                  <h3>{agent.label}</h3>
                  <p>{agent.role}</p>
                </div>
                <span className={`chip ${agent.status === 'Active' ? 'chip-active' : 'chip-standby'}`}>{agent.status}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel analysis-hub">
          <div className="panel-header">
            <ShieldCheck size={18} /> Incident Analysis & Response
          </div>
          <div className="panel-content">
            <div className="analysis-block">
              <div className="analysis-title">
                <span>Threat Interpretation</span>
                <span className="tag">Live</span>
              </div>
              {incidentAnalysis.length === 0 ? (
                <div className="empty-state">No analysis received yet.</div>
              ) : (
                incidentAnalysis.map((line, idx) => <div key={idx} className="analysis-line">{line}</div>)
              )}
            </div>

            <div className="analysis-block">
              <div className="analysis-title">
                <span>Mitigation Actions</span>
                <Zap size={14} />
              </div>
              {mitigations.length === 0 ? (
                <div className="empty-state">Waiting for defense response...</div>
              ) : (
                mitigations.map((item, idx) => <div key={idx} className="analysis-line">{item}</div>)
              )}
            </div>

            <div className="analysis-block prediction-block">
              <div className="analysis-title">
                <span>ML Prediction</span>
                <span className="tag">Adaptive</span>
              </div>
              <div className="analysis-line"><strong>Response:</strong> {mlPrediction.predicted_response}</div>
              <div className="analysis-line"><strong>Next target:</strong> {mlPrediction.next_likely_target}</div>
              <div className="analysis-line"><strong>Confidence:</strong> {Math.round(mlPrediction.confidence * 100)}%</div>
              <div className="prediction-explanation">
                <strong>Why:</strong> {mlPrediction.explanation}
              </div>
            </div>

            <div className="resolution-strip">
              <div>
                <span>Resolution</span>
                <strong>{attackResolved ? 'Contained' : 'Escalating'}</strong>
              </div>
              <div className={attackResolved ? 'status-pill safe' : 'status-pill danger'}>
                {attackResolved ? 'Resolved' : 'Active' }
              </div>
            </div>
          </div>
        </section>
      </main>

      <div className="toast-wrapper">
        {notifications.map((notice) => (
          <div key={notice.id} className="toast-card">
            <ShieldAlert size={16} />
            <span>{notice.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
