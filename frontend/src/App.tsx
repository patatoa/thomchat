import React, { useState } from "react";
import useWebSocket from "react-use-websocket";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "ws://localhost:8000";
console.log(SOCKET_URL);

const App: React.FC = () => {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<string[]>([]);

  const { sendMessage } = useWebSocket(SOCKET_URL, {
    onOpen: () => console.log("Connected to WebSocket"),
    onMessage: (event: MessageEvent) => {
      setMessages((prev) => [...prev, event.data]);
    },
  });

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage("");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Real-Time Chat</h1>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        placeholder="Type your message here"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setMessage(e.target.value)
        }
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
};

export default App;
