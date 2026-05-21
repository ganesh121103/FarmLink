const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const { Server } = require("socket.io");
require("dotenv").config();
const { startWishlistAlertJob } = require("./jobs/wishlistAlerts");
const { startExpiryCleanupJob } = require("./jobs/expiryCleanup");
const connectDB = require("./config/db");
const Message = require("./models/Message");

const app = express();

app.set('trust proxy', 1);

app.use((req, res, next) => {
  const path = require('path');
  const fs = require('fs');
  const logDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
  fs.appendFileSync(path.join(logDir, 'req_logs.txt'), `[REQ] ${req.method} ${req.url}\n`);
  next();
});

// Set security HTTP headers (configure for API usage)
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// Global Rate Limiting: Limit requests from same API
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs (Higher globally, stricter on auth)
  message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use("/api", limiter);

const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// Enable CORS
app.use(cors());

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Data sanitization against NoSQL query injection
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  if (req.query) mongoSanitize.sanitize(req.query);
  next();
});

// Prevent parameter pollution
app.use(hpp());

// Routes
app.use("/api/users",         require("./routes/userRoutes"));
app.use("/api/products",      require("./routes/productRoutes"));
app.use("/api/orders",        require("./routes/orderRoutes"));
app.use("/api/farmers",       require("./routes/farmerRoutes"));
app.use("/api/expenses",      require("./routes/expenseRoutes"));
app.use("/api/chat",          require("./routes/chatRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/payment",       require("./routes/paymentRoutes"));

app.get("/api/ping", (req, res) => res.json({ message: "pong", readyState: mongoose.connection.readyState }));

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
        console.log(`[SOCKET] User ${receiverId} is offline. Creating Push Notification.`);
        // Offline -> Send push notification & create DB notification
        try {
          const Notification = require("./models/Notification");
          const { sendPushNotification } = require("./services/pushNotificationService");
          // Find user to get fcmToken
          const Customer = require("./models/Customer");
          const Farmer = require("./models/Farmer");
          const Admin = require("./models/Admin");
          
          let recipient = await Customer.findById(receiverId);
          if (!recipient) recipient = await Farmer.findById(receiverId);
          if (!recipient) recipient = await Admin.findById(receiverId);

          if (recipient) {
            await Notification.create({
              userId: recipient._id,
              title: `New message from ${senderName}`,
              message: text.substring(0, 50) + (text.length > 50 ? "..." : ""),
              type: "Chat"
            });
            if (recipient.fcmToken) {
              await sendPushNotification(recipient.fcmToken, `New message from ${senderName}`, text);
            }
          }
        } catch (err) {
          console.error("[SOCKET] Failed to send offline chat notification:", err.message);
        }
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

connectDB().then(() => {
  startExpiryCleanupJob();
  startWishlistAlertJob();
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Database connection refreshed.`);
  });
});