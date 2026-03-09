import express from "express";
import cors from "cors";

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.get("/", (_, res) => {
  res.status(200).json({
    message: "API up and running 🚀",
  })
});

app.listen(port, () => {
  console.log(`Server running on port: ${port}`)
})
