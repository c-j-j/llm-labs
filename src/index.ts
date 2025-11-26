import express, { Request, Response } from "express";

type AskRequestBody = {
  question?: string;
};

const app = express();
const port = process.env.PORT ?? 3000;

app.use(express.json());

app.post("/ask", (req: Request<{}, {}, AskRequestBody>, res: Response) => {
  const { question } = req.body ?? {};

  if (!question || typeof question !== "string") {
    return res.status(400).json({ message: "A 'question' field is required." });
  }

  res.json({ message: question });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
