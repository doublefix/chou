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
  name: Scalars['String']['output'];
  namespace: Scalars['String']['output'];
  nodeName: Scalars['String']['output'];
  podIP?: Maybe<Scalars['String']['output']>;
  restarts: Scalars['Int']['output'];
  startTime: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  node?: Maybe<Node>;
  paginatedNodes: NodePage;
  pod?: Maybe<Pod>;
  pods: Array<Pod>;
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


export type GetNodesQuery = { __typename?: 'Query', paginatedNodes: { __typename?: 'NodePage', continueToken?: string | null, items: Array<{ __typename?: 'Node', name: string, cpu: string, memory: string }> } };


export const GetNodesDocument = gql`
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