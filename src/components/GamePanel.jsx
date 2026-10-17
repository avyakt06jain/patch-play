import { useEffect } from "react";
import { BRIDGE_TILES, EXIT_POSITION, GRID_HEIGHT, GRID_WIDTH, KEY_POSITION, PHASES, REPORT_OBSERVATIONS, SCANNER_POSITION, getTileType, samePoint } from "../game";

const DIRECTIONS = { w: "up", arrowup: "up", s: "down", arrowdown: "down", a: "left", arrowleft: "left", d: "right", arrowright: "right" };

function Tile({ x, y, state }) {
  const point = { x, y };
  const type = getTileType(x, y);
  const isBridge = BRIDGE_TILES.some((tile) => samePoint(tile, point));
  const repaired = [PHASES.PATCH_DEPLOYED, PHASES.VERIFIED].includes(state.phase);
  const bridgeState = repaired ? "repaired" : state.bridgeBroken ? "broken" : "intact";
  const classes = ["map-tile", `tile-${type}`, isBridge ? `bridge-${bridgeState}` : ""].filter(Boolean).join(" ");
  return <div className={classes} aria-hidden="true">
    {type === "floor" && <span className="floor-detail" />}{type === "wall" && <span className="wall-detail" />}
    {isBridge && <><span className="bridge-plank" /><span className="bridge-cable" /></>}
    {!state.hasKey && samePoint(point, KEY_POSITION) && <span className="map-object key-object">◆<i /></span>}
    {samePoint(point, SCANNER_POSITION) && <span className={`map-object scanner-object ${state.scannerActive ? "active" : ""}`}><i>▽</i></span>}
    {samePoint(point, EXIT_POSITION) && <span className={`map-object exit-object ${state.phase === PHASES.VERIFIED ? "open" : ""}`}><i>{state.phase === PHASES.VERIFIED ? "✓" : "▣"}</i></span>}
    {x === 5 && y === 4 && state.bridgeBroken && <span className="checkpoint-marker">SAFE</span>}
    {samePoint(point, state.player) && <span className="player-token"><i className="player-head" /><i className="player-body" /></span>}
  </div>;
}

function Objective({ complete, active, locked, children, detail }) {
  return <li className={`${complete ? "complete" : ""} ${active ? "active" : ""} ${locked ? "locked" : ""}`}><span className="objective-icon">{complete ? "✓" : locked ? "×" : "•"}</span><span><strong>{children}</strong>{detail && <small>{detail}</small>}</span></li>;
}

function EvidenceReview({ state, dispatch }) {
  const snapshot = state.incident.snapshot;
  return <div className="world-card evidence-card">
    <div className="evidence-heading"><span className="card-symbol">!</span><div><strong>GLITCH CAPTURED</strong><code>{snapshot.location}</code></div></div>
    <div className="evidence-facts"><span><b>OBSERVED</b>{snapshot.observed}</span><span><b>EXPECTED</b>{snapshot.expected}</span><span><b>KEY</b>{state.hasKey ? "captured" : "none"}</span><span><b>SCAN</b>{snapshot.scanner}</span></div>
    <label className="observation-field">WHAT DID YOU SEE?
      <select value={state.reportDraft.observation} onChange={(event) => dispatch({ type: "SET_REPORT_OBSERVATION", value: event.target.value })}>{REPORT_OBSERVATIONS.map((item) => <option key={item}>{item}</option>)}</select>
    </label>
    <label className={`attachment-check ${!state.scannerActive ? "disabled" : ""}`}><input type="checkbox" disabled={!state.scannerActive} checked={state.reportDraft.attachScanner} onChange={() => dispatch({ type: "TOGGLE_SCANNER_ATTACHMENT" })} />Attach scanner telemetry {state.scannerActive ? "" : "(scanner not used)"}</label>
    <button type="button" onClick={() => dispatch({ type: "REPORT_GLITCH" })}>SEND INCIDENT TO DEV_02</button>
  </div>;
}

