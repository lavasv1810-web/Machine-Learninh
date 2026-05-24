import os
import json
from typing import TypedDict, Annotated, Sequence
import operator
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, START, END
from dotenv import load_dotenv

load_dotenv()

class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]
    attacker_events: list[dict]
    active_threat_level: int
    tools_detected: list[str]
    mitigations: list[str]
    analysis: list[str]
    resolved: bool

# Note: The GROQ_API_KEY must be in the environment to instantiate this
try:
    llm = ChatGroq(model="llama-3.3-70b-versatile")
except Exception:
    class DummyLLM:
        def invoke(self, messages):
            return AIMessage(content="[Simulated response due to missing API Key]")
    llm = DummyLLM()


def behavioral_monitor_node(state: AgentState):
    """Watches how attackers interact with decoys."""

    latest_event = state["attacker_events"][-1] if state["attacker_events"] else None
    if not latest_event:
        return state

    prompt = (
        "Behavioral Monitor: Analyze this attacker event and classify the attacker. "
        f"Event={json.dumps(latest_event)}"
    )
    try:
        response = llm.invoke([HumanMessage(content=prompt)])
        content = response.content
    except Exception:
        content = "[Simulated response due to unavailable LLM service]"
    return {
        "messages": [AIMessage(content=f"Behavioral Monitor: {content}")],
        "tools_detected": latest_event.get("tools", []),
    }


def severity_score(mitre_id: str) -> int:
    profile = {
        "T1046": 2,
        "T1110": 4,
        "T1210": 5,
        "T1190": 6,
        "T1041": 7,
        "T1078": 6,
        "T1059": 5,
    }
    return profile.get(mitre_id, 3)


