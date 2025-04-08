import { io } from "socket.io-client";

const socket = io("http://localhost:8081", {
  transports: ["websocket", "polling"],
});

export default socket;
