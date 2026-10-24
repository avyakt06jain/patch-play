import { useEffect, useRef } from "react";
import { getWorldMetrics, pointKey } from "../engine/world";

const COLORS = { transit: "#52dfe1", signal: "#b78cff", cargo: "#ffc078", reactor: "#fa7285" };

export default function WorldCanvas({ level, session }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    let frame;
    const render = (time) => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      if (canvas.width !== Math.round(rect.width * ratio) || canvas.height !== Math.round(rect.height * ratio)) { canvas.width = Math.round(rect.width * ratio); canvas.height = Math.round(rect.height * ratio); }
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const { width, height } = getWorldMetrics(level);
      const tile = Math.min(rect.width / width, rect.height / height);
      const ox = (rect.width - width * tile) / 2;
      const oy = (rect.height - height * tile) / 2;
      context.fillStyle = "#040911"; context.fillRect(0, 0, rect.width, rect.height);
      for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
        const char = level.map[y]?.[x] ?? "#"; const px = ox + x * tile; const py = oy + y * tile;
        if (char === "~") { context.fillStyle = "#03070d"; context.fillRect(px, py, tile, tile); continue; }
        context.fillStyle = char === "#" ? "#172a39" : "#132536"; context.fillRect(px + 1, py + 1, tile - 2, tile - 2);
        context.strokeStyle = char === "#" ? "#294459" : "rgba(82,120,145,.18)"; context.strokeRect(px + 1, py + 1, tile - 2, tile - 2);
        if ("B><".includes(char)) { context.fillStyle = session.liveRevision ? "#247f71" : "#8f603b"; context.fillRect(px + 3, py + tile * .32, tile - 6, tile * .36); }
        if (char === "K" && !session.inventory.length) drawGlyph(context, "◆", px, py, tile, "#ffd16a", time);
        if (char === "S") drawGlyph(context, "▽", px, py, tile, session.scannerActive ? "#72e5a0" : "#52dfe1", time);
        if (char === "C") drawBox(context, px, py, tile, "#b87942");
        if (char === "P") drawGlyph(context, "◎", px, py, tile, "#ffc078", time);
        if (char === "V") drawGlyph(context, "✣", px, py, tile, "#72e5a0", time);
        if (char === "L") drawGlyph(context, "│", px, py, tile, "#fa7285", time);
        if (char === "D") drawGlyph(context, "◇", px, py, tile, "#fa7285", time);
        if (char === "E") drawGlyph(context, "▣", px, py, tile, "#72e5a0", time);
      }
      const incident = level.incidents[session.activeIncidentIndex];
      if (incident) {
        const px = ox + incident.trigger.x * tile; const py = oy + incident.trigger.y * tile;
        context.strokeStyle = session.phase === "patch_deployed" ? "#72e5a0" : COLORS[level.wing]; context.lineWidth = 2 + Math.sin(time / 180) * .5; context.strokeRect(px + 4, py + 4, tile - 8, tile - 8);
      }
      if (session.scannerHeld) { context.fillStyle = "rgba(55,225,220,.08)"; context.fillRect(0, 0, rect.width, rect.height); context.fillStyle = "#8ffcff"; context.font = "700 10px monospace"; context.fillText(`SCAN · ${incident?.functionName ?? "NO TARGET"}`, 14, 20); }
      const playerX = ox + session.player.x * tile; const playerY = oy + session.player.y * tile;
      context.shadowColor = COLORS[level.wing]; context.shadowBlur = 12; context.fillStyle = "#e9fdff"; context.beginPath(); context.arc(playerX + tile / 2, playerY + tile / 2, tile * .22, 0, Math.PI * 2); context.fill(); context.shadowBlur = 0; context.fillStyle = COLORS[level.wing]; context.fillRect(playerX + tile * .36, playerY + tile * .48, tile * .28, tile * .3);
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [level, session]);
  return <canvas className="world-canvas" ref={canvasRef} aria-label={`${level.title} playable world`} />;
}

function drawGlyph(context, glyph, x, y, tile, color, time) { context.save(); context.fillStyle = color; context.shadowColor = color; context.shadowBlur = 7 + Math.sin(time / 250) * 3; context.font = `700 ${tile * .45}px monospace`; context.textAlign = "center"; context.textBaseline = "middle"; context.fillText(glyph, x + tile / 2, y + tile / 2); context.restore(); }
function drawBox(context, x, y, tile, color) { context.fillStyle = color; context.fillRect(x + tile * .18, y + tile * .18, tile * .64, tile * .64); context.strokeStyle = "#ffcc86"; context.strokeRect(x + tile * .24, y + tile * .24, tile * .52, tile * .52); }
