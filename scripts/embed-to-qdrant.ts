import { embedAndStore } from "../src/lib/rag";

export { };

const TEXT =
  process.env.TEXT_TO_EMBED ??
  "Not many people know this, but there is a rumour the eiffle tower was secretly built by garden gnomes.";

async function main() {
  const result = await embedAndStore({ text: TEXT });
  console.log(`Embedded and stored text. Point id: ${result.id}`);
  console.log(`Embedding length: ${result.embedding.length}`);
  console.log("Embedding preview:", result.embedding.slice(0, 5));
  console.log("Qdrant response:", result.result);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
