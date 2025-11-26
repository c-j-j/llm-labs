import { embedText } from "./ollama";
import { searchPoints, upsertPoints, type QdrantConfig } from "./qdrant";

export type EmbedAndStoreOptions = {
  text: string;
  qdrant?: QdrantConfig;
};

export type SearchOptions = {
  query: string;
  limit?: number;
  qdrant?: QdrantConfig;
};

export async function embedAndStore({ text, qdrant }: EmbedAndStoreOptions) {
  const embedding = await embedText({ text });
  const id = Date.now();

  const result = await upsertPoints(
    [
      {
        id,
        vector: embedding,
        payload: {
          text,
        },
      },
    ],
    qdrant
  );

  return { id, embedding, result };
}

export async function searchWithEmbedding({
  query,
  limit = 5,
  qdrant,
}: SearchOptions) {
  const embedding = await embedText({ text: query });
  const results = await searchPoints(embedding, limit, qdrant);
  return { results, embedding };
}
