const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

// GET /api/chat/conversations?userId=xxx — list all conversations for a user
router.get("/conversations", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: "userId is required" });

    // Find all unique conversationIds involving this user
    const messages = await Message.aggregate([
      { $match: { $or: [{ senderId: userId }, { receiverId: userId }] } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$conversationId",
          lastMessage: { $first: "$text" },
          lastTime: { $first: "$createdAt" },
          senderId: { $first: "$senderId" },
          receiverId: { $first: "$receiverId" },
          senderName: { $first: "$senderName" },
          senderRole: { $first: "$senderRole" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$receiverId", userId] }, { $eq: ["$read", false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      // Determine the other user's ID
      {
        $addFields: {
          otherUserId: {
            $cond: [{ $eq: ["$senderId", userId] }, { $toObjectId: "$receiverId" }, { $toObjectId: "$senderId" }]
          }
        }
      },
      // Lookup the other user from the 'customers' collection (which holds all users)
      {
        $lookup: {
          from: "customers",
          localField: "otherUserId",
          foreignField: "_id",
          as: "otherUserDetails"
        }
      },
      {
        $addFields: {
          otherUserImage: { $arrayElemAt: ["$otherUserDetails.image", 0] }
        }
      },
      {
        $project: {
          otherUserDetails: 0,
          otherUserId: 0
        }
      },
      { $sort: { lastTime: -1 } },
    ]);

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/chat/:otherUserId?userId=xxx — get messages between two users
router.get("/:otherUserId", async (req, res) => {
  try {
    const { userId } = req.query;
    const { otherUserId } = req.params;
    if (!userId) return res.status(400).json({ message: "userId is required" });

    const conversationId = Message.getConversationId(userId, otherUserId);

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .limit(200);

    // Mark messages as read
    await Message.updateMany(
      { conversationId, receiverId: userId, read: false },
      { $set: { read: true } }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/chat/message/:messageId
router.delete("/message/:messageId", async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.query; // to verify ownership
    
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    // Only allow the sender to delete their own message
    if (message.senderId !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this message" });
    }

    await Message.findByIdAndDelete(messageId);
    res.json({ success: true, messageId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/chat/conversation/:conversationId
router.delete("/conversation/:conversationId", async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.query;
    
    // Validate the conversation involves the user
    if (!conversationId.includes(userId)) {
      return res.status(403).json({ message: "Not authorized to delete this conversation" });
    }

    await Message.deleteMany({ conversationId });
    res.json({ success: true, conversationId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
