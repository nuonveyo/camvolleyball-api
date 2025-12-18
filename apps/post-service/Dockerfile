FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build post-service

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist/apps/post-service ./dist
COPY --from=builder /app/package*.json ./

# Microservice, usually no public port restricted, but for docs sake
# EXPOSE 3001 

CMD ["node", "dist/main"]
