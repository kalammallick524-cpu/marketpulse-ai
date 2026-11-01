import { createServer } from "node:http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import Parser from "rss-parser";
import { z } from "zod";

const PORT = Number(process.env.PORT || 8787);
const parser = new Parser({ timeout: 12000 });

const server = new McpServer({
  name: "MarketPulse AI",
  version: "0.1.0",
});

function cleanText(value = "") {
  return String(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function queryForMarket(market, query) {
  const region = market === "India" ? "India stock market" : "US stock market";
  return `${query} ${region} stocks`;
}

async function getNews(market, query, limit = 8) {
  const q = encodeURIComponent(queryForMarket(market, query));
  const url = `https://news.google.com/rss/search?q=${q}&hl=${market === "India" ? "en-IN" : "en-US"}&gl=${market === "India" ? "IN" : "US"}&ceid=${market === "India" ? "IN:en" : "US:en"}`;
  const feed = await parser.parseURL(url);
  return (feed.items || []).slice(0, limit).map((item) => ({
    title: cleanText(item.title),
    source: cleanText(item.creator || item.source || "Google News feed"),
    published_at: item.isoDate || item.pubDate || "Not provided",
    url: item.link || "",
    snippet: cleanText(item.contentSnippet || item.content || ""),
  }));
}

server.registerTool(
  "search_market_news",
  {
    title: "Search stock market news",
    description: "Find recent publicly available news for a company, ticker, sector, or index in the USA or India. Returns titles, source links, and publication times.",
    inputSchema: {
      market: z.enum(["USA", "India"]).describe("Choose USA or India market"),
      query: z.string().min(1).max(120).describe("Company, ticker, index, or topic, e.g. NVIDIA, Reliance, NIFTY 50"),
      limit: z.number().int().min(1).max(10).optional().default(8)
    }
  },
  async ({ market, query, limit }) => {
    try {
      const items = await getNews(market, query, limit);
      return {
        content: [{
          type: "text",
          text: items.length
            ? JSON.stringify({ market, query, count: items.length, news: items }, null, 2)
            : `No matching headlines found for ${query}.`
        }],
        structuredContent: { market, query, count: items.length, news: items }
      };
    } catch (err) {
      return {
        isError: true,
        content: [{ type: "text", text: `News feed could not be reached: ${err.message}. Try again later.` }]
      };
    }
  }
);

server.registerTool(
  "marketpulse_company_brief",
  {
    title: "Company news brief",
    description: "Fetch recent news and provide source material for a concise Bengali or English company impact brief. The ChatGPT model should classify sentiment cautiously from the headlines and explain uncertainty.",
    inputSchema: {
      market: z.enum(["USA", "India"]),
      company: z.string().min(1).max(120),
      language: z.enum(["Bengali", "English"]).optional().default("Bengali")
    }
  },
  async ({ market, company, language }) => {
    try {
      const items = await getNews(market, company, 8);
      const instructions = language === "Bengali"
        ? "বাংলায় সংক্ষিপ্ত বিশ্লেষণ দাও: কী ঘটেছে, সম্ভাব্য কোম্পানি/শেয়ার প্রভাব, sentiment (Positive/Negative/Neutral), ঝুঁকি ও অনিশ্চয়তা। শুধু শিরোনাম দেখে নিশ্চিত সিদ্ধান্ত দেবে না।"
        : "Write a concise brief: what happened, possible company/stock impact, sentiment (Positive/Negative/Neutral), risks and uncertainty. Do not make definitive claims from headlines alone.";
      return {
        content: [{
          type: "text",
          text: `${instructions}\n\nCompany: ${company}\nMarket: ${market}\n\nNews source material:\n${JSON.stringify(items, null, 2)}\n\nImportant: This is informational news analysis, not investment advice. Verify facts and prices independently.`
        }],
        structuredContent: { market, company, language, news: items, analysis_prompt: instructions }
      };
    } catch (err) {
      return {
        isError: true,
        content: [{ type: "text", text: `Could not retrieve news: ${err.message}` }]
      };
    }
  }
);

const httpServer = createServer(async (req, res) => {
  if (req.url ===  (req.url?.split("?")[0] === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true, app: "MarketPulse AI", version: "0.1.0" }));
    return;
  }
  if (req.url?.startsWith("/mcp")) {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined
    });
    res.on("close", () => transport.close());
    await server.connect(transport);
    await transport.handleRequest(req, res);
    return;
  }
  res.writeHead(404);
  res.end("Not found. MCP endpoint: /mcp");
});

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`MarketPulse AI listening on port ${PORT}`);
});
