# Tephra MCP

[![Tephra MCP server](https://mcprush.com/badge/tephra-mcp/card.svg)](https://mcprush.com/to/tephra-mcp?ref=badge)

Documentation and config examples for **Tephra**, a hosted remote MCP server: one memory your AI tools share, tied to your account. Tools you connect recall from it and add to it. Besides documentation and configuration examples, it holds a small optional stdio bridge (`bin/`, `test/`, `package.json`, MIT) for AI apps that only speak stdio. Tephra itself is a paid hosted service by Obsidian Metrics.

- Server URL (Streamable HTTP): `https://tephra.obsidian-metrics.com/mcp`
- Connecting: add the server URL. Clients that support MCP OAuth sign in with your Obsidian account
  from the client; for others, use a personal AI key (`tpk_...`). Sign-in support varies by client,
  so check the connect guide for yours.
- Connect guide: [CONNECT.md](CONNECT.md) and https://tephra.obsidian-metrics.com/connect
- Registry metadata: [server.json](server.json); client config examples: [mcp-config-examples.json](mcp-config-examples.json)

## Features
- **One memory your AI tools share.** The connect page has steps for Claude (claude.ai, Desktop and mobile), ChatGPT, VS Code (GitHub Copilot), Cursor, Claude Code, Gemini CLI, Windsurf, Zed, Mistral Le Chat, Perplexity and any other app that can add a remote MCP server. Each connected tool recalls from the same memory and adds to it.
- **Three MCP tools** (a read-only key gets only the first two):
  - `tephra_recall`: ranked recall over your memory plus the shared library. `query` up to 4000 characters; `limit` 1-50 (default 10); optional `keywords` (up to 20 exact terms for the keyword arm), `mode` (`semantic`, `keyword` or `hybrid`) and `reader_order: "chronological"` (same rows oldest-first, each dated).
  - `tephra_search`: plain semantic search over the same memory, without recall's ranking extras. `query` up to 4000 characters; `limit` 1-100 (default 10).
  - `tephra_remember`: save one memory to your own account, never to the shared library. `text` up to 8000 characters; optional `region` (leave it out and Tephra files it), up to 10 `tags`, `importance` 1-5 (default 3). Tephra adds a `via-ai-key` tag and reports when the memory was already stored.
- **Tephra's directions on MCP:** recall, search and remember results can include a `<tephra_directions>` block with the same guidance Tephra's REST API returns: a recall-then-save directive, a warning (flagged `blocked`) when a save was made without a recent recall, a completeness note, the summary sheet and the "you may be missing" list. The summary sheet, the missing list and alerts index stored records and are fenced and labelled as data, not instructions. The server's `initialize` instructions ask the AI to call `tephra_recall` before answering questions that may depend on saved context and `tephra_remember` to save durable facts; the AI still decides when to call the tools.
- **Hybrid recall:** bge-m3 semantic search and a keyword arm fused by reciprocal rank, a cross-encoder rerank, and a bounded two-hop walk over linked memories.
- **Account-scoped by default:** each member is their own tenant; everything a member saves is tied to their account and is not visible to other members.
- **Shared library:** public knowledge (no member data), grown hourly from sources such as arXiv, PubMed, Federal Register and Crossref/OpenAlex; recall draws on it alongside your own memories.
- **Control and audit:** up to 10 active AI keys, each revocable, optionally read-only, with its own activity log; a connected-apps panel to disconnect OAuth apps; edit history, edit/delete/contest a memory, data export (app).
- **Prompt-injection hardening** on key/MCP results: invisible characters stripped, records capped at 4000 characters, results wrapped as notes-not-instructions.
- **Remote streamable-HTTP MCP, hosted on Cloudflare Workers;** nothing to self-host; the stdio bridge below is optional.

## Optional stdio bridge
Most AI apps connect to Tephra directly with the server URL above. For an app that only speaks stdio, this repository ships a bridge (`bin/tephra-mcp.mjs`, MIT) that starts [mcp-remote](https://www.npmjs.com/package/mcp-remote) (pinned to 0.15.2, published 2026-10-20 with GitHub provenance) pointed at `https://tephra.obsidian-metrics.com/mcp`:

```
npx -y github:andylang598/tephra-mcp#v1.0.0
```

Only this `github:` form is official; the names `tephra-mcp` and `tephra-mcp-bridge` are not registered on npm. Use the tag, not the default branch: npm ignores this repository's lockfile for git installs, so mcp-remote is exact but its own dependencies resolve within their version ranges when you install (the committed `package-lock.json` applies to `npm ci` from a clone). `npx -y github:andylang598/tephra-mcp#v1.0.0 --print-config` shows the one URL the bridge would use without connecting.

- Sign-in is Tephra's own OAuth 2.1 flow, run by mcp-remote in your browser. The bridge's own code never handles a password, key or token. mcp-remote keeps the sign-in tokens it receives in `~/.mcp-auth` on your machine (owner-only file mode); delete that folder to sign out.
- The bridge accepts one MCP URL, `https://tephra.obsidian-metrics.com/mcp`, and refuses any other host, scheme, port or path, and any argument except `--print-config`. The child process inherits your environment, so proxy and certificate settings you have set apply to it.
- The mcprush security grade for Tephra covers this bridge's source and its dependency tree as installed. It is not a review of the Tephra service, which runs at its own address.
- Tests: `npm test` from a clone (offline). Node 20.18.1 or newer.

## Limits
- Tephra is a **paid** product: no free tier. Access is Premium ($19/mo at the member rate through the Obsidian Metrics community, $29/mo direct) or a $399 one-time Tephra seat with no subscription; no usage metering. Keys and connections pause if the membership lapses.
- Rate limits: 60 requests per minute per AI key or connected app, plus a member-wide cap of 120 per minute.
- The AI must call `tephra_remember`; Tephra does not auto-capture chats and has no Gmail/Slack/Drive connectors.
- No image/audio ingest. Members cannot publish into the shared library.

## Benchmark
LongMemEval-S, all 500 questions, top-10 retrieval, gpt-4o-2024-08-06 judge, one run: 85.2% with a gpt-4o reader; 95.2% with a Claude Opus 5.5 reader (run via Claude Code sub-agents); same retrieval. Retrieval had at least one needed session in the top 10 for 467 of 470, and all needed sessions for 435. Not a ranking.
