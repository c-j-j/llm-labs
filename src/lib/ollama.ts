export type EmbedOptions = {
  baseUrl?: string;
  model?: string;
  text: string;
};

export type AskOptions = {
  baseUrl?: string;
  model?: string;
  question: string;
  context?: string;
};

const DEFAULT_OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const DEFAULT_OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "nomic-embed-text";
const DEFAULT_CHAT_MODEL = process.env.OLLAMA_CHAT_MODEL ?? "llama3.2:1b";

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

export async function modelExists(
  model: string = DEFAULT_CHAT_MODEL,
  baseUrl: string = DEFAULT_OLLAMA_URL
): Promise<boolean> {
  const response = await fetch(`${baseUrl}/api/tags`);
  if (!response.ok) {
    // If tags endpoint fails, fall back to false so caller can try pulling.
    return false;
  }

  const data = (await response.json().catch(() => ({}))) as {
    models?: { name?: string }[];
  };

  return Boolean(
    data?.models?.some((entry) => (entry.name ?? "").split(":")[0] === model)
  );
}

export async function ask({
  baseUrl = DEFAULT_OLLAMA_URL,
  model = DEFAULT_CHAT_MODEL,
  question,
  context,
}: AskOptions) {
  const prompt = context
    ? `Use the context below to answer the question.\n\nContext:\n${context}\n\nQuestion: ${question}`
    : question;

  const response = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, stream: false }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data?.response) {
    throw new Error(
      `Ask failed: ${response.status} ${response.statusText} ${JSON.stringify(data)}`
    );
  }

  return data.response as string;
}
