import express, { type Request, type Response } from "express";
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import * as z from "zod/v4";
import { randomUUID } from "node:crypto";

// 1. Create the MCP server
const server = new McpServer({
  name: "demo-server",
  version: "1.0.0",
});

// 2. Register a simple tool
server.registerTool(
  "add",
  {
    title: "Add two numbers",
    description: "Returns the sum of a and b",
    inputSchema: {
      a: z.number(),
      b: z.number(),
    },
    outputSchema: {
      result: z.number(),
    },
  },
  async ({ a, b }) => {
    const result = { result: a + b };
    return {
      structuredContent: result,
      content: [{ type: "text", text: `Result is ${result.result}` }],
    };
  }
);

// 3. Register a simple resource
server.registerResource(
  "greeting",
  new ResourceTemplate("greeting://{name}", { list: undefined }),
  {
    title: "Greeting",
    description: "Dynamic greeting resource",
  },
  async (uri, { name }) => ({
    contents: [
      {
        uri: uri.href,
        text: `Hello, ${name}!`,
      },
    ],
  })
);

// 4. HTTP server + Streamable HTTP transport
const app = express();
app.use(express.json());

const handleMcp = async (req: Request, res: Response) => {
  const transport = new StreamableHTTPServerTransport({
    // Stateless mode keeps local testing simple; no session headers required
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  res.on("close", () => {
    transport.close();
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error("Error handling MCP request", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

app.post("/mcp", handleMcp);

async function main() {
  const port = Number(process.env.PORT ?? 3000);
  const host = process.env.HOST ?? "127.0.0.1";

  const httpServer = app.listen(port, host, () => {
    const address = httpServer.address();
    const displayPort = typeof address === "object" && address ? address.port : port;
    console.log(`MCP server listening at http://${host}:${displayPort}/mcp`);
  });

  httpServer.on("error", (err) => {
    console.error("Failed to start HTTP server", err);
    process.exit(1);
  });

  // Keep process alive until it is killed (Ctrl+C)
  await new Promise<never>(() => {
    /* intentionally never resolve */
  });
}

main().catch((err) => {
  console.error("Unexpected error while starting server", err);
  process.exit(1);
});
