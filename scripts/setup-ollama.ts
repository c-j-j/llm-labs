import { pullModel } from "../src/lib/ollama";

export {};

const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "nomic-embed-text";

async function main() {
  console.log(`Pulling model '${OLLAMA_MODEL}'...`);
  await pullModel(OLLAMA_MODEL);
  console.log("Model ready.");
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
