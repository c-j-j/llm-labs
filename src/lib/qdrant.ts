export type QdrantConfig = {
  baseUrl?: string;
  collection?: string;
};

export type QdrantPoint = {
  id: number | string;
  vector: number[];
  payload?: Record<string, unknown>;
};

export type QdrantSearchResult = {
  id: number | string;
  score: number;
  payload?: Record<string, unknown>;
};

const DEFAULT_QDRANT_URL = process.env.QDRANT_URL ?? "http://localhost:6333";
const DEFAULT_QDRANT_COLLECTION = process.env.QDRANT_COLLECTION ?? "demo";

function withDefaults(config?: QdrantConfig) {
  return {
    baseUrl: config?.baseUrl ?? DEFAULT_QDRANT_URL,
    collection: config?.collection ?? DEFAULT_QDRANT_COLLECTION,
  };
}

export async function ensureCollection(
  vectorSize: number,
  distance: string = "Cosine",
  config?: QdrantConfig
) {
  const { baseUrl, collection } = withDefaults(config);
  const payload = {
    vectors: {
      size: vectorSize,
      distance,
    },
  };

  const response = await fetch(`${baseUrl}/collections/${collection}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      `Collection setup failed: ${response.status} ${response.statusText} ${JSON.stringify(data)}`
    );
  }

  return data;
}

export async function upsertPoints(
  points: QdrantPoint[],
  config?: QdrantConfig
) {
  const { baseUrl, collection } = withDefaults(config);
  const payload = { points };

  const response = await fetch(`${baseUrl}/collections/${collection}/points`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      `Qdrant upsert failed: ${response.status} ${response.statusText} ${JSON.stringify(data)}`
    );
  }

  return data;
}

export async function searchPoints(
  vector: number[],
  limit: number = 5,
  config?: QdrantConfig
): Promise<QdrantSearchResult[]> {
  const { baseUrl, collection } = withDefaults(config);
  const payload = {
    vector,
    limit,
  };

  const response = await fetch(
    `${baseUrl}/collections/${collection}/points/search`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      `Search failed: ${response.status} ${response.statusText} ${JSON.stringify(data)}`
    );
  }

  return (data?.result as QdrantSearchResult[]) ?? [];
}
