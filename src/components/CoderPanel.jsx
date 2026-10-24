import { useEffect, useState } from "react";
import { LEVEL_PHASES } from "../engine/campaignReducer";
import CodeWorkspace from "./CodeWorkspace";

const basename = (path) => path.split("/").at(-1);

function FileTree({ level, session, actions }) {
  const groups = ["src", "tests", "docs", "types"];
  return <nav className="file-tree" aria-label="Virtual project files">{groups.map((group) => {
    const paths = Object.keys(session.files).filter((path) => path.startsWith(`/${group}/`));
    return <div className="file-group" key={group}><strong>⌄ {group}</strong>{paths.map((path) => <button type="button" className={`${session.selectedFile === path ? "selected" : ""} ${session.dirtyFiles.includes(path) ? "dirty" : ""}`} onClick={() => actions.selectFile(path)} key={path}><span>{path.endsWith(".md") ? "#" : path.endsWith(".d.ts") ? "T" : "TS"}</span>{basename(path)}{level.readOnlyFiles.includes(path) && <i>◇</i>}</button>)}</div>;
  })}</nav>;
}

function IncidentWorkspace({ level, session }) {
  const definition = level.incidents[session.activeIncidentIndex];
  const record = session.incidents[session.activeIncidentIndex];
  if (!record || ["active", "latent"].includes(record.status)) return <div className="coder-empty"><span>⌁</span><strong>AWAITING PLAYER INCIDENT</strong><p>The active cartridge is producing live world events. Evidence will open the relevant project context.</p></div>;
  return <div className="coder-incident"><div className="incident-row"><span>!</span><strong>{definition.id} · {definition.title}</strong><em>{record.status.toUpperCase()}</em></div><div className="incident-grid"><label>OBSERVED<code>{JSON.stringify(record.evidence?.observed)}</code></label><label>EXPECTED<code>{JSON.stringify(record.evidence?.expected)}</code></label><label>FUNCTION<code>{record.evidence?.functionName}</code></label><label>SOURCE<code>{session.difficulty === "guided" ? `${basename(definition.file)}:${definition.line}` : "TRACE REQUIRED"}</code></label></div></div>;
}

function TestExplorer({ session }) {
  return <section className="test-explorer"><header><strong>TEST EXPLORER</strong><span className={`test-state ${session.tests.status}`}>{session.tests.status === "passed" ? `${session.tests.results.length}/${session.tests.results.length} PASSED` : session.tests.status.toUpperCase()}</span></header>{session.tests.error && <div className="runtime-diagnostic">! {session.tests.error}</div>}{session.tests.results.length ? <div className="test-v3-list">{session.tests.results.map((test, index) => <div className={test.passed ? "passed" : "failed"} key={`${test.incidentId}-${index}`}><span>{test.passed ? "✓" : "×"}</span><p><strong>{test.incidentId} · {test.name}</strong><small>expected {JSON.stringify(test.expected)} · observed {JSON.stringify(test.observed)}</small></p></div>)}</div> : <p className="test-placeholder">Compile the candidate and run every unlocked contract plus previous regressions.</p>}</section>;
}

function ReproductionTrace({ record }) {
  const events = record?.trace ?? [];
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => { setIndex(0); setPlaying(false); }, [record?.id]);
  useEffect(() => {
    if (!playing || !events.length) return undefined;
    const timer = window.setInterval(() => setIndex((current) => {
      if (current >= events.length - 1) { setPlaying(false); return current; }
      return current + 1;
    }), 420);
    return () => window.clearInterval(timer);
  }, [playing, events.length]);
  const current = events[index];
  return <section className="trace-v3"><header><strong>INCIDENT REPLAY</strong><span>{events.length} EVENTS · NON-MUTATING</span></header>{events.length ? <><div className="replay-controls"><button type="button" onClick={() => setPlaying((value) => !value)}>{playing ? "Ⅱ PAUSE" : "▷ PLAY"}</button><button type="button" onClick={() => setIndex((value) => Math.min(events.length - 1, value + 1))}>STEP →</button><input aria-label="Incident replay position" type="range" min="0" max={events.length - 1} value={index} onChange={(event) => { setPlaying(false); setIndex(Number(event.target.value)); }} /></div><div className="replay-watch"><span>TICK <b>{current?.tick ?? 0}</b></span><span>EVENT <b>{current?.type}</b></span><span>POSITION <b>{current?.payload?.point ? `${current.payload.point.x},${current.payload.point.y}` : "—"}</b></span></div>{events.slice(Math.max(0, index - 2), index + 1).map((event) => <p className={event.sequence === current?.sequence ? "current" : ""} key={event.sequence}><span>{String(event.sequence).padStart(2, "0")}</span><code>{event.type} · {event.message}</code></p>)}</> : <div className="empty-trace">No failure trace captured.</div>}</section>;
}

