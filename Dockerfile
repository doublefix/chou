FROM harbor.openpaper.co/base/node:24-alpine3.22 AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.1.0 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM harbor.openpaper.co/base/node:24-alpine3.22 AS runner

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.1.0 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/.next .next
COPY --from=builder /app/public public
COPY --from=builder /app/next.config.ts .
COPY --from=builder /app/package.json .

EXPOSE 3000

CMD ["pnpm", "start"]

# docker buildx build --platform linux/amd64 --push -t harbor.openpaper.co/chess/chb-web:20250806 .
# docker run -it --rm -p 8099:80 harbor.openpaper.co/chess/chb-web:20250806 /bin/sh 