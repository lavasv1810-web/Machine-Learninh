# TODO - Incident Analysis & Response / Agent Orchestration Hub visibility

- [x] Update `frontend/src/index.css` to stabilize layout:
  - [x] Adjust `.main-grid` row sizing to avoid FR rebalancing.
  - [x] Ensure `.agent-hub` / `.analysis-hub` and their `.panel-content` scroll internally.
  - [x] Ensure flex containers allow scrolling without resizing.

- [x] (Optional) Reduce perceived fluctuation by removing hover transform on `.status-card` (only if needed).
- [ ] Run frontend and visually verify panels remain clearly visible during WebSocket updates.
- [ ] Validate Agent Hub shows correct active agents in real mode (websocket).


