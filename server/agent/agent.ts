import { createAgent } from "langchain";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { tool } from "langchain";
import { MemorySaver } from "@langchain/langgraph";
import { z } from "zod";
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

const get_todos = tool(
  async ({ query }: { query: string }) => {
    const todos = await fetch(
      `https://jsonplaceholder.typicode.com/todos/${query}`,
    );
    const data = await todos.json();
    return data;
  },
  {
    name: "get_todos",
    description: "get todos from the api",
    schema: z.object({
      query: z.string().describe("the todo id to fetch"),
    }),
  },
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
  tools: [code_execution],
  checkpointer,
  systemPrompt: `
You are an AI agent that can execute JavaScript code using the code_execution tool.

The code_execution tool runs Node.js code and CAN access the internet using fetch().

If the user asks for:
- crypto prices
- weather
- live data
- API information

You MUST generate JavaScript code and call the code_execution tool to fetch the data.

Never say you cannot access external data.
`,
});
