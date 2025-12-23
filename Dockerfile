# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci || npm install
COPY . .
RUN npm run build


# ---- Serve stage ----
FROM node:18-slim

WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY package*.json ./
RUN npm ci --only=production

EXPOSE 3000
CMD ["node", "server/index.js"]