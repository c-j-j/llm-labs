export {};

const QDRANT_URL = process.env.QDRANT_URL ?? "http://localhost:6333";
const COLLECTION = process.env.QDRANT_COLLECTION ?? "demo";
const VECTOR_SIZE = Number(process.env.QDRANT_VECTOR_SIZE ?? 1536);
const DISTANCE = process.env.QDRANT_DISTANCE ?? "Cosine";

async function main() {
  const payload = {
    vectors: {
      size: VECTOR_SIZE,
      distance: DISTANCE,
    },
  };

  const response = await fetch(`${QDRANT_URL}/collections/${COLLECTION}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("Collection setup failed", {
      status: response.status,
      statusText: response.statusText,
      body: data,
    });
    process.exit(1);
  }

  console.log(
    `Collection '${COLLECTION}' ensured with size ${VECTOR_SIZE} and distance ${DISTANCE}.`
  );
  console.log("Response:", data);
}

main().catch((err) => {
  console.error("Unexpected error", err);
  process.exit(1);
});
