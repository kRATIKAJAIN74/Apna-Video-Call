import { Server } from "socket.io";

let connections = {};
let messages = {};
let timeOnline = {};

export const connectToSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "https://apna-video-call-frontend-8djz.onrender.com",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["polling", "websocket"],
  });

  io.on("connection", (socket) => {
    console.log("SOCKET CONNECTED:", socket.id);

    socket.on("join-call", (room) => {
      if (!connections[room]) connections[room] = [];
      connections[room].push(socket.id);

      connections[room].forEach((id) => {
        io.to(id).emit("user-joined", socket.id, connections[room]);
      });
    });

    socket.on("signal", (toId, message) => {
      io.to(toId).emit("signal", socket.id, message);
    });

    socket.on("chat-message", (data, sender) => {
      let roomFound = null;

      for (const room in connections) {
        if (connections[room].includes(socket.id)) {
          roomFound = room;
          break;
        }
      }

      if (!roomFound) return;

      connections[roomFound].forEach((id) => {
        io.to(id).emit("chat-message", data, sender, socket.id);
      });
    });

    socket.on("disconnect", () => {
      for (const room in connections) {
        if (connections[room].includes(socket.id)) {
          connections[room] = connections[room].filter(
            (id) => id !== socket.id,
          );
          io.to(room).emit("user-left", socket.id);

          if (connections[room].length === 0) {
            delete connections[room];
          }
        }
      }
    });
  });

  return io;
};
