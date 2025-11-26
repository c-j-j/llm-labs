export type EmbedOptions = {
  baseUrl?: string;
  model?: string;
  text: string;
};

const DEFAULT_OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const DEFAULT_OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "nomic-embed-text";

export async function embedText({
  baseUrl = DEFAULT_OLLAMA_URL,
  model = DEFAULT_OLLAMA_MODEL,
  text,
}: EmbedOptions): Promise<number[]> {
  const response = await fetch(`${baseUrl}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt: text }),
  });

  const data = (await response.json().catch(() => ({}))) as {
    embedding?: number[];
    error?: string;
  };

  if (!response.ok || !data.embedding) {
    throw new Error(
      `Embedding failed: ${response.status} ${response.statusText} ${data.error ?? ""}`.trim()
    );
  }

  return data.embedding;
}

export async function pullModel(
  model: string = DEFAULT_OLLAMA_MODEL,
  baseUrl: string = DEFAULT_OLLAMA_URL
) {
  const response = await fetch(`${baseUrl}/api/pull`, {
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
}
