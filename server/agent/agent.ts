import { createAgent } from "langchain";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { tool } from "langchain";
import { MemorySaver } from "@langchain/langgraph";
import { z } from "zod";
import { TavilySearch } from "@langchain/tavily";
import { NodeVM } from "vm2";
import "dotenv/config";

const api_key = process.env.GEMINI_API_KEY;

const checkpointer = new MemorySaver();

if (!api_key) {
  throw new Error("GEMINI_API_KEY is not defined");
}

const vm = new NodeVM({
  console: "redirect",
  sandbox: {
    fetch,
  },
  timeout: 5000,
  eval: false,
  wasm: false,
  require: {
    external: false,
    builtin: [],
  },
});

const tavily = new TavilySearch({
  tavilyApiKey: process.env.TAVILY_API_KEY as string,
})

const internet_search = tool(
  async ({
    query,
    maxResults = 5,
    topic = "general",
    searchDepth = "advanced",
    includeRawContent = false,
  }: {
    query: string;
    maxResults?: number;
    topic?: "general" | "news" | "finance";
    searchDepth?: "basic" | "advanced";
    includeRawContent?: boolean;
  }) => {
    return await tavily.invoke({
      query,
      maxResults,
      topic,
      searchDepth,
      includeRawContent,
    });
  },
  {
    name: "internet_search",
    description: "Search the internet for up-to-date information.",
    schema: z.object({
      query: z.string().describe("The search query"),
      maxResults: z.number().optional().default(5),
      topic: z.enum(["general", "news", "finance"]).optional().default("general"),
      searchDepth: z.enum(["basic", "advanced"]).optional().default("advanced"),
      includeRawContent: z.boolean().optional().default(false),
    }),
  }
);

const code_execution = tool(
  async ({ code }: { code: string }) => {
    console.log("Executing code: ", code);
    try {
      const result = await vm.run(code);
      return result;
    } catch (error) {
      return error;
    }
  },
  {
    name: "code_execution",
    description:
      "Execute JavaScript code in Node.js and return the result. The code can use fetch() to call external APIs but use this tool only with public API where don't need a api key this tool can retrieve live internet data and realtime data like date, time, weather, and much more there are infinity possibilities with this tool.",
    schema: z.object({
      code: z
        .string()
        .describe(
          "JavaScript code to execute. The code may fetch APIs and return the result.",
        ),
    }),
  },
);

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: api_key,
});

export const agent = createAgent({
  model,
  tools: [internet_search, code_execution],
  checkpointer,
  systemPrompt: `
You are an AI agent that can seatch the web also can execute JavaScript code using the internet_search and code_execution tool.

The code_execution tool runs Node.js code and internet_search can access the internet for latest data and current informations.
`,
});
