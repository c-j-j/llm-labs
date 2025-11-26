import { embedText } from "../src/lib/ollama";
import { searchPoints } from "../src/lib/qdrant";

export { };

const LIMIT = Number(process.env.QDRANT_LIMIT ?? 5);

async function main() {
  const question = "tell me about the eiffle tower"
  const embedded = await embedText({ text: question })
  const results = await searchPoints(embedded, LIMIT);
  console.log("Search results:", results);
}

main().catch((err) => {
  console.error("Unexpected error", err);
  process.exit(1);
});
