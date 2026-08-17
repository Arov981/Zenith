FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install serve for hosting static files
RUN npm install -g serve

# Copy application files
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Expose port
EXPOSE 80

USER nodejs

# Start the frontend server
CMD ["serve", "-s", ".", "-l", "80"]
