export {};

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "nomic-embed-text";
const QDRANT_URL = process.env.QDRANT_URL ?? "http://localhost:6333";
const QDRANT_COLLECTION = process.env.QDRANT_COLLECTION ?? "demo";

type OllamaEmbeddingResponse = {
  embedding?: number[];
  error?: string;
};

type QdrantUpsertResponse = {
  status?: string;
  result?: unknown;
  time?: number;
};

const TEXT =
  process.env.TEXT_TO_EMBED ??
  "The Eiffel Tower is located in Paris, France, and was completed in 1889.";

async function embedText(text: string): Promise<number[]> {
  const response = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: OLLAMA_MODEL, prompt: text }),
  });

  const data = (await response.json().catch(() => ({}))) as OllamaEmbeddingResponse;

  if (!response.ok || !data.embedding) {
    throw new Error(
      `Embedding failed: ${response.status} ${response.statusText} ${data.error ?? ""}`.trim()
    );
  }

  return data.embedding;
}

async function saveToQdrant(vector: number[], text: string) {
  const id = Date.now();
  const payload = {
    points: [
      {
        id,
        vector,
        payload: {
          text,
          model: OLLAMA_MODEL,
        },
      },
    ],
  };

  const response = await fetch(`${QDRANT_URL}/collections/${QDRANT_COLLECTION}/points`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => ({}))) as QdrantUpsertResponse;

  if (!response.ok) {
    throw new Error(
      `Qdrant upsert failed: ${response.status} ${response.statusText} ${JSON.stringify(data)}`
    );
  }

  return { id, data };
}

async function main() {
  console.log(`Embedding text with model '${OLLAMA_MODEL}': "${TEXT}"`);
  const embedding = await embedText(TEXT);
  console.log(`Embedding length: ${embedding.length}`);
  console.log("Embedding preview:", embedding.slice(0, 5));

  const { id, data } = await saveToQdrant(embedding, TEXT);
  console.log(`Saved to Qdrant collection '${QDRANT_COLLECTION}' with id ${id}`);
  console.log("Qdrant response:", data);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
