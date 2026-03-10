import express from "express";
import cors from "cors";
import helmet from "helmet";
import { agent } from "./agent/agent.js";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL,
}));

app.get("/", (_, res) => {
  res.status(200).json({
    message: "API up and running 🚀",
  });
});

app.post("/api/v1/agent", async (req, res) => {
  const { message, thread_id } = req.body;
  try {
    const result = await agent.invoke(
      {
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
      },
      {
        configurable: { thread_id },
      },
    );
    res.status(200).json({
      message: result.messages?.at(-1)?.content,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error processing request",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
