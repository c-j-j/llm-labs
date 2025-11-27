import { z } from "zod";

export { };

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const CHAT_MODEL = process.env.OLLAMA_CHAT_MODEL ?? "llama3.2:1b";
const TEXT =
  process.env.STRUCT_TEXT ??
  "Find me a nice apple pie recipe";

const RecipeResponseSchema = z.array(z.object({
  stepNumber: z.number(),
  stepTitle: z.string(),
  stepDescription: z.string(),
  timeTaken: z.number()
}))
type RecipeResponse = z.infer<typeof RecipeResponseSchema>

async function callStructured(text: string): Promise<RecipeResponse> {
  const prompt = `
You are an recipe generating system.
Text:
${text}

Rules:
- Only return JSON, no extra text.
- Use concise strings.
`;

  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: CHAT_MODEL,
      prompt,
      format: z.toJSONSchema(RecipeResponseSchema),
      stream: false,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data?.response) {
    throw new Error(
      `Model call failed: ${response.status} ${response.statusText} ${JSON.stringify(data)}`
    );
  }

  try {
    return RecipeResponseSchema.parse(JSON.parse(data.response));
  } catch (err) {
    throw new Error(`Failed to parse/validate JSON: ${data.response}`);
  }
}

async function main() {
  console.log("Input text:\n", TEXT, "\n");
  const structured = await callStructured(TEXT);
  console.log("Structured output:\n", structured);
}

main().catch((err) => {
  console.error("Unexpected error", err);
  process.exit(1);
});
