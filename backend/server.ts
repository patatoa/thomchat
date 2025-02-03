import { serve } from "https://deno.land/std/http/server.ts";

const sockets = new Set<WebSocket>();

// Start the WebSocket server
serve(
  async (req) => {
    if (req.headers.get("upgrade") === "websocket") {
      // Upgrade HTTP request to WebSocket connection
      const { socket, response } = Deno.upgradeWebSocket(req);
      sockets.add(socket);

      socket.onopen = () => {
        console.log("Client connected");
      };

      socket.onmessage = (event) => {
        console.log("Message received:", event.data);
        // Broadcast the message to all connected clients
        sockets.forEach((s) => {
          if (s !== socket && s.readyState === WebSocket.OPEN) {
            s.send(event.data);
          }
        });
      };

      socket.onclose = () => {
        console.log("Client disconnected");
        sockets.delete(socket);
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      return response;
    }

    // Handle non-WebSocket requests (optional)
    return new Response("Hello from Deno!", { status: 200 });
  },
  { port: 8000 }
);

console.log("WebSocket server is running on ws://localhost:8000");
