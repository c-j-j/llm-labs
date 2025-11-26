import express, { Request, Response } from "express";
import { embedAndStore, searchWithEmbedding } from "./lib/rag";

type AskRequestBody = {
  question?: string;
};

type EmbedRequestBody = {
  text?: string;
};

type SearchRequestBody = {
  query?: string;
  limit?: number;
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

app.post("/embed", async (req: Request<{}, {}, EmbedRequestBody>, res: Response) => {
  const { text } = req.body ?? {};

  if (!text || typeof text !== "string") {
    return res.status(400).json({ message: "A 'text' field is required." });
  }

  try {
    const result = await embedAndStore({ text });
    res.json({
      id: result.id,
      embeddingLength: result.embedding.length,
      preview: result.embedding.slice(0, 5),
      qdrant: result.result,
    });
  } catch (err) {
    console.error("Embed failed", err);
    res.status(500).json({ message: "Embedding failed", error: (err as Error).message });
  }
});

app.post("/search", async (req: Request<{}, {}, SearchRequestBody>, res: Response) => {
  const { query, limit } = req.body ?? {};

  if (!query || typeof query !== "string") {
    return res.status(400).json({ message: "A 'query' field is required." });
  }

  try {
    const result = await searchWithEmbedding({ query, limit });
    res.json({
      embeddingLength: result.embedding.length,
      preview: result.embedding.slice(0, 5),
      results: result.results,
    });
  } catch (err) {
    console.error("Search failed", err);
    res.status(500).json({ message: "Search failed", error: (err as Error).message });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
