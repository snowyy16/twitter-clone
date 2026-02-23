import express, { Application } from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./configs/db";

import authRoutes from "./routes/auth.routes";
import tweetRoutes from "./routes/tweet.routes";
import userRoutes from "./routes/user.routes";
import { errorHandler } from "./middlewares/error.middleware";
import { createServer } from "http";
import { Server } from "socket.io";
dotenv.config();

connectDB();

const app: Application = express();
const httpService = createServer(app);
export const io = new Server(httpService, {
  cors: { origin: "*" },
});
const onlineUsers = new Map<string, string>();
io.on("connection", (socket) => {
  socket.on("register", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`User ${userId} online với socketId: ${socket.id}`);
  });
  socket.on("disconnect", () => {
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
  });
  socket.on("typing...", ({ receiverId, senderId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("user_typing", senderId);
    }
  });
  socket.on("stop_typing", ({ receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("user_stop_typing");
    }
  });
});
export const getReceiverSocketId = (receiverId: string) =>
  onlineUsers.get(receiverId);
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev")); //Log các request ra terminal để dễ debug
const PORT = process.env.PORT || 5000;

app.use(errorHandler);
app.use("/api/auth", authRoutes);
app.use("/api/tweets", tweetRoutes);
app.use("/api/users", userRoutes);
// app.listen(PORT, () => {
//   console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
// });
httpService.listen(PORT, () => {
  console.log(`🚀 Real-time Server running at: http://localhost:${PORT}`);
});
