FROM node:22-slim AS builder
WORKDIR /app
COPY package.json package-lock.json tsconfig.json ./
COPY src/ ./src/
RUN npm ci && npm run build

FROM node:22-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist/ ./dist/
EXPOSE 5001
CMD ["node", "dist/index.js"]
