# Connect Tephra to your AI

## Sign-in flow
**Primary: OAuth sign-in (no key to copy).** Add the server URL `https://tephra.obsidian-metrics.com/mcp`; the client discovers OAuth automatically.
1. Client calls `/mcp` without a token and gets HTTP 401 with `WWW-Authenticate: Bearer realm="tephra", resource_metadata="https://tephra.obsidian-metrics.com/.well-known/oauth-protected-resource/mcp", scope="memory:read memory:write"` (live probe 2026-10-09).
2. Protected-resource metadata: `https://tephra.obsidian-metrics.com/.well-known/oauth-protected-resource`. Authorization-server metadata: `https://tephra.obsidian-metrics.com/.well-known/oauth-authorization-server` (authorization_code + refresh_token, PKCE S256, public clients, dynamic client registration at `/oauth/register`, authorize `/oauth/authorize`, token `/oauth/token`, revoke `/oauth/revoke`; scopes `memory:read`, `memory:write`).
3. The user signs in with their **Obsidian account** and chooses Allow. The account must hold a paid Tephra entitlement (Premium or Tephra seat) to use the tools.
4. Per-app instructions and a connected-apps/disconnect panel: https://tephra.obsidian-metrics.com/connect

**Fallback: personal AI key** for clients without OAuth: create a `tpk_...` key in the Tephra app (Connect your AI) and send `Authorization: Bearer tpk_...` (up to 10 keys, shown once, revocable).

The live OAuth token round trip has been proven.

## Install
**Claude Desktop / claude.ai / Claude mobile:** Settings > Connectors > Add custom connector > name `Tephra`, URL `https://tephra.obsidian-metrics.com/mcp` > Add > Connect > sign in with Obsidian account > Allow. (Free Claude plans allow one custom connector.)

**Claude Code:**
```
claude mcp add --transport http tephra https://tephra.obsidian-metrics.com/mcp
```
then run `claude`, type `/mcp`, pick `tephra`, choose Authenticate. (A key variant with `--header "Authorization: Bearer tpk_YOUR_KEY"` is standard Claude Code CLI usage but is not shown on /connect: UNVERIFIED wording.)

**Cursor** (`~/.cursor/mcp.json` or project `.cursor/mcp.json`; /connect offers an "Add to Cursor" button, then Settings > MCP > Login next to tephra):
```json
{
  "mcpServers": {
    "tephra": { "url": "https://tephra.obsidian-metrics.com/mcp" }
  }
}
```
(JSON shape is Cursor's standard remote-server format; /connect itself only documents the button flow.)

**Other:** VS Code (MCP: Add Server > HTTP), Gemini CLI (`gemini mcp add --transport http tephra https://tephra.obsidian-metrics.com/mcp`), Windsurf (`"tephra": { "serverUrl": "https://tephra.obsidian-metrics.com/mcp" }`), Zed, Le Chat, Perplexity, ChatGPT (Developer mode > Create app > OAuth): see https://tephra.obsidian-metrics.com/connect.

## Limits
- Tephra is a **paid** product: no free tier. Access is Premium ($19/mo via the Skool community, $29/mo or $290/yr direct) or a $399 one-time Tephra seat; no usage metering.
- The MCP tools return ranked records only; the "you may be missing" completeness alert, summary sheet and push directive are not passed through MCP tools.
- The AI must call `tephra_remember`; Tephra does not auto-capture chats and has no Gmail/Slack/Drive connectors.
- No image/audio ingest. Members cannot publish into the shared library.
