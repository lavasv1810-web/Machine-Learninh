import os
import json
from typing import TypedDict, Annotated, Sequence
import operator
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, START, END

class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]
    attacker_events: list[dict]
    active_threat_level: int
    tools_detected: list[str]

# Note: The GROQ_API_KEY must be in the environment to instantiate this
try:
    llm = ChatGroq(model="llama3-8b-8192")
except Exception as e:
    # Fallback to dummy for hackathon if no key is provided immediately
    class DummyLLM:
        def invoke(self, messages):
            return AIMessage(content="[Simulated response due to missing API Key]")
    llm = DummyLLM()

def behavioral_monitor_node(state: AgentState):
    """Watches how attackers interact with decoys."""
    latest_event = state["attacker_events"][-1] if state["attacker_events"] else None
    if not latest_event: return state
    
    # Prompt the LLM to analyze behavior
    prompt = f"Behavioral Monitor: Analyze this attacker event: {json.dumps(latest_event)}. Is this an amateur or an advanced threat?"
    response = llm.invoke([HumanMessage(content=prompt)])
    
    return {"messages": [AIMessage(content=f"Behavioral Monitor: {response.content}")], "tools_detected": latest_event.get("tools", [])}

def threat_profiler_node(state: AgentState):
    """Builds attacker profiles from behavior."""
    return {"messages": [AIMessage(content=f"Threat Profiler: Upgrading threat level based on latest tool signature.")], "active_threat_level": state.get("active_threat_level", 1) + 1}

def decoy_architect_node(state: AgentState):
    """Creates convincing fake systems dynamically."""
    return {"messages": [AIMessage(content="Decoy Architect: Spun up a vulnerable memcached instance to bait the port scan.")]}

def lure_designer_node(state: AgentState):
    """Places breadcrumbs for attackers to find."""
    return {"messages": [AIMessage(content="Lure Designer: Seeded fake AWS IAM keys in the exposed directory.")]}

def distraction_coordinator_node(state: AgentState):
    """Keeps attackers engaged."""
    return {"messages": [AIMessage(content="Distraction Coordinator: Artificially slowing TCP responses to 2000ms. Keep them guessing.")]}

def adaptation_agent_node(state: AgentState):
    """Updates real defenses based on what attackers try."""
    return {"messages": [AIMessage(content="Adaptation Agent: Validated SQLMap payload. Updating production WAF to drop these signatures.")]}

def intelligence_agent_node(state: AgentState):
    """Shares learned logic."""
    return {"messages": [AIMessage(content="Intelligence Agent: Threat profile packaged and broadcasted to peer nodes.")]}

# Build Graph
builder = StateGraph(AgentState)
builder.add_node("behavioral_monitor", behavioral_monitor_node)
builder.add_node("threat_profiler", threat_profiler_node)
builder.add_node("decoy_architect", decoy_architect_node)
builder.add_node("lure_designer", lure_designer_node)
builder.add_node("distraction_coordinator", distraction_coordinator_node)
builder.add_node("adaptation_agent", adaptation_agent_node)
builder.add_node("intelligence_agent", intelligence_agent_node)

builder.add_edge(START, "behavioral_monitor")
builder.add_edge("behavioral_monitor", "threat_profiler")
builder.add_edge("threat_profiler", "decoy_architect")
builder.add_edge("decoy_architect", "lure_designer")
builder.add_edge("lure_designer", "distraction_coordinator")
builder.add_edge("distraction_coordinator", "adaptation_agent")
builder.add_edge("adaptation_agent", "intelligence_agent")
builder.add_edge("intelligence_agent", END)

deceptor_graph = builder.compile()
