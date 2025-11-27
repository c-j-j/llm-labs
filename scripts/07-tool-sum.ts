export { };

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const CHAT_MODEL = process.env.OLLAMA_CHAT_MODEL ?? "llama3.2:1b";
const QUESTION = process.env.TOOL_QUESTION ?? "Sum up 56 + 64";

type ToolRequest =
  | { action: "sum"; argA: number; argB: number }
  | { action: "answer"; content: string };

async function callModel(prompt: string): Promise<ToolRequest> {
  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: CHAT_MODEL,
      prompt,
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
    return JSON.parse(data.response) as ToolRequest;
  } catch (err) {
    throw new Error(`Model response was not valid JSON: ${data.response}`);
  }
}

async function main() {
  const toolPrompt = `
You can choose between two actions and must respond with a single JSON object.
Actions:
- {"action": "sum", "argA": number, "argB": number}  # to sum two numbers
- {"action": "answer", "content": "<your answer>"}   # to provide the final answer

Question: ${QUESTION}

If you need to perform a sum, respond with the sum action. Otherwise respond with answer.
Only return JSON; no extra text.`;

  const first = await callModel(toolPrompt);

  if (first.action === "answer") {
    console.log("Model answered directly:\n", first.content);
    return;
  }

  if (first.action === "sum") {
    console.log(`Model requested sum: ${first.argA} + ${first.argB}`);
    const answer = Number(first.argA) + Number(first.argB);

    const secondPrompt = `
You asked for the sum of ${first.argA} and ${first.argB}:

${answer}

Question: ${QUESTION}

Respond with {"action": "answer", "content": "<your answer>"} using the sum. Only JSON.`;

    const second = await callModel(secondPrompt);

    if (second.action !== "answer") {
      throw new Error("Expected an answer action from the model after performing the sum.");
    }

    console.log("Answer using sum tool:\n", second.content);
  }
}

main().catch((err) => {
  console.error("Unexpected error", err);
  process.exit(1);
});
