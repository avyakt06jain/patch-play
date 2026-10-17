import { describe, expect, it } from "vitest";
import { LEVELS } from "../levels/cartridges";
import { validateWorldCommands } from "./commandValidator";

const permissions = LEVELS[0].capabilities;

describe("world command boundary", () => {
  it("accepts a permitted mutation for a declared entity", () => {
    expect(validateWorldCommands([{ type: "SET_ENTITY_STATE", entityId: "bridge-a", state: "stable" }], permissions, ["bridge-a"])).toHaveLength(1);
  });

  it("rejects unknown entities and excessive command output", () => {
    expect(() => validateWorldCommands([{ type: "MOVE_ENTITY", entityId: "outside-level", target: { x: 1, y: 1 } }], permissions, ["crate-a"])).toThrow(/unauthorized entity/);
    expect(() => validateWorldCommands(Array.from({ length: 65 }, () => ({ type: "EMIT_EVENT", eventType: "SPAM", payload: null })), permissions)).toThrow(/budget exceeded/);
  });

  it("rejects malformed and undeclared command types", () => {
    expect(() => validateWorldCommands([{ type: "FETCH_URL", url: "https://example.com" }], permissions)).toThrow(/Invalid world command/);
  });
});
