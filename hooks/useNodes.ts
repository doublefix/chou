import useSWR from "swr";
import { graphqlFetcher } from "@/lib/graphql";

const query = `
  query GetNodes($limit: Int!, $continueToken: String) {
    paginatedNodes(limit: $limit, continueToken: $continueToken) {
      items {
        name
        cpu
        memory
        gpu
      }
      continueToken
    }
  }
`;

interface Node {
  name: string;
  cpu: string;
  memory: string;
  gpu: string;
}

interface PaginatedNodesResponse {
  paginatedNodes: {
    items: Node[];
    continueToken?: string;
  };
}

export function usePaginatedNodes(limit: number, continueToken?: string) {
  const { data, error, isLoading } = useSWR<PaginatedNodesResponse>(
    [query, { limit, continueToken }],
    ([q, variables]) => graphqlFetcher({ query: q, variables })
  );

  return {
    nodes: data?.paginatedNodes.items ?? [],
    continueToken: data?.paginatedNodes.continueToken,
    isLoading,
    error,
  };
}