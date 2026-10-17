import { describe, expect, it } from "vitest";
import { parseExpression, runBridgeTests, shouldCollapse } from "./rules";

describe("bridge rule", () => {
  it("reproduces the real boundary defect in the live >= rule", () => {
    expect(shouldCollapse(1, ">=")).toBe(false);
    expect(shouldCollapse(2, ">=")).toBe(false);
    expect(shouldCollapse(3, ">=")).toBe(true);
  });

  it("passes all four boundary checks with the corrected > rule", () => {
    expect(runBridgeTests(">").every((test) => test.passed)).toBe(true);
  });

  it("reports only the safe-boundary case failing for the buggy rule", () => {
    const failures = runBridgeTests(">=").filter((test) => !test.passed);
    expect(failures.map((test) => test.id)).toEqual(["safe-boundary"]);
  });

  it("accepts only constrained expressions and never arbitrary JavaScript", () => {
    expect(parseExpression(">")).toMatchObject({ valid: true, operator: ">" });
    expect(parseExpression("return stepsOnBridge > maxSafeSteps;")).toMatchObject({ valid: true, operator: ">" });
    expect(parseExpression("window.alert('oops')").valid).toBe(false);
  });
});
