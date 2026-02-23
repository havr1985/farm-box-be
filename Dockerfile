##STAGE-deps
FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
        pnpm install --frozen-lockfile

##DEV
FROM deps AS dev
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY data-source.ts ./
CMD ["pnpm", "start:dev"]

##MIGRATE
FROM deps AS migrate
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY data-source.ts ./
COPY src ./src
CMD ["pnpm", "db:migrate"]

##SEED
FROM deps AS seed
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY data-source.ts ./
COPY src ./src
CMD ["pnpm", "db:seed"]


##STAGE-build
FROM deps AS build
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY data-source.ts ./
COPY src ./src
RUN pnpm build

##STAGE-prod
FROM node:22-alpine AS prod
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY --from=build /app/package.json /app/pnpm-lock.yaml ./
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
        pnpm install --frozen-lockfile --prod
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/src/main.js"]

##STAGE-distroless-prod
FROM gcr.io/distroless/nodejs22-debian12 AS prod-distroless
USER nonroot
WORKDIR /app
COPY --from=prod /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["dist/src/main.js"]