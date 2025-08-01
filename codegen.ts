
// import type { CodegenConfig } from '@graphql-codegen/cli';

// const config: CodegenConfig = {
//   overwrite: true,
//   schema: "graphql",
//   documents: "hooks/graphql-document/*.ts",
//   generates: {
//     "hooks/graphql-generated/": {
//       preset: "client",
//       plugins: []
//     }
//   }
// };

// export default config;

import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  // schema: "http://10.187.6.190/api/graphql", 
  schema: "graphql",
  documents: "hooks/graphql-document/*.ts",
  generates: {
    "hooks/graphql-generated/index.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-react-apollo"
      ]
    }
  }
};

export default config;