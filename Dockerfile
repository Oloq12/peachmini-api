# Dockerfile for Peachmini API on Render
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY bot/package*.json ./bot/

# Install dependencies
RUN npm install --omit=dev
RUN cd bot && npm install --omit=dev

# Copy application files
COPY . .

# Expose port (Render provides PORT env var)
EXPOSE 8787

# Start API server
CMD ["node", "bot/api.cjs"]