function CandidateDiff({ session, file }) {
  if (!session.dirtyFiles.includes(file.path)) return null;
  const before = session.baselineFiles[file.path]?.split("\n") ?? [];
  const after = file.content.split("\n");
  const changes = after.map((line, index) => ({ index, line, before: before[index] })).filter((item) => item.line !== item.before);
  return <details className="candidate-diff"><summary>LIVE v{session.liveRevision} ↔ CANDIDATE v{session.candidateRevision} · {changes.length} LINE{changes.length === 1 ? "" : "S"}</summary>{changes.slice(0, 8).map((change) => <div key={change.index}><code className="removed">− {change.before ?? ""}</code><code className="added">+ {change.line}</code></div>)}</details>;
}

export default function CoderPanel({ level, session, actions }) {
  const definition = level.incidents[session.activeIncidentIndex];
  const record = session.incidents[session.activeIncidentIndex];
  const file = { path: session.selectedFile, content: session.files[session.selectedFile], readOnly: level.readOnlyFiles.includes(session.selectedFile) };
  const canEdit = [LEVEL_PHASES.INCIDENT_REPORTED, LEVEL_PHASES.CANDIDATE_EDITING, LEVEL_PHASES.CANDIDATE_TESTED].includes(session.phase) && !file.readOnly;
  const suspected = session.difficulty === "guided" && record && !["active", "latent", "detected"].includes(record.status) && session.selectedFile === definition.file ? definition.line : null;
  const canTest = [LEVEL_PHASES.INCIDENT_REPORTED, LEVEL_PHASES.CANDIDATE_EDITING, LEVEL_PHASES.CANDIDATE_TESTED].includes(session.phase);
  return <section className="v3-role coder-panel-v3">
    <header className="v3-role-header"><div><span className="role-badge amber">D2</span><div><strong>DEV_02</strong><small>CODE WORKSPACE · QUICKJS SANDBOX</small></div></div><span className={`runtime-pill amber ${session.compile.status}`}>{session.compile.status.toUpperCase()}</span></header>
    <IncidentWorkspace level={level} session={session} />
    {record && !["active", "latent", "detected"].includes(record.status) && <div className="debug-hint"><span>◉</span><div><strong>{session.difficulty === "guided" ? `GUIDED TRACE · ${basename(definition.file)}:${definition.line}` : "CHALLENGE TRACE"}</strong><p>{definition.hint}</p>{session.scannerActive && <small>SCANNER: {definition.scannerHint}</small>}</div></div>}
    <div className="ide-shell">
      <FileTree level={level} session={session} actions={actions} />
      <div className="editor-column"><div className="editor-tabs"><span className={session.dirtyFiles.includes(file.path) ? "dirty" : ""}>{basename(file.path)}{file.readOnly && " · READ ONLY"}</span>{session.dirtyFiles.includes(file.path) && <button type="button" onClick={() => actions.restoreFile(file.path)}>RESTORE</button>}</div><CodeWorkspace file={{ ...file, readOnly: file.readOnly || !canEdit }} suspectLine={suspected} onChange={(content) => actions.editFile(file.path, content)} /><CandidateDiff session={session} file={file} /></div>
    </div>
    <div className="debug-lower">
      <ReproductionTrace record={record} />
      <TestExplorer session={session} />
    </div>
    {session.compile.error && <div className="runtime-diagnostic">SANDBOX DIAGNOSTIC · {session.compile.error}</div>}
    <div className="revision-strip"><span>LIVE v{session.liveRevision}</span><i>→</i><span className={session.dirtyFiles.length ? "candidate" : ""}>CANDIDATE v{session.candidateRevision}</span><i>·</i><span>{session.dirtyFiles.length} CHANGED FILE{session.dirtyFiles.length === 1 ? "" : "S"}</span><i>·</i><span>NO DOM · NO NETWORK · NO EVAL</span></div>
    <div className="coder-actions-v3"><button type="button" className="test-candidate" disabled={!canTest || session.tests.status === "running"} onClick={actions.runTests}>▷ {session.tests.status === "running" ? "RUNNING…" : "TEST CANDIDATE"}</button><button type="button" className="deploy-candidate" disabled={session.tests.status !== "passed" || session.phase !== LEVEL_PHASES.CANDIDATE_TESTED} onClick={actions.deploy}>⇧ DEPLOY v{session.candidateRevision}</button>{session.phase === LEVEL_PHASES.PATCH_DEPLOYED && <button type="button" className="rollback-candidate" onClick={actions.rollback}>↶ ROLLBACK</button>}</div>
  </section>;
}
