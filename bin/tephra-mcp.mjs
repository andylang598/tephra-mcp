#!/usr/bin/env node
// tephra-mcp: stdio bridge to Tephra's hosted MCP server. It starts mcp-remote (pinned in package.json) pointed at
// https://tephra.obsidian-metrics.com/mcp and nothing else. Sign-in is Tephra's own OAuth 2.1 flow, run by mcp-remote
// in your browser; this package never sees, stores or sends a password, key or token. It refuses any other host.
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { realpathSync } from "node:fs";
import path from "node:path";

export const ALLOWED_HOST = "tephra.obsidian-metrics.com";
export const ALLOWED_PATH = "/mcp";
export const DEFAULT_URL = "https://" + ALLOWED_HOST + ALLOWED_PATH;

// Returns the one URL the bridge may connect to, or throws. No argument can change the host.
export function resolveUrl(env = process.env, argv = []) {
  if (argv.length) throw new Error("tephra-mcp takes no arguments (got: " + argv.join(" ") + "); it only connects to " + DEFAULT_URL);
  const raw = env.TEPHRA_MCP_URL || DEFAULT_URL;
  let u;
  try { u = new URL(raw); } catch { throw new Error("TEPHRA_MCP_URL is not a URL"); }
  if (u.protocol !== "https:") throw new Error("refused: only https is allowed");
  if (u.username || u.password) throw new Error("refused: credentials in the URL are not allowed");
  if (u.hostname !== ALLOWED_HOST) throw new Error("refused: this bridge only connects to " + ALLOWED_HOST);
  if (u.port) throw new Error("refused: a custom port is not allowed");
  if (u.pathname !== ALLOWED_PATH || u.search || u.hash) throw new Error("refused: the path must be exactly " + ALLOWED_PATH);
  return u.href;
}

export function bridgeCommand(url, nodePath = process.execPath, resolveBin = defaultResolveBin) {
  return { command: nodePath, args: [resolveBin(), url] };
}

function defaultResolveBin() {
  const require = createRequire(import.meta.url);
  return path.join(path.dirname(require.resolve("mcp-remote/package.json")), "dist", "proxy.js");
}

function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 1 && argv[0] === "--print-config") {
    const url = resolveUrl(process.env, []);
    console.log(JSON.stringify({ url, bridge: "mcp-remote", note: "stdio <-> Streamable HTTP, OAuth 2.1 sign-in in your browser" }));
    return;
  }
  let url;
  try { url = resolveUrl(process.env, argv); } catch (e) { console.error("tephra-mcp: " + e.message); process.exit(2); }
  const { command, args } = bridgeCommand(url);
  const child = spawn(command, args, { stdio: "inherit" });
  for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => child.kill(sig));
  child.on("exit", (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) main();
