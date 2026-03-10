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
    description: "Search the internet for real-time or recent information. Use only when up-to-date information is required. Do NOT use for general programming or conceptual questions.",
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
      "Execute JavaScript code for calculations or data processing. Do NOT use this tool to generate code examples for the user. If the user only asks for code, return it as text instead.",
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
You are an intelligent AI assistant.

You have access to tools but MUST decide carefully when to use them.

Rules:

1. If the user asks for general knowledge, explanations, tutorials, or code examples,
DO NOT use any tools. Simply answer with text.

Example:
- "How to create an Express server?"
- "Explain JavaScript closures"
- "Write a Python script"

These should return code or explanations WITHOUT executing anything.

2. Use the internet_search tool ONLY when the user asks for:
- latest news
- current events
- real-time information
- recent data
- things that may have changed recently.

Examples:
- "Latest AI news"
- "Bitcoin price today"
- "What happened in tech today?"

3. Use the code_execution tool ONLY when computation or execution is necessary.

Examples:
- complex calculations
- generating computed results
- running algorithms
- processing data

4. Never execute server code, shell commands, or scripts that start services.

5. Prefer answering directly when possible.

Always choose the safest option and avoid unnecessary tool calls.
`,
});
