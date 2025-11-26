import { ask, embedText } from "../src/lib/ollama";
import { searchPoints } from "../src/lib/qdrant";

export { };

const LIMIT = Number(process.env.QDRANT_LIMIT ?? 5);
const SCORE_THRESHOLD = Number(process.env.QDRANT_SCORE_THRESHOLD ?? 0.5);

async function main() {
  const question = "are there any rumours about the eiffle tower and garden gnomes?";
  const embedded = await embedText({ text: question });

  const results = await searchPoints(embedded, LIMIT);
  const filtered = results.filter((r) => r.score >= SCORE_THRESHOLD);
  console.log("Search results (filtered):", filtered);

  const context = filtered
    .map((r, idx) => `Result ${idx + 1} (score: ${r.score}): ${r.payload?.text ?? ""}`)
    .join("\n\n");

  if (!context.trim()) {
    console.log("No context found; skipping ask.");
    return;
  }

  console.log("\nCompiled context:\n", context);

  const response = await ask({ question, context });
  console.log("Answer:", response);
}

main().catch((err) => {
  console.error("Unexpected error", err);
  process.exit(1);
});
