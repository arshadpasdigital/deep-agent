FROM oven/bun:1

WORKDIR /app

COPY packages/contracts/src ./packages/contracts/src
COPY services/api-gateway/package.json ./services/api-gateway/package.json
COPY services/api-gateway/src ./services/api-gateway/src

EXPOSE 3000
CMD ["bun", "run", "services/api-gateway/src/main.ts"]
