export {};

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "nomic-embed-text";

async function pullModel(model: string) {
  console.log(`Pulling model '${model}' from ${OLLAMA_URL}...`);
  const response = await fetch(`${OLLAMA_URL}/api/pull`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: model }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Model pull failed: ${response.status} ${response.statusText} ${body}`
    );
  }

  // Drain streaming response to ensure completion.
  for await (const chunk of response.body ?? []) {
    void chunk;
  }

  console.log(`Model '${model}' ready.`);
}

async function main() {
  await pullModel(OLLAMA_MODEL);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
