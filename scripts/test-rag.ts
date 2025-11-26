import { embedText } from "../src/lib/ollama";
import { ensureCollection, searchPoints } from "../src/lib/qdrant";

export {};

const LIMIT = Number(process.env.QDRANT_LIMIT ?? 5);
const COLLECTION = process.env.QDRANT_COLLECTION ?? "demo";

async function main() {
  const question = "tell me about the eiffle tower";
  const embedded = await embedText({ text: question });

  try {
    await ensureCollection(embedded.length);
  } catch (err) {
    throw new Error(
      `Collection '${COLLECTION}' may be using a different vector size. Expected ${embedded.length}. ` +
        `Adjust the collection (QDRANT_VECTOR_SIZE) or change QDRANT_COLLECTION. Original error: ${(err as Error).message}`
    );
  }

  const results = await searchPoints(embedded, LIMIT);
  console.log("Search results:", results);
}

main().catch((err) => {
  console.error("Unexpected error", err);
  process.exit(1);
});
