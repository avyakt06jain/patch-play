export class SandboxClient {
  constructor() {
    this.worker = new Worker(new URL("./sandbox.worker.js", import.meta.url), { type: "module" });
    this.pending = new Map();
    this.worker.onmessage = ({ data }) => {
      const request = this.pending.get(data.requestId);
      if (!request) return;
      this.pending.delete(data.requestId);
      if (data.ok) request.resolve(data.value); else request.reject(new Error(data.error));
    };
    this.worker.onerror = (error) => {
      for (const request of this.pending.values()) request.reject(new Error(error.message || "Sandbox worker failed."));
      this.pending.clear();
    };
  }

  send(type, payload, timeoutMs = 4000) {
    const requestId = crypto.randomUUID();
    return new Promise((resolve, reject) => {
      const timer = window.setTimeout(() => {
        this.pending.delete(requestId);
        reject(new Error(`${type.toLowerCase()} exceeded its runtime budget.`));
      }, timeoutMs);
      this.pending.set(requestId, {
        resolve: (value) => { window.clearTimeout(timer); resolve(value); },
        reject: (error) => { window.clearTimeout(timer); reject(error); },
      });
      this.worker.postMessage({ type, requestId, ...payload });
    });
  }

  compile(files, entryFile) { return this.send("COMPILE", { files, entryFile }); }
  run(bundleId, calls) { return this.send("RUN", { bundleId, calls }); }
  disposeBundle(bundleId) { return this.send("DISPOSE", { bundleId }); }
  terminate() { this.worker.terminate(); }
}

export function createFileMap(fileRecords) {
  return Object.fromEntries(fileRecords.map((file) => [file.path, file.content]));
}
