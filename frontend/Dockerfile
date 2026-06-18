# === Frontend Dockerfile for Google Cloud Run ===
# Stage 1: Build the React app
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --silent

COPY . .

# Build will be triggered with the injected backend API URL
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Serve with lightweight nginx
FROM nginx:alpine

# Copy built assets to nginx serve directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom nginx config to handle React SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
