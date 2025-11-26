export {};

const QDRANT_URL = process.env.QDRANT_URL ?? "http://localhost:6333";
const QDRANT_COLLECTION = process.env.QDRANT_COLLECTION ?? "demo";

async function main() {
  const response = await fetch(
    `${QDRANT_URL}/collections/${QDRANT_COLLECTION}`,
    {
      method: "DELETE",
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("Delete failed", {
      status: response.status,
      statusText: response.statusText,
      body: data,
    });
    process.exit(1);
  }

  console.log(`Collection '${QDRANT_COLLECTION}' deleted.`);
  console.log("Response:", data);
}

main().catch((err) => {
  console.error("Unexpected error", err);
  process.exit(1);
});
