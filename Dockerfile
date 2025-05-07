# Use official Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your code
COPY . .

# Copy the keys directory to the build path
COPY src/keys ./build/keys


# Build TypeScript
RUN npm run build

# Set environment variables
ENV NODE_ENV=production

# Expose port
EXPOSE 8080

# Start app
CMD ["node", "build/index.js"]
