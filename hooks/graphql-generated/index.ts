import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Container = {
  __typename?: 'Container';
  image: Scalars['String']['output'];
  name: Scalars['String']['output'];
  ready: Scalars['Boolean']['output'];
  restartCount: Scalars['Int']['output'];
};

export type Deployment = {
  __typename?: 'Deployment';
  cpuLimit: Scalars['String']['output'];
  cpuRequest: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  image: Scalars['String']['output'];
  memoryLimit: Scalars['String']['output'];
  memoryRequest: Scalars['String']['output'];
  name: Scalars['String']['output'];
  namespace: Scalars['String']['output'];
  replicas: Scalars['Int']['output'];
  status: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createDeployment: Deployment;
  createTodo: Todo;
  deleteDeployment: Scalars['Boolean']['output'];
};


export type MutationCreateDeploymentArgs = {
  input: NewDeployment;
};


export type MutationCreateTodoArgs = {
  input: NewTodo;
};


export type MutationDeleteDeploymentArgs = {
  name: Scalars['String']['input'];
  namespace: Scalars['String']['input'];
};

export type NewDeployment = {
  cpuLimit: Scalars['String']['input'];
  cpuRequest: Scalars['String']['input'];
  image: Scalars['String']['input'];
  memoryLimit: Scalars['String']['input'];
  memoryRequest: Scalars['String']['input'];
  name: Scalars['String']['input'];
  namespace: Scalars['String']['input'];
  replicas: Scalars['Int']['input'];
};

export type NewTodo = {
  text: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type Node = {
  __typename?: 'Node';
  age: Scalars['String']['output'];
  arch: Scalars['String']['output'];
  cpu: Scalars['String']['output'];
  gpu: Scalars['String']['output'];
  id: Scalars['String']['output'];
  ip: Scalars['String']['output'];
  kernel: Scalars['String']['output'];
  kubelet: Scalars['String']['output'];
  memory: Scalars['String']['output'];
  name: Scalars['String']['output'];
  os: Scalars['String']['output'];
  role: Scalars['String']['output'];
  runtime: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type NodePage = {
  __typename?: 'NodePage';
  continueToken?: Maybe<Scalars['String']['output']>;
  items: Array<Node>;
};

export type Pod = {
  __typename?: 'Pod';
  age: Scalars['String']['output'];
  containers: Array<Container>;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  namespace: Scalars['String']['output'];
  nodeName: Scalars['String']['output'];
  podIP?: Maybe<Scalars['String']['output']>;
  restarts: Scalars['Int']['output'];
  startTime: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type PodPage = {
  __typename?: 'PodPage';
  continueToken?: Maybe<Scalars['String']['output']>;
  items: Array<Pod>;
};

export type Query = {
  __typename?: 'Query';
  node?: Maybe<Node>;
  paginatedNodes: NodePage;
  pod?: Maybe<Pod>;
  pods: PodPage;
  todos: Array<Todo>;
};


export type QueryNodeArgs = {
  name: Scalars['String']['input'];
};


export type QueryPaginatedNodesArgs = {
  continueToken?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryPodArgs = {
  name: Scalars['String']['input'];
  namespace: Scalars['String']['input'];
};


export type QueryPodsArgs = {
  continueToken?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  namespace?: InputMaybe<Scalars['String']['input']>;
};

export type Todo = {
  __typename?: 'Todo';
  done: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  text: Scalars['String']['output'];
  user: User;
};

export type User = {
  __typename?: 'User';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type GetNodesQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
  continueToken?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetNodesQuery = { __typename?: 'Query', paginatedNodes: { __typename?: 'NodePage', continueToken?: string | null, items: Array<{ __typename?: 'Node', id: string, name: string, cpu: string, memory: string, gpu: string, status: string, arch: string, ip: string, role: string, os: string, kernel: string, runtime: string, kubelet: string, age: string }> } };

export type GetPodsQueryVariables = Exact<{
  namespace?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  continueToken?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetPodsQuery = { __typename?: 'Query', pods: { __typename?: 'PodPage', continueToken?: string | null, items: Array<{ __typename?: 'Pod', id: string, name: string, namespace: string, status: string, nodeName: string, podIP?: string | null, restarts: number, age: string, startTime: string, containers: Array<{ __typename?: 'Container', name: string, image: string, ready: boolean, restartCount: number }> }> } };


export const GetNodesDocument = gql`
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

/**
 * __useGetNodesQuery__
 *
 * To run a query within a React component, call `useGetNodesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetNodesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetNodesQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *      continueToken: // value for 'continueToken'
 *   },
 * });
 */
export function useGetNodesQuery(baseOptions?: Apollo.QueryHookOptions<GetNodesQuery, GetNodesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetNodesQuery, GetNodesQueryVariables>(GetNodesDocument, options);
      }
export function useGetNodesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetNodesQuery, GetNodesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetNodesQuery, GetNodesQueryVariables>(GetNodesDocument, options);
        }
export function useGetNodesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetNodesQuery, GetNodesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetNodesQuery, GetNodesQueryVariables>(GetNodesDocument, options);
        }
export type GetNodesQueryHookResult = ReturnType<typeof useGetNodesQuery>;
export type GetNodesLazyQueryHookResult = ReturnType<typeof useGetNodesLazyQuery>;
export type GetNodesSuspenseQueryHookResult = ReturnType<typeof useGetNodesSuspenseQuery>;
export type GetNodesQueryResult = Apollo.QueryResult<GetNodesQuery, GetNodesQueryVariables>;
export const GetPodsDocument = gql`
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
        ready
        restartCount
      }
    }
    continueToken
  }
}
    `;

/**
 * __useGetPodsQuery__
 *
 * To run a query within a React component, call `useGetPodsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPodsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPodsQuery({
 *   variables: {
 *      namespace: // value for 'namespace'
 *      limit: // value for 'limit'
 *      continueToken: // value for 'continueToken'
 *   },
 * });
 */
export function useGetPodsQuery(baseOptions?: Apollo.QueryHookOptions<GetPodsQuery, GetPodsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPodsQuery, GetPodsQueryVariables>(GetPodsDocument, options);
      }
export function useGetPodsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPodsQuery, GetPodsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPodsQuery, GetPodsQueryVariables>(GetPodsDocument, options);
        }
export function useGetPodsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPodsQuery, GetPodsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetPodsQuery, GetPodsQueryVariables>(GetPodsDocument, options);
        }
export type GetPodsQueryHookResult = ReturnType<typeof useGetPodsQuery>;
export type GetPodsLazyQueryHookResult = ReturnType<typeof useGetPodsLazyQuery>;
export type GetPodsSuspenseQueryHookResult = ReturnType<typeof useGetPodsSuspenseQuery>;
export type GetPodsQueryResult = Apollo.QueryResult<GetPodsQuery, GetPodsQueryVariables>;