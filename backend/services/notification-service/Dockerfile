FROM oven/bun:1

WORKDIR /app

COPY packages/contracts/src ./packages/contracts/src
COPY services/notification-service/package.json ./services/notification-service/package.json
COPY services/notification-service/src ./services/notification-service/src

CMD ["bun", "run", "services/notification-service/src/main.ts"]
