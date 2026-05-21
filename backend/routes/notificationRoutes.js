const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const Notification = require("../models/Notification");

/* GET all notifications for the logged-in user */
router.get("/", verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* GET unread count */
router.get("/unread-count", verifyToken, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user.id,
      isRead: false,
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ── IMPORTANT: All literal/named routes must come BEFORE parameterized routes ─ */

/* MARK ALL as read — registered BEFORE /:id/read to avoid Express shadowing */
router.put("/mark-all-read", verifyToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { isRead: true }
    );
    res.json({ message: "All marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* MARK ONE notification as read */
router.put("/:id/read", verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: "Not found" });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* DELETE / clear all — registered BEFORE /:id to avoid Express shadowing */
router.delete("/clear-all", verifyToken, async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user.id });
    res.json({ message: "All notifications cleared" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* DELETE single notification */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!notification) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Notification deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* POST — Create a notification (admin can target any userId; others target self) */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, message, type, image, link, userId: targetUserId } = req.body;
    if (!title || !message) {
      return res.status(400).json({ message: "title and message are required" });
    }

    // Admins can create for any user; others only for themselves
    const recipientId = (req.user.role === "admin" && targetUserId)
      ? targetUserId
      : req.user.id;

    const notification = await Notification.create({
      userId: recipientId,
      title,
      message,
      type: type || "System",
      image: image || "",
      link: link || "",
    });
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* GET /test-self — creates a real System notification for the logged-in user (debug) */
router.get("/test-self", verifyToken, async (req, res) => {
  try {
    const notification = await Notification.create({
      userId: req.user.id,
      title: "🔔 Notification System Test",
      message: `This is a test notification created at ${new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })} IST. If you can see this, the notification system is working correctly!`,
      type: "System",
    });
    res.json({ message: "Test notification created", notification });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
