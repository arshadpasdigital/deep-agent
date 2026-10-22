FROM oven/bun:1

WORKDIR /app

COPY packages/contracts/src ./packages/contracts/src
COPY services/auth-service/package.json ./services/auth-service/package.json
COPY services/auth-service/src ./services/auth-service/src

CMD ["bun", "run", "services/auth-service/src/main.ts"]
