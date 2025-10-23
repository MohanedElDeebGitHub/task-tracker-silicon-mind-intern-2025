# --- Stage 1: Build ---
# Use an official Node.js runtime as a parent image
FROM node:18-alpine AS build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application's source code
COPY . .

# --- Stage 2: Production ---
# Use a smaller, more secure base image for the final image
FROM node:18-alpine

WORKDIR /app

# Copy dependencies from the build stage
COPY --from=build /app/node_modules ./node_modules

# Copy application code from the build stage
COPY --from=build /app ./

# Expose the port the app runs on
EXPOSE 3001

# Define the command to run the application
CMD ["node", "src/index.js"]


