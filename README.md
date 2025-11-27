# llm-lab

A small collection of numbered scripts for learning RAG-style workflows with Ollama + Qdrant.

## Scripts

- `scripts/01-setup-ollama.ts` – Pull required models (embed + chat) if missing. Env: `OLLAMA_URL`, `OLLAMA_MODEL`, `OLLAMA_CHAT_MODEL`.
- `scripts/02-setup-qdrant.ts` – Ensure a collection exists with the desired vector size/distance. Env: `QDRANT_URL`, `QDRANT_COLLECTION`, `QDRANT_VECTOR_SIZE`, `QDRANT_DISTANCE`.
- `scripts/03-delete-qdrant-collection.ts` – Delete the target collection. Env: `QDRANT_URL`, `QDRANT_COLLECTION`.
- `scripts/04-embed-to-qdrant.ts` – Embed a text and upsert into Qdrant. Env: `TEXT_TO_EMBED`, `QDRANT_URL`, `QDRANT_COLLECTION`, `OLLAMA_MODEL`, `OLLAMA_URL`.
- `scripts/05-qdrant-search.ts` – Perform a search with a zero vector (or adjust `QDRANT_VECTOR_SIZE`). Env: `QDRANT_VECTOR_SIZE`, `QDRANT_LIMIT`, `QDRANT_URL`, `QDRANT_COLLECTION`.
- `scripts/06-test-rag.ts` – Full flow: embed query, search, build context, and ask the chat model. Env: `QDRANT_LIMIT`, `QDRANT_SCORE_THRESHOLD`, `OLLAMA_CHAT_MODEL`, `QDRANT_URL`, `QDRANT_COLLECTION`.
- `scripts/07-tool-sum.ts` – Demonstrates a simple “tool” loop: the model can request a sum operation and then answer using the result. Env: `OLLAMA_CHAT_MODEL`, `OLLAMA_URL`, `TOOL_QUESTION`.
- `scripts/ask.sh` – Curl helper to call the (removed) Express `/ask` echo endpoint; keep as an example of hitting an API.

## Running scripts

Use `npx ts-node <script>`:

- `npx ts-node scripts/01-setup-ollama.ts`
- `npx ts-node scripts/02-setup-qdrant.ts`
- `npx ts-node scripts/03-delete-qdrant-collection.ts`
- `npx ts-node scripts/04-embed-to-qdrant.ts`
- `npx ts-node scripts/05-qdrant-search.ts`
- `npx ts-node scripts/06-test-rag.ts`
- `npx ts-node scripts/07-tool-sum.ts`

TypeScript compile check: `npm run build`.

## Tips

- Match collection vector size to the embedding model output (`QDRANT_VECTOR_SIZE` during setup).
- Set `OLLAMA_CHAT_MODEL` to a lightweight model (e.g., `llama3.2:1b`) if resources are limited.
- For relevance, embed documents that align with your test questions; otherwise, searches will return whatever is available.
