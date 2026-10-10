# Tephra MCP

Documentation and config examples for **Tephra**, a hosted remote MCP server: one memory, tied to your account, shared by every AI you connect. This repository contains no source code; Tephra is a paid hosted service by Obsidian Metrics.

- Server URL (Streamable HTTP): `https://tephra.obsidian-metrics.com/mcp`
- Connecting: add the server URL and **sign in with OAuth** -- the client discovers it
  automatically, so there is nothing to install and no key to copy. A personal AI key
  (`tpk_...`) is a fallback for clients that cannot sign in.
- Connect guide: [CONNECT.md](CONNECT.md) and https://tephra.obsidian-metrics.com/connect
- Registry metadata: [server.json](server.json); client config examples: [mcp-config-examples.json](mcp-config-examples.json)

## Features
- **One memory for every AI you connect.** Claude, ChatGPT, Cursor, Claude Code, VS Code, Gemini CLI, Windsurf, Zed, Le Chat, Perplexity and other MCP apps all read and write the same memory.
- **Three MCP tools:** `tephra_recall` (ranked recall over your memory plus the shared library, query up to 2000 chars, limit 1-25), `tephra_search` (semantic search, limit 1-25), `tephra_remember` (write a memory to your own account: text up to 8000 chars, optional region, up to 10 tags, importance 1-5).
- **Hybrid recall:** bge-m3 semantic search + BM25 keyword search fused by reciprocal rank, cross-encoder rerank, and a graph walk over linked memories; 2.5 s recall budget.
- **Account-scoped by default:** each member is their own tenant; everything a member saves is tied to their account and is not visible to other members.
- **Shared library:** public knowledge (no member data), grown hourly from sources such as arXiv, PubMed, Federal Register, SEC EDGAR 8-K filings and Crossref/OpenAlex; recall draws on it alongside your own notes.
- **Control and audit:** per-key revocation, read-only keys, key activity log, edit history, edit/delete/contest a memory, data export (app).
- **Prompt-injection hardening** on key/MCP results: invisible characters stripped, records capped at 4000 chars, results wrapped as notes-not-instructions.
- **Remote streamable-HTTP MCP, hosted on Cloudflare Workers;** nothing to install or self-host.

## Limits
- Tephra is a **paid** product: no free tier. Access is Premium ($19/mo via the Skool community, $29/mo or $290/yr direct) or a $399 one-time Tephra seat; no usage metering.
- The MCP tools return ranked records only; the "you may be missing" completeness alert, summary sheet and push directive are not passed through MCP tools.
- The AI must call `tephra_remember`; Tephra does not auto-capture chats and has no Gmail/Slack/Drive connectors.
- No image/audio ingest. Members cannot publish into the shared library.

## Benchmark
LongMemEval-S, all 500 questions, top-10 retrieval, gpt-4o-2024-08-06 judge, one run: 85.2% with a gpt-4o reader; 95.2% with a Claude Opus 5.5 reader (run via Claude Code sub-agents); same retrieval. Retrieval had at least one needed session in the top 10 for 467 of 470, and all needed sessions for 435. Not a ranking.
