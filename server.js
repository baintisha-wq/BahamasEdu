import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();

/* ---------------- MIDDLEWARE ---------------- */
app.use(cors({
  origin: "*"
}));
app.use(express.json());

/* ---------------- HTTP SERVER ---------------- */
const server = http.createServer(app);

/* ---------------- SOCKET.IO ---------------- */
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

/* ---------------- DB CONNECT ---------------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected 🗄️"))
  .catch((err) => console.log("DB error:", err));

/* ---------------- SOCKET CONNECTION ---------------- */
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
  });

  socket.on("sendMessage", (data) => {
    const { senderId, receiverId, message } = data;

    io.to(receiverId).emit("receiveMessage", {
      senderId,
      message,
      createdAt: new Date(),
    });

    io.to(senderId).emit("receiveMessage", {
      senderId,
      message,
      createdAt: new Date(),
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

/* ---------------- BASIC TEST ROUTE ---------------- */
app.get("/", (req, res) => {
  res.send("BahamasEdu API is running 🚀");
});

/* ---------------- EXAMPLE AUTH (BASIC) ---------------- */
app.post("/login", (req, res) => {
  const { email } = req.body;

  res.json({
    token: "demo-token",
    role: email.includes("teacher") ? "teacher" : "student",
    userId: "123",
  });
});

/* ---------------- PORT (IMPORTANT FOR RENDER) ---------------- */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} ⚡`);
});