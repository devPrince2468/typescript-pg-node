# Use Node.js LTS version as the base image
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies including TypeScript and ts-node for migrations
RUN npm install

# Copy application source code
COPY . .

# Run TypeScript build
RUN npm run build

# Run database migrations
RUN npm run migration

# Expose the port your app runs on
EXPOSE 8000

# Start the application using the built version
CMD ["npm", "start"]