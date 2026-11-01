# MarketPulse AI — ChatGPT MCP App starter

A beginner-friendly first version of a ChatGPT-connected market-news tool.

## Included
- `search_market_news`: fetch recent Google News RSS headlines for a USA or India market query.
- `marketpulse_company_brief`: fetch company headlines and return source material plus Bengali/English analysis instructions.
- `/health`: simple server health check.
- `/mcp`: Streamable HTTP MCP endpoint.

## Important limitations
- This is a starter project, not a published ChatGPT app.
- Headlines come from Google News RSS search. Availability, freshness, and regional coverage can vary.
- It does not provide live stock prices, exchange-grade market data, guaranteed sentiment accuracy, or trading signals.
- Do not use it as investment advice. Verify headlines and financial data independently.
- No OpenAI API key is required for this MCP server itself. If you later add OpenAI API-powered analysis, API billing is separate from a ChatGPT subscription.
- A public HTTPS host is required for ChatGPT to reach the server. Hosting may have free tiers but can have limits or become paid.
- ChatGPT custom MCP app access and publishing depend on account/workspace eligibility and OpenAI review.

## Run (requires Node.js 18+)
```bash
npm install
npm start
```
Server listens on `http://localhost:8787/mcp`; health check is `http://localhost:8787/health`.

## Test locally
Use MCP Inspector:
```bash
npx @modelcontextprotocol/inspector
```
Choose Streamable HTTP and connect to `http://localhost:8787/mcp`.

## ChatGPT connection
After deploying this server to a public HTTPS address, connect the endpoint:
`https://YOUR-HOST/mcp`

In ChatGPT, custom MCP connections are currently managed from the web experience and are subject to workspace/account permissions. Follow the current OpenAI documentation:
- https://developers.openai.com/plugins/build/app-quickstart
- https://help.openai.com/en/articles/12584461-connecting-custom-mcp-servers-in-chatgpt
- https://help.openai.com/en/articles/12515353-building-with-the-apps-sdk

## Tool examples
Ask the connected app:
- "Search USA market news for NVIDIA."
- "Find India market news for Reliance."
- "Give me a Bengali company brief for Apple in the USA market."
