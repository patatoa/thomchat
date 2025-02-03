# Use Node.js base image
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app files
COPY . .

# Build the Vite project
RUN npm run build

# Serve the built app with a lightweight server (Caddy)
FROM caddy:2.6.2-alpine

# Set working directory
WORKDIR /srv

# Copy the built frontend from the previous stage
COPY --from=build /app/dist .

# Expose port 80 for serving the frontend
EXPOSE 80

# Start Caddy to serve the frontend
CMD ["caddy", "file-server", "--root", "/srv", "--listen", ":80"]