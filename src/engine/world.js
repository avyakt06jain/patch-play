const DELTAS = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };

export const pointKey = ({ x, y }) => `${x},${y}`;
export const samePoint = (a, b) => a.x === b.x && a.y === b.y;

export function tileAt(level, point) {
  return level.map[point.y]?.[point.x] ?? "#";
}

export function canWalk(level, point) {
  return !["#", "~"].includes(tileAt(level, point));
}

export function nextPoint(player, direction) {
  const delta = DELTAS[direction];
  return delta ? { x: player.x + delta.x, y: player.y + delta.y } : player;
}

export function findCharacter(level, character) {
  for (let y = 0; y < level.map.length; y += 1) {
    const x = level.map[y].indexOf(character);
    if (x >= 0) return { x, y };
  }
  return null;
}

export function getActiveTrigger(level, incidentIndex) {
  return level.incidents[incidentIndex]?.trigger ?? null;
}

export function isNear(left, right, distance = 1) {
  return Math.abs(left.x - right.x) + Math.abs(left.y - right.y) <= distance;
}

export function getWorldMetrics(level) {
  return { width: Math.max(...level.map.map((row) => row.length)), height: level.map.length };
}
