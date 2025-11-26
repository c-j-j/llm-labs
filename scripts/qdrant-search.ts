export {};

const QDRANT_URL = process.env.QDRANT_URL ?? "http://localhost:6333";
const COLLECTION = process.env.QDRANT_COLLECTION ?? "demo";
const VECTOR_SIZE = Number(process.env.QDRANT_VECTOR_SIZE ?? 1536);
const LIMIT = Number(process.env.QDRANT_LIMIT ?? 5);

async function main() {
  const vector = Array.from({ length: VECTOR_SIZE }, () => 0);

  const payload = {
    vector,
    limit: LIMIT,
  };

  const response = await fetch(
    `${QDRANT_URL}/collections/${COLLECTION}/points/search`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("Search failed", {
      status: response.status,
      statusText: response.statusText,
      body: data,
    });
    process.exit(1);
  }

  console.log("Search response:", data);
}

main().catch((err) => {
  console.error("Unexpected error", err);
  process.exit(1);
});
