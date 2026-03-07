import "dotenv/config";
import { createAgent } from "langchain";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const api_key = process.env.GEMINI_API_KEY;

if (!api_key) {
  throw new Error("GEMINI_API_KEY is not defined");
}

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: api_key,
});

const agent = createAgent({
  model,
  tools: [],
});

const result = await agent.invoke({
  messages: [
    {
      role: "user",
      content: "What is the capital of France?",
    },
  ],
});

console.log(result?.messages?.[1]?.content);
