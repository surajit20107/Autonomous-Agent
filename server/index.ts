import express from "express";
import cors from "cors";
import { agent } from "./agent/agent.js";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.get("/", (_, res) => {
  res.status(200).json({
    message: "API up and running 🚀",
  })
});

app.post("/api/agent", async (req, res) => {
  const { message, thread_id } = req.body;
  const result = await agent.invoke({
    messages: [{
      role: "user",
      content: message,
    }]
  }, {
    configurable: { thread_id}
  })

  res.json({
    message: result.messages?.at(-1)?.content
  })
})

app.listen(port, () => {
  console.log(`Server running on port: ${port}`)
})
