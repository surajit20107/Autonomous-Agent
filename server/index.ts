import express from "express";
import cors from "cors";
import helmet from "helmet";
import { agent } from "./agent/agent.js";
import "dotenv/config";
import chalk from "chalk";

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
  }),
);

// ping route for cron-job.org
app.get("/", (_, res) => {
  res.status(200).json({
    message: "API up and running 🚀",
  });
});

// ping route for uptime robot
app.head("/", (_, res) => {
  res.status(200).json({
    message: "API up and running 🚀",
  });
});

// agent route
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
  } catch (error: any) {
    // console.log("Full error:", error);

    const status = error?.status || error?.code || error?.response?.status;
    const message = error?.message || "";

    if (
      status === 429 ||
      message.includes("RESOURCE_EXHAUSTED") ||
      message.includes("quota") ||
      message.includes("rate limit")
    ) {
      console.log(chalk.red("‼️Gemini API quota exhausted‼️"));
    }

    res.status(500).json({
      message: "Error processing request",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.listen(port, () => {
  console.log(chalk.green(`Server running on port: ${port}`));
});
