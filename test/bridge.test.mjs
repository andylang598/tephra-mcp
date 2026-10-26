// node --test test/   (offline: no network, no sign-in)
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolveUrl, bridgeCommand, DEFAULT_URL } from "../bin/tephra-mcp.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BIN = path.join(HERE, "..", "bin", "tephra-mcp.mjs");

test("CONTROL: the default and the exact Tephra URL are accepted", () => {
  assert.equal(resolveUrl({}, []), DEFAULT_URL);
  assert.equal(resolveUrl({ TEPHRA_MCP_URL: "https://tephra.obsidian-metrics.com/mcp" }, []), DEFAULT_URL);
});
test("MUST-FAIL: every other host, scheme, port, path, credential or argument is refused", () => {
  const bad = [
    "https://evil.example/mcp", "https://tephra.obsidian-metrics.com.evil.example/mcp", "https://evil-tephra.obsidian-metrics.com/mcp",
    "https://tephra.obsidian-metrics.com@evil.example/mcp", "https://user:pw@tephra.obsidian-metrics.com/mcp", "http://tephra.obsidian-metrics.com/mcp",
    "https://tephra.obsidian-metrics.com:8443/mcp", "https://tephra.obsidian-metrics.com/other", "https://tephra.obsidian-metrics.com/mcp?x=1",
    "https://tephra.obsidian-metrics.com/mcp#frag", "https://obsidian-metrics.com/mcp", "https://TEPHRA.obsidian-metrics.com.evil.example/mcp", "not a url", "ftp://tephra.obsidian-metrics.com/mcp",
  ];
  for (const u of bad) assert.throws(() => resolveUrl({ TEPHRA_MCP_URL: u }, []), undefined, u);
  for (const a of [["--header", "x"], ["https://evil.example/mcp"], ["--transport", "sse"], ["--debug"]]) assert.throws(() => resolveUrl({}, a), /takes no arguments/, a.join(" "));
});
test("the command is node + the pinned mcp-remote entry + the one URL, nothing else", () => {
  const c = bridgeCommand(DEFAULT_URL, "node", () => "/x/mcp-remote/dist/proxy.js");
  assert.deepEqual(c, { command: "node", args: ["/x/mcp-remote/dist/proxy.js", DEFAULT_URL] });
});
test("package.json pins mcp-remote exactly and has no install scripts", () => {
  const pkg = JSON.parse(readFileSync(path.join(HERE, "..", "package.json"), "utf8"));
  assert.match(pkg.dependencies["mcp-remote"], /^\d+\.\d+\.\d+$/);
  for (const k of ["preinstall", "install", "postinstall", "prepare"]) assert.equal(pkg.scripts[k], undefined, k);
  assert.deepEqual(Object.keys(pkg.dependencies), ["mcp-remote"]);
});
test("the installed bin starts, resolves mcp-remote and prints the config without connecting", () => {
  const r = spawnSync(process.execPath, [BIN, "--print-config"], { encoding: "utf8", env: { ...process.env, TEPHRA_MCP_URL: "" } });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(JSON.parse(r.stdout).url, DEFAULT_URL);
  const evil = spawnSync(process.execPath, [BIN], { encoding: "utf8", env: { ...process.env, TEPHRA_MCP_URL: "https://evil.example/mcp" } });
  assert.equal(evil.status, 2);
  assert.match(evil.stderr, /refused: this bridge only connects to tephra\.obsidian-metrics\.com/);
  const extra = spawnSync(process.execPath, [BIN, "https://evil.example/mcp"], { encoding: "utf8" });
  assert.equal(extra.status, 2);
});
test("INSTRUMENT CAN FAIL: with the host check loosened in a copy, the evil host is accepted", async () => {
  const src = readFileSync(BIN, "utf8");
  const mutated = src.replace(/if \(u\.hostname !== ALLOWED_HOST\)[^\n]*\n/, "");
  assert.notEqual(mutated, src);
  const dir = mkdtempSync(path.join(tmpdir(), "bridge_mut_"));
  const f = path.join(dir, "mut.mjs");
  writeFileSync(f, mutated);
  const M = await import(pathToFileURL(f).href).catch(() => null);
  // the copy lives outside node_modules reach, so only resolveUrl is exercised (imports of mcp-remote happen lazily)
  assert.ok(M, "mutant loads");
  assert.equal(M.resolveUrl({ TEPHRA_MCP_URL: "https://evil.example/mcp" }, []), "https://evil.example/mcp");
});
