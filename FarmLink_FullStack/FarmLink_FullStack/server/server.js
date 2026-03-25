const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const Message = require("./models/Message");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/farmers", require("./routes/farmerRoutes"));
app.use("/api/expenses", require("./routes/expenseRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));

// --- Socket.IO Real-Time Chat ---
const onlineUsers = new Map(); // userId -> socketId

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    onlineUsers.set(userId, socket.id);
    console.log(`🟢 User connected: ${userId}`);
  }

  // Handle sending a message
  socket.on("send_message", async (data) => {
    try {
      const { senderId, receiverId, senderName, senderRole, text } = data;
      console.log(`[SOCKET] send_message from ${senderId} to ${receiverId}`);
      console.log(`[SOCKET] Online users:`, Array.from(onlineUsers.keys()));
      
      const conversationId = Message.getConversationId(senderId, receiverId);

      const message = await Message.create({
        conversationId,
        senderId,
        receiverId,
        senderName,
        senderRole,
        text,
      });

      // Send to recipient if online
      const recipientSocketId = onlineUsers.get(receiverId);
      console.log(`[SOCKET] Recipient Socket ID: ${recipientSocketId || 'NOT FOUND'}`);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("receive_message", message);
        console.log(`[SOCKET] Message emitted to ${recipientSocketId}`);
      } else {
        console.log(`[SOCKET] User ${receiverId} is offline. Message saved to DB only.`);
      }

      // Confirm to sender
      socket.emit("message_sent", message);
    } catch (err) {
      console.error(`[SOCKET] Error sending message:`, err);
      socket.emit("message_error", { error: err.message });
    }
  });

  // Mark messages as read
  socket.on("mark_read", async ({ conversationId, userId }) => {
    try {
      await Message.updateMany(
        { conversationId, receiverId: userId, read: false },
        { $set: { read: true } }
      );
    } catch (err) {
      console.error("Mark read error:", err.message);
    }
  });

  // Handle message deletion
  socket.on("delete_message", async ({ messageId, receiverId }) => {
    // Notify the recipient so their UI removes it
    const recipientSocketId = onlineUsers.get(receiverId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("message_deleted", { messageId });
    }
  });

  socket.on("disconnect", () => {
    if (userId) {
      onlineUsers.delete(userId);
      console.log(`🔴 User disconnected: ${userId}`);
    }
  });
});

const PORT = process.env.PORT || 5000;

// ✅ With timeout options to prevent hanging on Atlas cold start
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000,  // Give up connecting after 10s
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log("✅ MongoDB Connected");

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });