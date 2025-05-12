FROM oven/bun:1-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY bun.lock ./
COPY tsconfig.json ./

RUN bun install

COPY prisma ./prisma/
RUN bunx prisma generate

COPY . .
RUN bun run build

FROM oven/bun:1-alpine
WORKDIR /app

COPY --from=builder /app/package*.json /app/bun.lock ./
RUN bun install --production

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

COPY --from=builder /app/prisma ./prisma

COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["bun", "start"]