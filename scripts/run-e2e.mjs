import { spawn } from "node:child_process";
import { access, readdir, stat } from "node:fs/promises";
import { createServer } from "node:http";
import net from "node:net";
import path from "node:path";
import process from "node:process";
import next from "next";

const HOST = "127.0.0.1";
const PORT = 3100;
const BASE_URL = `http://${HOST}:${PORT}`;
const ROOT = process.cwd();
const PLAYWRIGHT_CLI = path.join(ROOT, "node_modules", "@playwright", "test", "cli.js");
const BUILD_ID = path.join(ROOT, ".next", "BUILD_ID");
const READINESS_TIMEOUT_MS = 120_000;
const CLEANUP_TIMEOUT_MS = 10_000;

let nextApp;
let httpServer;
let cleanupPromise;

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function portIsListening() {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: HOST, port: PORT });
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("error", () => resolve(false));
    socket.setTimeout(1_000, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

async function newestMtime(target) {
  const details = await stat(target);
  if (!details.isDirectory()) return details.mtimeMs;
  const entries = await readdir(target, { withFileTypes: true });
  const times = await Promise.all(entries.map((entry) => newestMtime(path.join(target, entry.name))));
  return Math.max(details.mtimeMs, ...times);
}

async function assertCurrentBuild() {
  await access(BUILD_ID);
  const buildTime = (await stat(BUILD_ID)).mtimeMs;
  const inputs = ["app", "lib", "next.config.ts", "package.json"];
  const newestInput = Math.max(...await Promise.all(inputs.map((item) => newestMtime(path.join(ROOT, item)))));
  if (buildTime < newestInput) {
    throw new Error("The production build is missing or stale. Run `npm run build` before `npm run test:e2e`.");
  }
}

async function waitForReady() {
  const deadline = Date.now() + READINESS_TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(BASE_URL, { signal: AbortSignal.timeout(2_000) });
      if (response.ok) return;
    } catch {
      // Startup connection failures are expected until Next begins listening.
    }
    await delay(200);
  }
  throw new Error(`Next server did not become ready within ${READINESS_TIMEOUT_MS} ms.`);
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: ROOT, shell: false, stdio: "inherit", ...options });
    child.once("error", reject);
    child.once("exit", (code, signal) => resolve({ code, signal }));
  });
}

async function stopOwnedServer() {
  if (cleanupPromise !== undefined) return cleanupPromise;
  cleanupPromise = (async () => {
    if (httpServer !== undefined && httpServer.listening) {
      httpServer.closeIdleConnections();
      await new Promise((resolve, reject) => {
        httpServer.close((cause) => cause === undefined ? resolve() : reject(cause));
      });
    }
    if (nextApp !== undefined) await nextApp.close();

    const deadline = Date.now() + CLEANUP_TIMEOUT_MS;
    while (Date.now() < deadline) {
      if (!(await portIsListening())) return;
      await delay(100);
    }
    throw new Error(`Owned HTTP server closed, but ${HOST}:${PORT} is still listening.`);
  })();
  return cleanupPromise;
}

async function main() {
  await assertCurrentBuild();
  if (await portIsListening()) {
    throw new Error(`${HOST}:${PORT} is already occupied; refusing to reuse or terminate an unowned server.`);
  }

  nextApp = next({ dev: false, dir: ROOT, hostname: HOST, port: PORT });
  await nextApp.prepare();
  const handle = nextApp.getRequestHandler();
  httpServer = createServer((request, response) => {
    void handle(request, response).catch((cause) => {
      console.error("Next request handling failed.", cause);
      if (!response.headersSent) response.writeHead(500);
      response.end();
    });
  });
  await new Promise((resolve, reject) => {
    httpServer.once("error", reject);
    httpServer.listen(PORT, HOST, resolve);
  });

  let playwrightResult;
  try {
    await waitForReady();
    playwrightResult = await run(process.execPath, [PLAYWRIGHT_CLI, "test"]);
  } finally {
    await stopOwnedServer();
  }

  if (await portIsListening()) {
    throw new Error(`E2E cleanup failed: ${HOST}:${PORT} is still listening.`);
  }
  if (playwrightResult.signal !== null) {
    throw new Error(`Playwright terminated by signal ${playwrightResult.signal}.`);
  }
  process.exitCode = playwrightResult.code ?? 1;
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => {
    void stopOwnedServer()
      .catch((cause) => console.error("E2E server cleanup failed.", cause))
      .finally(() => { process.exitCode = signal === "SIGINT" ? 130 : 143; });
  });
}

main().catch(async (cause) => {
  console.error(cause instanceof Error ? cause.message : cause);
  try { await stopOwnedServer(); } catch (cleanupCause) { console.error("E2E server cleanup failed.", cleanupCause); }
  process.exitCode = 1;
});
