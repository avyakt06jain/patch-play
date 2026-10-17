export const GRID_WIDTH = 15;
export const GRID_HEIGHT = 9;
export const START = { x: 2, y: 6 };
export const BRIDGE_APPROACH = { x: 5, y: 4 };
export const KEY_POSITION = { x: 3, y: 2 };
export const SCANNER_POSITION = { x: 4, y: 5 };
export const EXIT_POSITION = { x: 12, y: 2 };
export const BRIDGE_TILES = [{ x: 6, y: 4 }, { x: 7, y: 4 }, { x: 8, y: 4 }];
const WALLS = new Set(["3,3", "4,3", "10,5", "11,5", "12,5"]);
export const MOVE_DELTAS = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
export const samePoint = (a, b) => a.x === b.x && a.y === b.y;
export function getTileType(x, y) {
  const point = { x, y };
  if (BRIDGE_TILES.some((tile) => samePoint(tile, point))) return "bridge";
  const island = (x >= 1 && x <= 5 && y >= 1 && y <= 7) || (x >= 9 && x <= 13 && y >= 1 && y <= 7);
  if (!island) return "void";
  return WALLS.has(`${x},${y}`) ? "wall" : "floor";
}
export function isWalkable(point) { return ["floor", "bridge"].includes(getTileType(point.x, point.y)); }
export function getBridgeStep(point) {
  const index = BRIDGE_TILES.findIndex((tile) => samePoint(tile, point));
  return index < 0 ? 0 : index + 1;
}
