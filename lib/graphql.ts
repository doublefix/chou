const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export interface GraphQLRequest<TVars = Record<string, any>> {
  query: string;
  variables?: TVars;
}

export async function graphqlFetcher<TData = any, TVars = Record<string, any>>({
  query,
  variables,
}: GraphQLRequest<TVars>): Promise<TData> {
  const res = await fetch(`${BASE_URL}/api/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`GraphQL request failed: ${res.status} ${res.statusText} - ${errorBody}`);
  }

  const result = await res.json();

  if (result.errors) {
    throw new Error(`GraphQL error: ${JSON.stringify(result.errors)}`);
  }

  return result.data;
}