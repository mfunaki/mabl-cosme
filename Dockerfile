# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# ビルド引数としてAPIキーを受け取る
ARG VITE_OPENAI_API_KEY
ENV VITE_OPENAI_API_KEY=$VITE_OPENAI_API_KEY

COPY package.json package-lock.json* ./
RUN npm ci || npm install
COPY . .
RUN npm run build


# ---- Serve stage ----
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Optional: custom NGINX config
# COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]