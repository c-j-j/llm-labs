import { searchPoints } from "../src/lib/qdrant";

export { };

const VECTOR_SIZE = Number(process.env.QDRANT_VECTOR_SIZE ?? 1536);
const LIMIT = Number(process.env.QDRANT_LIMIT ?? 5);

async function main() {
  const vector = Array.from({ length: VECTOR_SIZE }, () => 0);
  const results = await searchPoints(vector, LIMIT);
  console.log("Search results:", results);
}

main().catch((err) => {
  console.error("Unexpected error", err);
  process.exit(1);
});
