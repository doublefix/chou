
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: "graphql",
  documents: "hooks/graphql-document/*.ts",
  generates: {
    "hooks/graphql-generated/": {
      preset: "client",
      plugins: []
    }
  }
};

export default config;
