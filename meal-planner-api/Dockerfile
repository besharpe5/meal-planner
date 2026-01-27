# Use official Node LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy the rest of the app
COPY . .

# Cloud Run expects PORT
ENV PORT=8080

# Expose the port
EXPOSE 8080

# Start the API
CMD ["node", "src/server.js"]
