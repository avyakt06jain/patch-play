import { useEffect, useRef } from "react";
import { basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { EditorState } from "@codemirror/state";
import { Decoration, EditorView } from "@codemirror/view";

function editorExtensions({ readOnly, suspectLine, onChange }) {
  const extensions = [basicSetup, javascript({ typescript: true }), EditorState.readOnly.of(readOnly), EditorView.editable.of(!readOnly), EditorView.theme({
    "&": { height: "100%", backgroundColor: "#09121d", color: "#dcebf0", fontSize: "12px" },
    ".cm-content": { fontFamily: "'JetBrains Mono', ui-monospace, monospace", padding: "10px 0" },
    ".cm-gutters": { backgroundColor: "#0c1724", color: "#526c80", border: "none" },
    ".cm-activeLine": { backgroundColor: "rgba(255,192,120,.06)" },
    ".cm-scroller": { overflow: "auto" },
    ".cm-suspect-line": { backgroundColor: "rgba(250,114,133,.16)", boxShadow: "inset 3px 0 #fa7285" },
  })];
  if (!readOnly) extensions.push(EditorView.updateListener.of((update) => { if (update.docChanged) onChange(update.state.doc.toString()); }));
  if (suspectLine) extensions.push(EditorView.decorations.of((view) => {
    const line = view.state.doc.line(Math.min(suspectLine, view.state.doc.lines));
    return Decoration.set([Decoration.line({ class: "cm-suspect-line" }).range(line.from)]);
  }));
  return extensions;
}

export default function CodeWorkspace({ file, suspectLine, onChange }) {
  const hostRef = useRef(null);
  const viewRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const applyingExternalRef = useRef(false);
  onChangeRef.current = onChange;
  useEffect(() => {
    if (!hostRef.current || !file) return undefined;
    const view = new EditorView({ state: EditorState.create({ doc: file.content, extensions: editorExtensions({ readOnly: file.readOnly, suspectLine, onChange: (content) => {
      if (!applyingExternalRef.current) onChangeRef.current(content);
    } }) }), parent: hostRef.current });
    viewRef.current = view;
    return () => { viewRef.current = null; view.destroy(); };
  }, [file?.path, file?.content === undefined, file?.readOnly, suspectLine]);
  useEffect(() => {
    const view = viewRef.current;
    if (!view || !file) return;
    const current = view.state.doc.toString();
    if (current === file.content) return;
    applyingExternalRef.current = true;
    view.dispatch({ changes: { from: 0, to: current.length, insert: file.content } });
    applyingExternalRef.current = false;
  }, [file?.content]);
  return <div className="cm-host" ref={hostRef} />;
}
