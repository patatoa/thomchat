import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { Kafka } from "npm:kafkajs@2.2.4";

// Kafka configuration
const kafka = new Kafka({
  clientId: "websocket-server",
  brokers: [Deno.env.get("KAFKA_BROKERS") || "kafka:9092"],
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "websocket-server-group" });

// Topic for WebSocket messages
const TOPIC = "websocket-messages";

// Maintain local connections in memory
const sockets = new Set<WebSocket>();

// Initialize Kafka connections
async function setupKafka() {
  try {
    await producer.connect();
    await consumer.connect();
    await consumer.subscribe({ topic: TOPIC, fromBeginning: false });
    
    // Process messages from Kafka
    await consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;
        
        const messageData = JSON.parse(new TextDecoder().decode(message.value));
        
        // Broadcast to all local connections except the original sender
        sockets.forEach((socket) => {
          if (socket.readyState === WebSocket.OPEN && socket.id !== messageData.senderId) {
            socket.send(messageData.content);
          }
        });
      },
    });
    
    console.log("Kafka producer and consumer connected");
  } catch (error) {
    console.error("Error setting up Kafka:", error);
  }
}

// Start Kafka connections
setupKafka();

// Generate a unique ID for the socket
function generateSocketId() {
  return crypto.randomUUID();
}

// Start the WebSocket server
serve(
  async (req) => {
    const clientIP = req.headers.get("x-forwarded-for") || "unknown";
    console.log(`Received request from ${clientIP}: ${req.url}`);
    
    if (req.headers.get("upgrade") === "websocket") {
      console.log(`Upgrading to WebSocket connection for ${clientIP}`);
      // Upgrade HTTP request to WebSocket connection
      const { socket, response } = Deno.upgradeWebSocket(req);
      
      // Add a unique ID to the socket object
      // @ts-ignore: Adding custom property to WebSocket
      socket.id = generateSocketId();
      
      sockets.add(socket);

      socket.onopen = () => {
        console.log(`Client connected: ${socket.id}`);
      };

      socket.onmessage = async (event) => {
        console.log(`Message received from ${socket.id}:`, event.data);
        
        try {
          // Publish message to Kafka
          await producer.send({
            topic: TOPIC,
            messages: [
              { 
                value: JSON.stringify({
                  senderId: socket.id,
                  content: event.data,
                  timestamp: Date.now()
                })
              },
            ],
          });
        } catch (error) {
          console.error("Error publishing to Kafka:", error);
        }
      };

      socket.onclose = () => {
        console.log(`Client disconnected: ${socket.id}`);
        sockets.delete(socket);
      };

      socket.onerror = (error) => {
        console.error(`WebSocket error for ${socket.id}:`, error);
        sockets.delete(socket);
      };

      return response;
    }

    // Handle health checks and non-WebSocket requests
    return new Response("WebSocket server is running", { status: 200 });
  },
  { hostname: "0.0.0.0", port: 8000 }
);

console.log("WebSocket server is running on 0.0.0.0:8000");

// Handle shutdown gracefully
Deno.addSignalListener("SIGINT", async () => {
  console.log("Shutting down...");
  await producer.disconnect();
  await consumer.disconnect();
  Deno.exit(0);
});