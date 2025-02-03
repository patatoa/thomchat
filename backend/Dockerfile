# Use the official Deno image
FROM denoland/deno:2.1.9

# Set working directory inside container
WORKDIR /app

# Copy the Deno server file
COPY . .

# Expose the WebSocket server port
EXPOSE 8000

# Run the Deno server
CMD ["deno", "run", "--allow-net", "server.ts"]