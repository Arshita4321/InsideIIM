import { tool } from "@langchain/core/tools";
import { z } from "zod";
import axios from "axios";
import * as cheerio from "cheerio";

// Web search using Serper API (Google Search)
export const webSearchTool = tool(
  async ({ query }) => {
    try {
      const response = await axios.post(
        "https://google.serper.dev/search",
        { q: query, num: 5 },
        {
          headers: {
            "X-API-KEY": process.env.SERPER_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      const results = response.data.organic || [];
      if (results.length === 0) return "No results found for this query.";

      return results
        .slice(0, 5)
        .map((r, i) => `[${i + 1}] ${r.title}\n${r.snippet}\nURL: ${r.link}`)
        .join("\n\n");
    } catch (err) {
      return `Search failed: ${err.message}`;
    }
  },
  {
    name: "web_search",
    description:
      "Search the web for information about a company. Use specific queries like 'Company revenue 2024', 'Company funding rounds', 'Company founder background'.",
    schema: z.object({
      query: z.string().describe("The search query"),
    }),
  }
);

// Scrape a specific URL for content
export const scrapeUrlTool = tool(
  async ({ url }) => {
    try {
      const response = await axios.get(url, {
        timeout: 8000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      const $ = cheerio.load(response.data);
      $("script, style, nav, footer, header, aside").remove();

      const text = $("body").text().replace(/\s+/g, " ").trim();
      return text.slice(0, 2000) || "Could not extract content from page.";
    } catch (err) {
      return `Could not scrape URL: ${err.message}`;
    }
  },
  {
    name: "scrape_url",
    description:
      "Scrape the content of a specific URL to get detailed information. Use after web_search to get full article content.",
    schema: z.object({
      url: z.string().describe("The URL to scrape"),
    }),
  }
);

// Screener.in search for Indian companies
export const screenerSearchTool = tool(
  async ({ company }) => {
    try {
      const searchUrl = `https://www.screener.in/api/company/search/?q=${encodeURIComponent(company)}&v=3`;
      const response = await axios.get(searchUrl, { timeout: 6000 });
      const results = response.data;

      if (!results || results.length === 0) {
        return "Company not found on Screener.in (may not be a listed Indian company).";
      }

      const first = results[0];
      const detailUrl = `https://www.screener.in/company/${first.url}/`;

      const detailResponse = await axios.get(detailUrl, {
        timeout: 8000,
        headers: { "User-Agent": "Mozilla/5.0" },
      });

      const $ = cheerio.load(detailResponse.data);
      const ratios = {};

      $("#top-ratios li").each((_, el) => {
        const name = $(el).find(".name").text().trim();
        const val = $(el).find(".value").text().trim();
        if (name && val) ratios[name] = val;
      });

      if (Object.keys(ratios).length === 0) {
        return `Found ${first.name} on Screener.in but could not extract financial data.`;
      }

      return (
        `Screener.in data for ${first.name}:\n` +
        Object.entries(ratios)
          .map(([k, v]) => `${k}: ${v}`)
          .join("\n")
      );
    } catch (err) {
      return `Screener.in lookup failed: ${err.message}`;
    }
  },
  {
    name: "screener_search",
    description:
      "Search Screener.in for financial data of Indian listed companies. Gets P/E ratio, market cap, revenue, profit etc.",
    schema: z.object({
      company: z.string().describe("Company name to search on Screener.in"),
    }),
  }
);

export const ALL_TOOLS = [webSearchTool, scrapeUrlTool, screenerSearchTool];