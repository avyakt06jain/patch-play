import { useReducer } from "react";
import { createInitialState, reducer } from "./game";
import GamePanel from "./components/GamePanel";
import CoderPanel from "./components/CoderPanel";

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);

  return (
    <main className="app-shell">
      <header className="global-header">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">//</span>
          <div>
            <h1>PATCH<span>//</span>PLAY</h1>
            <p>CO-OP DEBUGGING EXPERIENCE</p>
          </div>
        </div>

        <div className="level-lockup">
          <strong>LEVEL_01&nbsp; / &nbsp;THE BROKEN CROSSING</strong>
          <span>One plays the problem. The other patches the world.</span>
        </div>

        <div className="session-actions">
          <span className="session-status"><i /> LOCAL SESSION</span>
          <button className="reset-button" type="button" onClick={() => dispatch({ type: "RESET" })}>
            <span aria-hidden="true">↻</span> RESET DEMO
          </button>
        </div>
      </header>

      <section className="workspace" aria-label="PATCH PLAY cooperative workspace">
        <GamePanel state={state} dispatch={dispatch} />
        <CoderPanel state={state} dispatch={dispatch} />
      </section>
    </main>
  );
}
