import { useEffect } from "react";
import {
  BRIDGE_TILES,
  EXIT_POSITION,
  GRID_HEIGHT,
  GRID_WIDTH,
  KEY_POSITION,
  SCANNER_POSITION,
  getTileType,
  samePoint,
} from "../game";

const DIRECTIONS = {
  w: "up",
  arrowup: "up",
  s: "down",
  arrowdown: "down",
  a: "left",
  arrowleft: "left",
  d: "right",
  arrowright: "right",
};

function Tile({ x, y, state }) {
  const point = { x, y };
  const type = getTileType(x, y);
  const isBridge = BRIDGE_TILES.some((tile) => samePoint(tile, point));
  const bridgeState = state.patchApplied ? "repaired" : state.bridgeBroken ? "broken" : "intact";
  const classes = ["map-tile", `tile-${type}`];
  if (isBridge) classes.push(`bridge-${bridgeState}`);

  return (
    <div className={classes.join(" ")} aria-hidden="true">
      {type === "floor" && <span className="floor-detail" />}
      {type === "wall" && <span className="wall-detail" />}
      {isBridge && <span className="bridge-plank" />}
      {!state.hasKey && samePoint(point, KEY_POSITION) && (
        <span className="map-object key-object" title="Access key">◆<i /></span>
      )}
      {samePoint(point, SCANNER_POSITION) && (
        <span className={`map-object scanner-object ${state.scannerActive ? "active" : ""}`} title="Diagnostic scanner">
          <i>▽</i>
        </span>
      )}
      {samePoint(point, EXIT_POSITION) && (
        <span className={`map-object exit-object ${state.won ? "open" : ""}`} title="Exit">
          <i>{state.won ? "✓" : "▣"}</i>
        </span>
      )}
      {samePoint(point, state.player) && (
        <span className="player-token" title="PLAYER_01"><i className="player-head" /><i className="player-body" /></span>
      )}
    </div>
  );
}

function Objective({ complete, active, locked, children, detail }) {
  return (
    <li className={`${complete ? "complete" : ""} ${active ? "active" : ""} ${locked ? "locked" : ""}`}>
      <span className="objective-icon">{complete ? "✓" : locked ? "×" : "•"}</span>
      <span><strong>{children}</strong>{detail && <small>{detail}</small>}</span>
    </li>
  );
}

export default function GamePanel({ state, dispatch }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLButtonElement ||
        target?.isContentEditable
      ) return;

      const key = event.key.toLowerCase();
      if (DIRECTIONS[key]) {
        event.preventDefault();
        dispatch({ type: "MOVE", direction: DIRECTIONS[key] });
      } else if (key === "e") {
        event.preventDefault();
        dispatch({ type: "INTERACT" });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);

  const tiles = [];
  for (let y = 0; y < GRID_HEIGHT; y += 1) {
    for (let x = 0; x < GRID_WIDTH; x += 1) {
      tiles.push(<Tile key={`${x}-${y}`} x={x} y={y} state={state} />);
    }
  }

  const bridgeInvestigated = Boolean(state.incident);
  const scannerDistance =
    Math.abs(state.player.x - SCANNER_POSITION.x) + Math.abs(state.player.y - SCANNER_POSITION.y);
  const exitDistance =
    Math.abs(state.player.x - EXIT_POSITION.x) + Math.abs(state.player.y - EXIT_POSITION.y);

  return (
    <section className="role-panel gamer-panel" aria-labelledby="gamer-title">
      <div className="role-header">
        <div>
          <span className="role-icon gamer-icon" aria-hidden="true">✣</span>
          <h2 id="gamer-title">PLAYER_01 <em>/</em> WORLD VIEW</h2>
          <span className="live-pill">LIVE</span>
        </div>
        <div className="header-controls" aria-label="Game controls">
          <span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> Move</span>
          <span><kbd>E</kbd> Interact</span>
        </div>
      </div>

      <div className="game-viewport">
        <div className="map-grid">{tiles}</div>

        {scannerDistance <= 1 && !state.scannerActive && !state.won && (
          <div className="interaction-prompt scanner-prompt"><kbd>E</kbd> Activate diagnostic scanner</div>
        )}
        {exitDistance <= 1 && !state.won && (
          <div className="interaction-prompt exit-prompt"><kbd>E</kbd> {state.hasKey ? "Unlock exit" : "Access key required"}</div>
        )}

        {state.incident && !state.reportSent && (
          <div className="world-card failure-card">
            <span className="card-symbol">!</span>
            <div>
              <strong>That wasn’t supposed to happen.</strong>
              <code>BRIDGE_01 COLLAPSED · TILE 3/3</code>
              <small>The bridge gave way beneath you.</small>
            </div>
            <button type="button" onClick={() => dispatch({ type: "REPORT_GLITCH" })}>REPORT GLITCH</button>
          </div>
        )}

        {state.patchApplied && !state.won && (
          <div className="world-card success-card compact-card">
            <span className="card-symbol">✓</span>
            <div><strong>Same world. Different rules.</strong><small>PATCH APPLIED — CROSSING AVAILABLE</small></div>
          </div>
        )}

        {state.won && (
          <div className="world-card victory-card">
            <span className="card-symbol">✓</span>
            <div><strong>PATCH VERIFIED BY PLAYER</strong><small>One found the failure. One fixed the cause.</small></div>
          </div>
        )}
      </div>

      <div className={`notice-bar ${state.incident && !state.patchApplied ? "notice-danger" : state.patchApplied ? "notice-success" : ""}`}>
        <span aria-hidden="true">{state.patchApplied ? "✓" : state.incident ? "!" : "i"}</span>
        <p>{state.notice}</p>
      </div>

      <div className="gamer-dashboard">
        <div className="dashboard-section objectives-section">
          <h3>OBJECTIVES</h3>
          <ul>
            <Objective complete={state.hasKey} active={!state.hasKey}>01 / COLLECT ACCESS KEY</Objective>
            <Objective complete={bridgeInvestigated} active={state.hasKey && !bridgeInvestigated}>02 / INVESTIGATE BRIDGE</Objective>
            <Objective complete={state.won} active={state.patchApplied && !state.won} locked={!state.patchApplied}>03 / REACH EXIT</Objective>
          </ul>
        </div>

        <div className="dashboard-section inventory-section">
          <h3>INVENTORY</h3>
          <div className="inventory-slots">
            <span className={state.hasKey ? "filled" : ""}>{state.hasKey ? "◆" : ""}</span><span /><span />
          </div>
          <small>{state.hasKey ? "KEY ACQUIRED" : "NO KEY"}</small>
        </div>

        <div className="dashboard-section controls-section">
          <h3>CONTROLS</h3>
          <p><span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></span> MOVE</p>
          <p><kbd>E</kbd> INTERACT</p>
          <small>{state.scannerActive ? "SCANNER ONLINE" : "SCANNER IDLE"}</small>
        </div>
      </div>
    </section>
  );
}
