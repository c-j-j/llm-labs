import { z } from "zod";
import { isInStock, isOnSale, listProducts } from "./09-agent-helpers";

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const CHAT_MODEL = process.env.OLLAMA_CHAT_MODEL ?? "llama3.2:1b";
const QUESTION = process.env.TOOL_QUESTION ?? "Find me the cheapest product in stock and on sale";

export const AgentActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("list_products"),
  }),
  z.object({
    action: z.literal("check_stock"),
    productId: z.string(),
  }),
  z.object({
    action: z.literal("check_sale"),
    productId: z.string(),
  }),
  z.object({
    action: z.literal("result"),
    result: z.string(),
  }),
]);

export type AgentAction = z.infer<typeof AgentActionSchema>;


async function callModel(prompt: string): Promise<AgentAction> {
  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: CHAT_MODEL,
      prompt,
      format: z.toJSONSchema(AgentActionSchema),
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
    return AgentActionSchema.parse(data.response)
  } catch (err) {
    throw new Error(`Model response was not valid JSON: ${data.response}`);
  }
}

class AgentState {
  private _lastToolResult: string | null = null;
  toolCalled: string | null = null;

  set lastToolResult(value: string | null) {
    this._lastToolResult = value;
  }

  get lastToolResult(): string | null {
    return this._lastToolResult;
  }
}

function addShortTermMemory(toolPrompt: string, agentState: AgentState): string {
  let memory = ""

  if (agentState.toolCalled) {
    memory = memory + `You called the tool ${agentState.toolCalled}. The result is ${agentState.lastToolResult}`
  }
  return toolPrompt + memory
}

async function main() {
  const toolPrompt = `
You can choose between these actions and must respond with a single JSON object.
Actions:
- {"action": "list_products"}
- {"action": "check_stock", "productId": "<id>"}
- {"action": "check_sale", "productId": "<id>"}
- {"action": "result", "result": "<final answer>"}   # final answer

Question: ${QUESTION}

If you need to get data, use one of the actions. Return "result" when you have the final answer.
Only return JSON; no extra text.`;


  let promptCount = 0
  const agentState = new AgentState()

  while (promptCount < 10) {
    const response = await callModel(addShortTermMemory(toolPrompt, agentState));

    if (response.action === 'list_products') {
      const products = listProducts()
      console.log("Tool call: list_products ->", products)
      agentState.lastToolResult = products.join(',')
      agentState.toolCalled = 'list_products'
    }
    if (response.action === 'check_sale') {
      const onSale = isOnSale(response.productId) ? 'true' : 'false'
      console.log(`Tool call: check_sale (${response.productId}) -> ${onSale}`)
      agentState.lastToolResult = onSale
      agentState.toolCalled = 'check_sale'
    }
    if (response.action === 'check_stock') {
      const inStock = isInStock(response.productId) ? 'true' : 'false'
      console.log(`Tool call: check_stock (${response.productId}) -> ${inStock}`)
      agentState.lastToolResult = inStock
      agentState.toolCalled = 'check_stock'
    }
    if (response.action === 'result') {
      console.log("Model returned with result ", response.result)
      break
    }
    promptCount++
  }
}

main().catch((err) => {
  console.error("Unexpected error", err);
  process.exit(1);
});
