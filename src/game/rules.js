export const MAX_SAFE_STEPS = 3;
export const BRIDGE_TESTS = [
  { id: "safe-entry", name: "Entry remains stable", step: 1, expectedCollapse: false },
  { id: "safe-midpoint", name: "Midpoint remains stable", step: 2, expectedCollapse: false },
  { id: "safe-boundary", name: "Boundary remains stable", step: 3, expectedCollapse: false },
  { id: "overflow-collapse", name: "Overflow triggers collapse", step: 4, expectedCollapse: true },
];
export function shouldCollapse(step, operator) {
  if (operator === ">=") return step >= MAX_SAFE_STEPS;
  if (operator === ">") return step > MAX_SAFE_STEPS;
  throw new Error("Unsupported comparison operator");
}
export function parseExpression(expression) {
  const match = expression.match(/^\s*(?:return\s+)?(?:stepsOnBridge\s*)?(>=|>)(?:\s*maxSafeSteps)?\s*;?\s*$/);
  return match ? { valid: true, operator: match[1], normalized: `stepsOnBridge ${match[1]} maxSafeSteps` } : { valid: false, error: "Enter >, or: stepsOnBridge > maxSafeSteps" };
}
export function createBridgeRule() {
  return { id: "bridge-boundary", source: { file: "bridge.rules.js", line: 5 }, allowedOperators: [">=", ">"], liveOperator: ">=", draftExpression: "stepsOnBridge >= maxSafeSteps", testedExpression: null, testedOperator: null, testResults: null, testError: null, candidateRevision: 1, testedRevision: null, deployedRevision: 0 };
}
export function runBridgeTests(expression) {
  const parsed = parseExpression(expression);
  if (!parsed.valid) return [];
  return BRIDGE_TESTS.map((test) => {
    const observedCollapse = shouldCollapse(test.step, parsed.operator);
    const passed = observedCollapse === test.expectedCollapse;
    return { ...test, expected: test.expectedCollapse ? "collapse" : "stable", observed: observedCollapse ? "collapse" : "stable", passed, reason: passed ? "Contract matched." : `Step ${test.step} should be stable at the safe boundary.` };
  });
}
