FROM oven/bun:1

WORKDIR /app

COPY packages/contracts/src ./packages/contracts/src
COPY services/deepagent-service/package.json ./services/deepagent-service/package.json
COPY services/deepagent-service/src ./services/deepagent-service/src

CMD ["bun", "run", "services/deepagent-service/src/main.ts"]
