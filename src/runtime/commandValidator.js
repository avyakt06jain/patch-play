import { z } from "zod";

const point = z.object({ x: z.number().int(), y: z.number().int() });
const command = z.discriminatedUnion("type", [
  z.object({ type: z.literal("SET_ENTITY_STATE"), entityId: z.string(), state: z.string() }),
  z.object({ type: z.literal("SET_COMPONENT"), entityId: z.string(), component: z.string(), value: z.unknown() }),
  z.object({ type: z.literal("MOVE_ENTITY"), entityId: z.string(), target: point }),
  z.object({ type: z.literal("GRANT_ITEM"), playerId: z.string(), itemId: z.string() }),
  z.object({ type: z.literal("CONSUME_ITEM"), playerId: z.string(), itemId: z.string() }),
  z.object({ type: z.literal("SET_OBJECTIVE"), objectiveId: z.string(), status: z.enum(["locked", "active", "complete"]) }),
  z.object({ type: z.literal("EMIT_EVENT"), eventType: z.string(), payload: z.unknown() }),
  z.object({ type: z.literal("CREATE_CHECKPOINT"), checkpointId: z.string() }),
]);

export function validateWorldCommands(value, capabilities, entityIds = []) {
  if (!Array.isArray(value)) throw new Error("System hooks must return an array of world commands.");
  const maximum = capabilities.maxCommandsPerHook ?? 64;
  if (value.length > maximum) throw new Error(`Command budget exceeded: ${value.length}/${maximum}.`);
  const knownEntities = new Set(entityIds);
  return value.map((candidate, index) => {
    const parsed = command.safeParse(candidate);
    if (!parsed.success) throw new Error(`Invalid world command at index ${index}: ${parsed.error.issues[0]?.message}.`);
    if (!capabilities.allowedCommands.includes(parsed.data.type)) throw new Error(`Capability denied: ${parsed.data.type}.`);
    if ("entityId" in parsed.data && knownEntities.size && !knownEntities.has(parsed.data.entityId)) throw new Error(`Unknown or unauthorized entity: ${parsed.data.entityId}.`);
    return parsed.data;
  });
}

export function looksLikeWorldCommands(value) {
  return Array.isArray(value) && value.length > 0 && value.every((item) => item && typeof item === "object" && typeof item.type === "string");
}