export default function GamePanel({ state, dispatch }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLButtonElement || target instanceof HTMLSelectElement || target?.isContentEditable) return;
      const key = event.key.toLowerCase();
      if (DIRECTIONS[key]) { event.preventDefault(); dispatch({ type: "MOVE", direction: DIRECTIONS[key] }); }
      else if (key === "e") { event.preventDefault(); dispatch({ type: "INTERACT" }); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);

  const tiles = [];
  for (let y = 0; y < GRID_HEIGHT; y += 1) for (let x = 0; x < GRID_WIDTH; x += 1) tiles.push(<Tile key={`${x}-${y}`} x={x} y={y} state={state} />);
  const scannerDistance = Math.abs(state.player.x - SCANNER_POSITION.x) + Math.abs(state.player.y - SCANNER_POSITION.y);
  const exitDistance = Math.abs(state.player.x - EXIT_POSITION.x) + Math.abs(state.player.y - EXIT_POSITION.y);
  const incidentComplete = ![PHASES.EXPLORE, PHASES.FAILURE_DETECTED].includes(state.phase);
  const patchLive = [PHASES.PATCH_DEPLOYED, PHASES.VERIFIED].includes(state.phase);

  return <section className="role-panel gamer-panel" aria-labelledby="gamer-title">
    <div className="role-header"><div><span className="role-icon gamer-icon">✣</span><h2 id="gamer-title">PLAYER_01 <em>/</em> WORLD VIEW</h2><span className="live-pill">LIVE WORLD</span></div><div className="header-controls"><span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> Move</span><span><kbd>E</kbd> Interact</span></div></div>
    <div className="game-viewport">
      <span className="zone-label start-zone">ORIGIN SECTOR</span><span className="zone-label exit-zone">EXIT NODE</span>
      <div className="map-grid">{tiles}</div>
      {scannerDistance <= 1 && !state.scannerActive && state.phase !== PHASES.FAILURE_DETECTED && <div className="interaction-prompt scanner-prompt"><kbd>E</kbd> Scan bridge boundary</div>}
      {exitDistance <= 1 && state.phase !== PHASES.VERIFIED && <div className="interaction-prompt exit-prompt"><kbd>E</kbd> {state.hasKey ? "Verify keyed exit" : "Access key required"}</div>}
      {state.phase === PHASES.FAILURE_DETECTED && <EvidenceReview state={state} dispatch={dispatch} />}
      {patchLive && state.phase !== PHASES.VERIFIED && <div className="world-card status-card"><span className="card-symbol">✓</span><div><strong>PATCH LIVE · VERIFY IN WORLD</strong><small>{state.crossingVerified ? "CROSSING HELD — USE THE EXIT" : "THE TESTS PASSED. THE PLAYER DECIDES."}</small></div></div>}
    </div>
    <div className={`notice-bar ${state.bridgeBroken ? "notice-danger" : patchLive ? "notice-success" : ""}`}><span>{state.bridgeBroken ? "!" : patchLive ? "✓" : "i"}</span><p>{state.notice}</p></div>
    <div className="gamer-dashboard">
      <div className="dashboard-section objectives-section"><h3>MISSION</h3><ul><Objective complete={state.hasKey} active={!state.hasKey}>01 / COLLECT ACCESS KEY</Objective><Objective complete={incidentComplete} active={state.hasKey && !incidentComplete}>02 / CAPTURE + REPORT FAULT</Objective><Objective complete={state.phase === PHASES.VERIFIED} active={patchLive} locked={!patchLive}>03 / VERIFY REPAIRED WORLD</Objective></ul></div>
      <div className="dashboard-section inventory-section"><h3>FIELD KIT</h3><div className="inventory-slots"><span className={state.hasKey ? "filled" : ""}>{state.hasKey ? "◆" : ""}</span><span className={state.scannerActive ? "scanner-filled" : ""}>{state.scannerActive ? "▽" : ""}</span><span /></div><small>{state.hasKey ? "KEY ACQUIRED" : "KEY MISSING"} · {state.scannerActive ? "SCAN ONLINE" : "SCAN IDLE"}</small></div>
      <div className="dashboard-section controls-section"><h3>LIVE TELEMETRY</h3><p><span>POS</span> ({state.player.x}, {state.player.y})</p><p><span>BRIDGE STEP</span> {state.bridgeSteps || "—"}</p><small>{state.replay.active ? "REPLAY RUNNING · LIVE PLAYER LOCKED" : "PLAYER CONTROL ACTIVE"}</small></div>
    </div>
  </section>;
}
