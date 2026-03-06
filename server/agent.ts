import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const agent = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GEMINI_API_KEY,
});

const res = await agent.invoke("What is the capital of France?")

console.log(res)