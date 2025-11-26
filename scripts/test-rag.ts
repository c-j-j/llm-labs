import { embedText } from "../src/lib/ollama";
import { ensureCollection, searchPoints } from "../src/lib/qdrant";

export { };

const LIMIT = Number(process.env.QDRANT_LIMIT ?? 5);
const COLLECTION = process.env.QDRANT_COLLECTION ?? "demo";

async function main() {
  const question = "tell me about the eiffle tower";
  const embedded = await embedText({ text: question });

  const results = await searchPoints(embedded, LIMIT);
  console.log("Search results:", results);
}

main().catch((err) => {
  console.error("Unexpected error", err);
  process.exit(1);
});
