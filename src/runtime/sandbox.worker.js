import * as esbuild from "esbuild-wasm";
import wasmURL from "esbuild-wasm/esbuild.wasm?url";
import { getQuickJS } from "quickjs-emscripten";

const bundles = new Map();
let esbuildReady;
let quickJSReady;

function normalizePath(path) {
  const output = [];
  for (const segment of path.replaceAll("\\", "/").split("/")) {
    if (!segment || segment === ".") continue;
    if (segment === "..") output.pop(); else output.push(segment);
  }
  return `/${output.join("/")}`;
}

function dirname(path) {
  return path.slice(0, Math.max(1, path.lastIndexOf("/")));
}

function resolveFile(files, requested) {
  const normalized = normalizePath(requested);
  const candidates = [normalized, `${normalized}.ts`, `${normalized}.js`, `${normalized}/index.ts`];
  return candidates.find((candidate) => Object.hasOwn(files, candidate));
}

async function initializeCompiler() {
  if (!esbuildReady) esbuildReady = esbuild.initialize({ wasmURL, worker: false });
  await esbuildReady;
}

async function compile(files, entryFile) {
  await initializeCompiler();
  const started = performance.now();
  const vfsPlugin = {
    name: "patchplay-vfs",
    setup(build) {
      build.onResolve({ filter: /.*/ }, (args) => {
        if (/^(https?:|data:|node:)/.test(args.path) || (!args.path.startsWith(".") && !args.path.startsWith("/"))) {
          return { errors: [{ text: `External import blocked: ${args.path}` }] };
        }
        const base = args.kind === "entry-point" ? "/" : dirname(args.importer);
        const resolved = resolveFile(files, args.path.startsWith("/") ? args.path : `${base}/${args.path}`);
        return resolved ? { path: resolved, namespace: "patchplay-vfs" } : { errors: [{ text: `Virtual file not found: ${args.path}` }] };
      });
      build.onLoad({ filter: /.*/, namespace: "patchplay-vfs" }, (args) => ({
        contents: files[args.path],
        loader: args.path.endsWith(".ts") ? "ts" : "js",
        resolveDir: dirname(args.path),
      }));
    },
  };
  const result = await esbuild.build({
    entryPoints: [entryFile], bundle: true, write: false, format: "iife", globalName: "__PP_MODULE__",
    platform: "browser", target: "es2020", sourcemap: "inline", plugins: [vfsPlugin], logLevel: "silent",
  });
  if (performance.now() - started > 2000) throw new Error("Compilation exceeded the 2 second budget.");
  const code = result.outputFiles[0].text;
  const bundleId = `bundle-${crypto.randomUUID()}`;
  bundles.set(bundleId, code);
  return { bundleId, bytes: code.length, warnings: result.warnings.map((warning) => warning.text), durationMs: Math.round(performance.now() - started) };
}

async function execute(bundleId, calls) {
  const code = bundles.get(bundleId);
  if (!code) throw new Error("Compiled bundle is no longer available.");
  if (!quickJSReady) quickJSReady = getQuickJS();
  const QuickJS = await quickJSReady;
  const runtime = QuickJS.newRuntime();
  runtime.setMemoryLimit(32 * 1024 * 1024);
  runtime.setMaxStackSize(512 * 1024);
  const deadline = performance.now() + Math.min(1000, 50 * Math.max(1, calls.length));
  runtime.setInterruptHandler(() => performance.now() > deadline);
  const context = runtime.newContext();
  const logs = [];
  try {
    const consoleObject = context.newObject();
    const logFunction = context.newFunction("log", (...handles) => {
      if (logs.length < 200) logs.push(handles.map((handle) => context.dump(handle)).join(" "));
    });
    context.setProp(consoleObject, "log", logFunction);
    context.setProp(context.global, "console", consoleObject);
    logFunction.dispose();
    consoleObject.dispose();

    const boot = context.evalCode(code, "candidate.bundle.js");
    if (boot.error) {
      const error = context.dump(boot.error);
      boot.error.dispose();
      throw new Error(error?.message ?? String(error));
    }
    boot.value.dispose();

    const values = [];
    for (const call of calls) {
      const expression = `__PP_MODULE__[${JSON.stringify(call.functionName)}](...${JSON.stringify(call.args)})`;
      const result = context.evalCode(expression, "runtime-call.js");
      if (result.error) {
        const error = context.dump(result.error);
        result.error.dispose();
        throw new Error(error?.message ?? String(error));
      }
      values.push(context.dump(result.value));
      result.value.dispose();
    }
    return { values, logs };
  } finally {
    context.dispose();
    runtime.dispose();
  }
}

self.onmessage = async ({ data }) => {
  const { type, requestId } = data;
  try {
    if (type === "COMPILE") self.postMessage({ requestId, ok: true, value: await compile(data.files, data.entryFile) });
    else if (type === "RUN") self.postMessage({ requestId, ok: true, value: await execute(data.bundleId, data.calls) });
    else if (type === "DISPOSE") { bundles.delete(data.bundleId); self.postMessage({ requestId, ok: true, value: true }); }
    else throw new Error(`Unknown runtime message: ${type}`);
  } catch (error) {
    self.postMessage({ requestId, ok: false, error: error instanceof Error ? error.message : String(error) });
  }
};
