import "dotenv/config";
import { createAgent } from "langchain";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { tool } from "langchain";
import { MemorySaver } from "@langchain/langgraph"
import { z } from "zod";

const api_key = process.env.GEMINI_API_KEY;
const checkpointer = new MemorySaver();

if (!api_key) {
  throw new Error("GEMINI_API_KEY is not defined");
}

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

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: api_key,
});

const agent = createAgent({
  model,
  tools: [get_todos],
  checkpointer,
});

const result = await agent.invoke({
  messages: [
    {
      role: "user",
      content: "tell me the todo with id 4",
    },
  ],
}, {
  configurable: { thread_id: 420 }
});

const result2 = await agent.invoke({
  messages: [
    {
      role: "user",
      content: "which todo you just fetched ?",
    },
  ],
}, {
  configurable: { thread_id: 420 }
});

console.log(result?.messages?.at(-1)?.content)
console.log("Result 2:", result2?.messages?.at(-1)?.content)