def threat_profiler_node(state: AgentState):
    """Builds attacker profiles from behavior."""
    latest_event = state["attacker_events"][-1] if state["attacker_events"] else {}
    level = state.get("active_threat_level", 1)
    score = severity_score(latest_event.get("mitre_id", ""))
    new_level = min(10, level + score // 2)
    analysis = f"Threat Profiler: Incident severity scored {score}/10 for {latest_event.get('mitre_id', 'unknown')}"
    return {
        "messages": [AIMessage(content=analysis)],
        "active_threat_level": new_level,
        "analysis": [analysis],
    }


def decoy_architect_node(state: AgentState):
    """Creates convincing fake systems dynamically."""
    latest_event = state["attacker_events"][-1] if state["attacker_events"] else {}
    target = latest_event.get("target", "unknown")
    trap = "fake ERP portal" if "WEB" in target else "tarpit database"
    decision = f"Decoy Architect: Deployed {trap} to intercept the attacker on {target}."
    return {
        "messages": [AIMessage(content=decision)],
        "analysis": [decision],
    }


def lure_designer_node(state: AgentState):
    """Places breadcrumbs for attackers to find."""
    return {
        "messages": [AIMessage(content="Lure Designer: Seeded fake AWS IAM keys and outdated credentials to steer the attacker deeper into the trap.")],
    }


def distraction_coordinator_node(state: AgentState):
    """Keeps attackers engaged."""
    return {
        "messages": [AIMessage(content="Distraction Coordinator: Artificially slowed TCP responses and returned fake service banners to keep the attacker occupied.")],
    }


def honeypot_operator_node(state: AgentState):
    """Manages honeypot health and routing."""
    latest_event = state["attacker_events"][-1] if state["attacker_events"] else {}
    action = latest_event.get("action", "scan")
    mitigation = "reroute session into the honeypot cluster"
    if action in ["EXPLOIT", "INJECT"]:
        mitigation = "trap the attacker in a tarpit honeypot and preserve evidence"
    result = f"Honeypot Operator: {mitigation}."
    new_mitigations = state.get("mitigations", []) + [result]
    resolved = action in ["DATA_EXFIL", "INJECT"] and latest_event.get("target", "").startswith("DB_FA")
    return {
        "messages": [AIMessage(content=result)],
        "mitigations": new_mitigations,
        "resolved": resolved or state.get("resolved", False),
    }


def adaptation_agent_node(state: AgentState):
    """Updates real defenses based on what attackers try."""
    latest_event = state["attacker_events"][-1] if state["attacker_events"] else {}
    tool = latest_event.get("tools", ["unknown"])[0]
    action = latest_event.get("action", "scan")
    block = "block IP and lock account" if action == "BRUTE_FORCE" else "add a WAF rule to block the payload"
    decision = f"Adaptation Agent: Detected {tool}; {block}."
    return {
        "messages": [AIMessage(content=decision)],
        "mitigations": state.get("mitigations", []) + [decision],
    }


def forensic_analyzer_node(state: AgentState):
    """Collects forensic data for later response."""
    return {
        "messages": [AIMessage(content="Forensic Analyzer: Captured attacker session metadata and correlated it with known intrusion patterns.")],
    }


def signal_distributor_node(state: AgentState):
    """Generates deceptive telemetry for attackers."""
    return {
        "messages": [AIMessage(content="Signal Distributor: Broadcasted false telemetry across the decoy network to mask the true asset locations.")],
    }


def threat_sharing_node(state: AgentState):
    """Shares detected indicators across the defense cluster."""
    return {
        "messages": [AIMessage(content="Threat Sharing: Propagated IoCs and attack fingerprints to partner nodes for broader situational awareness.")],
    }


def retreat_controller_node(state: AgentState):
    """Orchestrates fallback and isolation logic."""
    latest_event = state["attacker_events"][-1] if state["attacker_events"] else {}
    isolation = "quarantine the fake subsystem and seal the ingress point"
    if latest_event.get("target", "").startswith("DB"): 
        isolation = "lock down database access and isolate the compromised node"
    decision = f"Retreat Controller: {isolation}."
    return {
        "messages": [AIMessage(content=decision)],
        "mitigations": state.get("mitigations", []) + [decision],
        "resolved": True,
    }


def intelligence_agent_node(state: AgentState):
    """Shares learned logic."""
    return {
        "messages": [AIMessage(content="Intelligence Agent: Threat profile packaged and broadcasted to peer nodes.")],
    }

# Build Graph
builder = StateGraph(AgentState)
builder.add_node("behavioral_monitor", behavioral_monitor_node)
builder.add_node("threat_profiler", threat_profiler_node)
builder.add_node("decoy_architect", decoy_architect_node)
builder.add_node("lure_designer", lure_designer_node)
builder.add_node("distraction_coordinator", distraction_coordinator_node)
builder.add_node("honeypot_operator", honeypot_operator_node)
builder.add_node("adaptation_agent", adaptation_agent_node)
builder.add_node("forensic_analyzer", forensic_analyzer_node)
builder.add_node("signal_distributor", signal_distributor_node)
builder.add_node("threat_sharing", threat_sharing_node)
builder.add_node("retreat_controller", retreat_controller_node)
builder.add_node("intelligence_agent", intelligence_agent_node)

builder.add_edge(START, "behavioral_monitor")
builder.add_edge("behavioral_monitor", "threat_profiler")
builder.add_edge("threat_profiler", "decoy_architect")
builder.add_edge("decoy_architect", "lure_designer")
builder.add_edge("lure_designer", "distraction_coordinator")
builder.add_edge("distraction_coordinator", "honeypot_operator")
builder.add_edge("honeypot_operator", "adaptation_agent")
builder.add_edge("adaptation_agent", "forensic_analyzer")
builder.add_edge("forensic_analyzer", "signal_distributor")
builder.add_edge("signal_distributor", "threat_sharing")
builder.add_edge("threat_sharing", "retreat_controller")
builder.add_edge("retreat_controller", "intelligence_agent")
builder.add_edge("intelligence_agent", END)

deceptor_graph = builder.compile()
