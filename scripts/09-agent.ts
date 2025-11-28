import { z } from "zod";
import { isInStock, listProducts } from "./09-agent-helpers";

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const CHAT_MODEL = process.env.OLLAMA_CHAT_MODEL ?? "llama3.2:1b";
const QUESTION = process.env.TOOL_QUESTION ?? "Find me the cheapest product in stock";
const DEBUG = !!process.env.DEBUG;

export const AgentActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("list_products"),
  }),
  z.object({
    action: z.literal("check_stock"),
    productId: z.string(),
  }),
  z.object({
    action: z.literal("result"),
    productId: z.string(),
    price: z.number(),
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
    const parsed = typeof data.response === "string" ? JSON.parse(data.response) : data.response;
    return AgentActionSchema.parse(parsed);
  } catch (err) {
    throw new Error(`Model response was not valid JSON: ${data.response}`);
  }
}

class AgentState {
  private _lastToolResult: string | null = null;
  toolCalled: string | null = null;
  products: ReturnType<typeof listProducts> | null = null;
  stockResults: Record<string, boolean> = {};

  set lastToolResult(value: string | null) {
    this._lastToolResult = value;
  }

  get lastToolResult(): string | null {
    return this._lastToolResult;
  }
}

function addShortTermMemory(toolPrompt: string, agentState: AgentState): string {
  const lines: string[] = []

  if (agentState.products?.length) {
    const productLines = agentState.products
      .map((p) => `  - ${p.id}: ${p.name} ($${p.price})`)
      .join("\n");
    lines.push("Known products from list_products (use only these ids):", productLines)
  }

  const stockEntries = Object.entries(agentState.stockResults)
  if (stockEntries.length) {
    const stockLines = stockEntries
      .map(([id, inStock]) => `  - ${id}: inStock=${inStock}`)
      .join("\n")
    lines.push("Known stock checks:", stockLines)
  }

  if (agentState.products?.length) {
    const confirmed = agentState.products
      .filter((p) => agentState.stockResults[p.id])
      .sort((a, b) => a.price - b.price)
    if (confirmed.length) {
      const best = confirmed[0]
      lines.push(
        "Cheapest already confirmed (in stock):",
        `  - ${best.id}: ${best.name} ($${best.price})`
      )
    } else {
      lines.push(
        "No product confirmed in stock yet; check stock for candidates from list_products."
      )
    }
  }

  if (agentState.toolCalled) {
    let formattedResult = agentState.lastToolResult
    try {
      const parsed = formattedResult ? JSON.parse(formattedResult) : null
      formattedResult = parsed ? JSON.stringify(parsed, null, 2) : formattedResult
    } catch {
      // leave as-is
    }

    lines.push(
      "Recent tool interaction:",
      `  - tool: ${agentState.toolCalled}`,
      `  - result: ${formattedResult}`,
      "Do not repeat list_products; use its ids for stock checks.",
      "Only return result after stock is checked for the chosen id.",
      "Use existing stock knowledge before calling tools again."
    )
  }

  const memory = lines.length ? `\nContext:\n${lines.join("\n")}\n` : ""
  return toolPrompt + memory
}

async function main() {
  const toolPrompt = `
You can choose between these actions and must respond with a single JSON object.
Actions:
- {"action": "list_products"}
- {"action": "check_stock", "productId": "<id>"}
- {"action": "result", "productId": "<id>", "price": <number>}   # final answer

Question: ${QUESTION}

Rules (follow strictly):
- For a candidate product, call check_stock before returning a result.
- Do NOT return result until you have real tool outputs. No placeholders like <id> or <Cheapest...>.
- Return result with the actual productId from the check_stock tool
- After list_products, evaluate candidates from cheapest to most expensive.
- Once you find a product that is in stock, immediately return it with its price.
- Only return JSON; no extra text.`;


  let promptCount = 0
  const agentState = new AgentState()

  let result
  while (promptCount < 10 && !result) {
    const prompt = addShortTermMemory(toolPrompt, agentState);

    const response = await callModel(prompt);

    if (DEBUG) {
      console.log("\n--- Prompt sent to model ---\n", prompt, "\n----------------------------\n");
      console.log("--- Model response ---\n", response, "\n----------------------\n");
    }

    switch (response.action) {
      case 'list_products': {
        const products = listProducts()
        console.log("Tool call: list_products ->", products)
        agentState.lastToolResult = JSON.stringify(products)
        agentState.toolCalled = 'list_products'
        agentState.products = products
        break
      }
      case 'check_stock': {
        const inStock = isInStock(response.productId) ? 'true' : 'false'
        console.log(`Tool call: check_stock (${response.productId}) -> ${inStock}`)
        agentState.lastToolResult = JSON.stringify({ productId: response.productId, inStock })
        agentState.toolCalled = 'check_stock'
        agentState.stockResults[response.productId] = inStock === 'true'
        break
      }
      case 'result': {
        console.log("Model returned with result ", response)
        result = `Found product ${response.productId} with price ${response.price}`
        break
      }
      default: {
        console.error("Unhandled action from model: ", response)
      }
    }
    promptCount++
  }

  if (!result) {
    console.error("No result found")
  } else {
    console.log(result)
  }
}

main().catch((err) => {
  console.error("Unexpected error", err);
  process.exit(1);
});
