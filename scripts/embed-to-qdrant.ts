import { embedAndStore } from "../src/lib/rag";

export {};

const TEXT =
  process.env.TEXT_TO_EMBED ??
  "The Eiffel Tower is located in Paris, France, and was completed in 1889.";

async function main() {
  const result = await embedAndStore({ text: TEXT });
  console.log(`Embedded and stored text. Point id: ${result.id}`);
  console.log(`Embedding length: ${result.embedding.length}`);
  console.log("Embedding preview:", result.embedding.slice(0, 5));
  console.log("Qdrant response:", result.result);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
