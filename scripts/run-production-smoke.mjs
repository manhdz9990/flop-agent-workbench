import { createServer } from "node:http";
import next from "next";

const hostname = "127.0.0.1";
const port = 3210;
const app = next({ dev: false, dir: process.cwd(), hostname, port });
let server;

try {
  await app.prepare();
  const handle = app.getRequestHandler();
  server = createServer((request, response) => void handle(request, response));
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, hostname, resolve);
  });

  const home = await fetch(`http://${hostname}:${port}/`);
  const malformed = await fetch(`http://${hostname}:${port}/api/inspect`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{bad",
  });
  const result = {
    homeStatus: home.status,
    contentType: home.headers.get("content-type"),
    nosniff: home.headers.get("x-content-type-options"),
    referrerPolicy: home.headers.get("referrer-policy"),
    frameOptions: home.headers.get("x-frame-options"),
    permissionsPolicy: home.headers.get("permissions-policy"),
    malformedInspectStatus: malformed.status,
    malformedInspectBody: await malformed.json(),
  };
  console.log(JSON.stringify(result));
  if (
    result.homeStatus !== 200 ||
    result.nosniff !== "nosniff" ||
    result.referrerPolicy !== "no-referrer" ||
    result.frameOptions !== "DENY" ||
    result.permissionsPolicy !== "camera=(), microphone=(), geolocation=(), payment=(), usb=()" ||
    result.malformedInspectStatus !== 400
  ) process.exitCode = 1;
} finally {
  if (server?.listening) {
    server.closeIdleConnections();
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
  await app.close();
}
