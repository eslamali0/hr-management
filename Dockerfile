FROM oven/bun:1-alpine AS builder
WORKDIR /app

COPY package*.json ./ bun.lock ./ tsconfig.json ./
RUN bun install

COPY prisma ./prisma/
RUN bunx prisma generate

COPY src ./src/
RUN bun run build

FROM oven/bun:1-alpine
WORKDIR /app

COPY --from=builder /app/package*.json /app/bun.lock ./
RUN bun install --production

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

EXPOSE 3001

CMD ["bun", "start"]