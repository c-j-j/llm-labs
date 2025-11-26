import { modelExists, pullModel } from "../src/lib/ollama";

export { };

const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "nomic-embed-text";
const CHAT_MODEL = process.env.OLLAMA_CHAT_MODEL ?? "llama3.1";

async function main() {
  const modelsToEnsure = [OLLAMA_MODEL, CHAT_MODEL];

  for (const model of modelsToEnsure) {
    const exists = await modelExists(model);
    if (exists) {
      console.log(`Model '${model}' already present. Skipping pull.`);
      continue;
    }

    console.log(`Pulling model '${model}'...`);
    await pullModel(model);
    console.log(`Model '${model}' ready.`);
  }
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
