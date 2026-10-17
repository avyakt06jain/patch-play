import { useEffect } from "react";
import { LEVEL_PHASES } from "../engine/campaignReducer";
import { isNear } from "../engine/world";
import WorldCanvas from "./WorldCanvas";

const DIRECTIONS = { w: "up", arrowup: "up", s: "down", arrowdown: "down", a: "left", arrowleft: "left", d: "right", arrowright: "right" };

export default function GamePanel({ level, session, actions }) {
  useEffect(() => {
    const down = (event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLButtonElement || target?.isContentEditable || target?.closest?.(".cm-editor")) return;
      const key = event.key.toLowerCase();
      if (DIRECTIONS[key]) { event.preventDefault(); actions.move(DIRECTIONS[key]); }
      else if (key === "e") { event.preventDefault(); actions.interact(); }
      else if (key === "r") { event.preventDefault(); actions.resetRoom(); }
      else if (key === "q") { event.preventDefault(); actions.setScannerHeld(true); }
    };
    const up = (event) => { if (event.key.toLowerCase() === "q") actions.setScannerHeld(false); };
    window.addEventListener("keydown", down); window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [actions]);

  const incident = level.incidents[session.activeIncidentIndex];
  const record = session.incidents[session.activeIncidentIndex];
  const reported = ["reported", "patched", "verified"].includes(record?.status);
  const nearScanner = isNear(session.player, level.scanner);
  const completeCount = session.incidents.filter((item) => item.status === "verified").length;

  return <section className={`v3-role gamer-panel wing-${level.wing}`}>
    <header className="v3-role-header"><div><span className="role-badge">P1</span><div><strong>PLAYER_01</strong><small>WORLD VIEW · {level.wing.toUpperCase()} WING</small></div></div><span className="runtime-pill">LIVE v{session.liveRevision}</span></header>
    <div className="world-stage">
      <WorldCanvas level={level} session={session} />
      <div className="world-title"><span>LEVEL_{level.number}</span><strong>{level.title}</strong></div>
      {nearScanner && !session.scannerActive && <div className="interaction-chip"><kbd>E</kbd> ACTIVATE SCANNER</div>}
      {session.phase === LEVEL_PHASES.INCIDENT_DETECTED && <div className="v3-incident-overlay">
        <div className="incident-mark">!</div><div><span>LIVE FAILURE CAPTURED</span><strong>{incident.id} · {incident.title}</strong><p>Observed <code>{JSON.stringify(record.evidence?.observed)}</code> where the contract expected <code>{JSON.stringify(record.evidence?.expected)}</code>.</p></div>
        <button type="button" onClick={actions.report}>REPORT TO DEV_02</button>
      </div>}
      {session.phase === LEVEL_PHASES.PATCH_DEPLOYED && <div className="verification-banner"><span>✓</span><div><strong>PATCH v{session.liveRevision} IS LIVE</strong><small>Reproduce the interaction to verify it in-world.</small></div></div>}
      {session.phase === LEVEL_PHASES.LEVEL_COMPLETE && <div className="level-victory"><span>✓</span><strong>WING STABILIZED</strong><p>Both incidents were patched and verified by PLAYER_01.</p><button type="button" onClick={actions.exitLevel}>RETURN TO CAMPAIGN</button></div>}
    </div>
    <div className={`v3-notice ${session.phase === LEVEL_PHASES.INCIDENT_DETECTED ? "danger" : session.phase === LEVEL_PHASES.PATCH_DEPLOYED ? "success" : ""}`}><span>{session.phase === LEVEL_PHASES.INCIDENT_DETECTED ? "!" : "i"}</span><p>{session.notice}</p></div>
    <div className="gamer-hud">
      <section><h3>ACTIVE OBJECTIVES</h3><div className="objective-v3 complete"><i>✓</i><span>ENTER {level.wing.toUpperCase()} WING</span></div>{level.incidents.map((item, index) => <div className={`objective-v3 ${session.incidents[index].status === "verified" ? "complete" : index === session.activeIncidentIndex ? "active" : "locked"}`} key={item.id}><i>{session.incidents[index].status === "verified" ? "✓" : index + 1}</i><span>{item.id} · {item.title}</span></div>)}</section>
      <section><h3>FIELD KIT</h3><div className="kit-row"><span className={session.inventory.length ? "owned" : ""}>◆<small>{session.inventory.length ? "TOKEN" : "EMPTY"}</small></span><span className={session.scannerActive ? "owned" : ""}>▽<small>{session.scannerActive ? "SCANNER" : "OFFLINE"}</small></span></div><p>{completeCount}/2 INCIDENTS VERIFIED</p></section>
      <section><h3>CONTROLS</h3><div className="control-grid"><kbd>WASD</kbd><span>MOVE</span><kbd>E</kbd><span>INTERACT</span><kbd>Q</kbd><span>SCAN</span><kbd>R</kbd><span>RESET ROOM</span></div><p>POS ({session.player.x}, {session.player.y}) · TICK {session.tick}</p></section>
    </div>
    {reported && session.phase !== LEVEL_PHASES.LEVEL_COMPLETE && <div className="gamer-role-note">DEV_02 HAS THE TRACE · YOU CAN KEEP EXPLORING</div>}
  </section>;
}
