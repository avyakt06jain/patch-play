import { z } from "zod";

export const pointSchema = z.object({ x: z.number().int().nonnegative(), y: z.number().int().nonnegative() });

export const incidentSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  file: z.string().startsWith("/"),
  line: z.number().int().positive(),
  trigger: pointSchema,
  mode: z.enum(["enter", "interact"]),
  functionName: z.string().min(1),
  liveArgs: z.array(z.unknown()),
  successValue: z.unknown(),
  checkpoint: pointSchema,
  hint: z.string(),
  scannerHint: z.string(),
  tests: z.array(z.object({ name: z.string(), args: z.array(z.unknown()), expected: z.unknown() })).min(1),
});

export const levelSchema = z.object({
  id: z.string().min(1), number: z.string(), title: z.string(), wing: z.enum(["transit", "signal", "cargo", "reactor"]),
  entryFile: z.string().startsWith("/"), spawn: pointSchema, scanner: pointSchema, map: z.array(z.string()).min(3),
  editableFiles: z.array(z.string()), readOnlyFiles: z.array(z.string()), files: z.record(z.string(), z.string()), incidents: z.array(incidentSchema).length(2),
}).superRefine((level, context) => {
  const width = level.map[0]?.length;
  if (!level.map.every((row) => row.length === width)) context.addIssue({ code: "custom", path: ["map"], message: "Every map row must have the same width." });
  const allFiles = new Set(Object.keys(level.files));
  for (const path of [level.entryFile, ...level.editableFiles, ...level.readOnlyFiles]) {
    if (!allFiles.has(path)) context.addIssue({ code: "custom", path: ["files"], message: `Missing virtual file: ${path}` });
  }
  for (const incident of level.incidents) {
    if (!level.editableFiles.includes(incident.file)) context.addIssue({ code: "custom", path: ["incidents"], message: `${incident.id} source must be editable.` });
  }
});

export const runtimeMessageSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("COMPILE"), requestId: z.string(), files: z.record(z.string(), z.string()), entryFile: z.string() }),
  z.object({ type: z.literal("RUN"), requestId: z.string(), bundleId: z.string(), calls: z.array(z.object({ functionName: z.string(), args: z.array(z.unknown()) })) }),
  z.object({ type: z.literal("DISPOSE"), requestId: z.string(), bundleId: z.string() }),
]);

export function validateLevels(levels) {
  return levels.map((level) => levelSchema.parse(level));
}

export function deepEqual(left, right) {
  if (Object.is(left, right)) return true;
  if (typeof left !== typeof right || left === null || right === null) return false;
  if (Array.isArray(left) || Array.isArray(right)) {
    return Array.isArray(left) && Array.isArray(right) && left.length === right.length && left.every((value, index) => deepEqual(value, right[index]));
  }
  if (typeof left !== "object") return false;
  const leftKeys = Object.keys(left).sort();
  const rightKeys = Object.keys(right).sort();
  return leftKeys.length === rightKeys.length && leftKeys.every((key, index) => key === rightKeys[index] && deepEqual(left[key], right[key]));
}
