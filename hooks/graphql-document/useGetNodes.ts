import { gql } from "@apollo/client";

export const GET_NODES = gql`
  query GetNodes($limit: Int, $continueToken: String) {
    paginatedNodes(limit: $limit, continueToken: $continueToken) {
      items {
        id
        name
        cpu
        memory
        gpu
        status
        arch
        ip
        role
        os
        kernel
        runtime
        kubelet
        age
      }
      continueToken
    }
  }
`;

export const GET_PODS = gql`
  query GetPods($namespace: String, $limit: Int, $continueToken: String) {
    pods(namespace: $namespace, limit: $limit, continueToken: $continueToken) {
      items {
        id
        name
        namespace
        status
        nodeName
        podIP
        restarts
        age
        startTime
        containers {
          name
          image
          imageId
          ready
          restartCount
        }
      }
      continueToken
    }
  }
`;
