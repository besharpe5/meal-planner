FROM node:20-alpine AS client-build

WORKDIR /client
COPY meal-planner-client/package*.json ./
RUN npm ci
COPY meal-planner-client/ ./
RUN npm run build

# Use official Node LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first (better caching)
COPY meal-planner-api/package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy the rest of the app
COPY meal-planner-api/ ./

# Copy built client assets into the location expected by the API server
COPY --from=client-build /client/dist/client /app/meal-planner-client/dist/client

# Cloud Run expects PORT
ENV PORT=8080

# Expose the port
EXPOSE 8080

# Start the API
CMD ["node", "src/server.js"]
