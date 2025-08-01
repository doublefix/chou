import { gql } from '@apollo/client';

export const GET_NODES = gql`
  query GetNodes($limit: Int, $continueToken: String) {
    paginatedNodes(limit: $limit, continueToken: $continueToken) {
      items {
        name
        cpu
        memory
      }
      continueToken
    }
  }
`;