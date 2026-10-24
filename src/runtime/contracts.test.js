import { describe, expect, it } from "vitest";
import { LEVELS } from "../levels/cartridges";
import { deepEqual, validateLevels } from "./contracts";

describe("v3 cartridge contracts", () => {
  it("validates all four cartridges and eight incidents", () => {
    const levels = validateLevels(LEVELS);
    expect(levels).toHaveLength(4);
    expect(levels.flatMap((level) => level.incidents)).toHaveLength(8);
  });

  it("compares serialized sandbox values structurally", () => {
    expect(deepEqual({ opened: true, nested: [1, 2] }, { nested: [1, 2], opened: true })).toBe(true);
    expect(deepEqual(["HIGH", "LOW"], ["LOW", "HIGH"])).toBe(false);
  });

  it("keeps every incident source editable and every test visible read-only", () => {
    for (const level of LEVELS) {
      for (const incident of level.incidents) expect(level.editableFiles).toContain(incident.file);
      expect(level.readOnlyFiles.filter((path) => path.startsWith("/tests/"))).toHaveLength(2);
    }
  });
});
