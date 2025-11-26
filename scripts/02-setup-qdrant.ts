import { ensureCollection } from "../src/lib/qdrant";

export { };

const VECTOR_SIZE = Number(process.env.QDRANT_VECTOR_SIZE ?? 1536);
const DISTANCE = process.env.QDRANT_DISTANCE ?? "Cosine";

async function main() {
  const result = await ensureCollection(VECTOR_SIZE, DISTANCE);
  console.log(
    `Collection ensured with size ${VECTOR_SIZE} and distance ${DISTANCE}.`
  );
  console.log("Response:", result);
}

main().catch((err) => {
  console.error("Unexpected error", err);
  process.exit(1);
});
