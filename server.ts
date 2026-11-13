// server.ts
import { PeerServer } from "peer";

const customGenerationFunction: () => string = () => {
  return Math.floor(Math.random() * 1e6).toString().padStart(6, '0');
};

const peerServer = PeerServer({
  port: 9000,
  path: "/",
  generateClientId: customGenerationFunction,
});

peerServer.on("connection", (client) => {
  console.log("Client connected:", client.getId());
});