# Connect Tephra to your AI

## Sign-in flow
**OAuth sign-in (for clients that support MCP OAuth).** Add the server URL `https://tephra.obsidian-metrics.com/mcp`; clients that support MCP OAuth discover it from the server. Sign-in support varies by client.
1. Client calls `/mcp` without a token and gets HTTP 401 with `WWW-Authenticate: Bearer realm="tephra", resource_metadata="https://tephra.obsidian-metrics.com/.well-known/oauth-protected-resource/mcp", scope="memory:read memory:write"` (live probe 2026-10-09).
2. Protected-resource metadata: `https://tephra.obsidian-metrics.com/.well-known/oauth-protected-resource`. Authorization-server metadata: `https://tephra.obsidian-metrics.com/.well-known/oauth-authorization-server` (authorization_code + refresh_token, PKCE S256, public clients, dynamic client registration at `/oauth/register`, authorize `/oauth/authorize`, token `/oauth/token`, revoke `/oauth/revoke`; scopes `memory:read`, `memory:write`).
3. The user signs in with their **Obsidian account** and chooses Allow. The account must hold a paid Tephra entitlement (Premium, VIP or a Tephra seat) to use the tools.
4. Per-app instructions and a connected-apps/disconnect panel: https://tephra.obsidian-metrics.com/connect

**Personal AI key** for clients without OAuth sign-in: create a `tpk_...` key in the Tephra app (Connect your AI) and send `Authorization: Bearer tpk_...` (up to 10 keys, shown once, revocable).

OAuth discovery (the 401 challenge and both metadata documents) is verified live. If your client cannot complete sign-in, use a personal AI key.

## Install
These steps follow the live connect page at https://tephra.obsidian-metrics.com/connect. If anything here differs from that page, the page is right.

**Claude (claude.ai, Claude Desktop, Claude mobile):** Settings > Connectors > Add custom connector > name `Tephra`, URL `https://tephra.obsidian-metrics.com/mcp` > Add > Connect > sign in with your Obsidian account > Allow. In a chat, turn Tephra on from the tools menu. A connector added on the web also appears in Claude Desktop and mobile. (Free Claude plans allow one custom connector; Team and Enterprise owners add it once under Organization settings > Connectors.)

**ChatGPT:** Settings > Apps (Apps & Connectors) > under Advanced settings turn on Developer mode > Create app > name `Tephra`, paste the server URL, choose OAuth > sign in with your Obsidian account > Allow. In a chat, pick Tephra from the + menu. (Developer mode is available on Plus, Pro, Business, Enterprise and Edu plans; a workspace admin may need to allow it.)

**VS Code (GitHub Copilot agent mode):** use the Add to VS Code button on /connect, or run `MCP: Add Server`, choose HTTP and paste the server URL. Sign in with your Obsidian account when VS Code asks and choose Allow. Tephra's tools are listed under the tools button in Copilot Chat (Agent mode).

**Cursor:** use the Add to Cursor button on /connect and confirm Install, then in Settings > MCP choose Login (or Connect) next to tephra, sign in and choose Allow. Hand-written config (`~/.cursor/mcp.json` or project `.cursor/mcp.json`):
```json
{
  "mcpServers": {
    "tephra": { "url": "https://tephra.obsidian-metrics.com/mcp" }
  }
}
```
(JSON shape is Cursor's standard remote-server format; /connect itself only documents the button flow.)

**Claude Code:**
```
claude mcp add --transport http tephra https://tephra.obsidian-metrics.com/mcp
```
then start `claude`, type `/mcp`, pick `tephra` and choose Authenticate; sign in and choose Allow. (Alternatively, pass a personal AI key with `--header "Authorization: Bearer tpk_YOUR_KEY"`.)

**Gemini CLI:**
```
gemini mcp add --transport http tephra https://tephra.obsidian-metrics.com/mcp
```
then start `gemini` and type `/mcp auth tephra`; sign in and choose Allow.

**Windsurf (Cascade):** open Cascade > MCP servers panel > Add custom server (`mcp_config.json`), add `"tephra": { "serverUrl": "https://tephra.obsidian-metrics.com/mcp" }` and save; sign in with your Obsidian account when Windsurf asks.

**Zed:** agent panel settings > Add Custom Server > paste the server URL as a remote server named `tephra`; sign in when Zed asks.

**Mistral Le Chat:** Intelligence > Connectors > Add connector > Custom MCP connector > name `Tephra`, paste the server URL, choose OAuth > sign in > Allow.

**Perplexity:** Settings > Connectors > add a custom remote connector if your plan offers one > paste the server URL > sign in > Allow.

**Any other MCP app:** add a remote (HTTP / Streamable HTTP) MCP server with the server URL, choose OAuth if asked, sign in and choose Allow. If the app has no OAuth sign-in, use a personal AI key (above).

## Limits
- Tephra is a **paid** product: no free tier. Access is Premium ($19/mo at the member rate through the Obsidian Metrics community, $29/mo direct) or a $399 one-time Tephra seat with no subscription; no usage metering. Keys and connections pause if the membership lapses.
- Rate limits: 60 requests per minute per AI key or connected app, plus a member-wide cap of 120 per minute.
- The AI must call `tephra_remember`; Tephra does not auto-capture chats and has no Gmail/Slack/Drive connectors.
- No image/audio ingest. Members cannot publish into the shared library.
