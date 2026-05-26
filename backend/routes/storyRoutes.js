const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../middleware/authMiddleware");
const Story = require("../models/Story");
const Farmer = require("../models/Farmer");

/* ── GET all stories (sorted by newest) ── */
router.get("/", async (req, res) => {
    try {
        const { farmerId } = req.query;
        const query = farmerId ? { farmerId } : {};
        const stories = await Story.find(query).sort({ createdAt: -1 });
        res.json(stories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* ── GET saved stories ── */
router.get("/saved", verifyToken, async (req, res) => {
    try {
        const Customer = require("../models/Customer");
        const Farmer = require("../models/Farmer");

        let userModel = req.user.role === "farmer" ? Farmer : Customer;
        const user = await userModel.findById(req.user.id).populate("savedStories");
        
        if (!user) return res.status(404).json({ message: "User not found" });

        // Filter out nulls in case stories were deleted
        const validStories = (user.savedStories || []).filter(s => s != null);
        res.json(validStories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* ── POST create a story (farmer only) ── */
router.post("/", verifyToken, checkRole("farmer", "admin"), async (req, res) => {
    try {
        const { videoUrl, caption } = req.body;
        
        if (!videoUrl) {
            return res.status(400).json({ message: "Video data is required" });
        }

        // Validate size (rough estimation for base64: length * (3/4))
        const approximateSizeMB = (videoUrl.length * 0.75) / (1024 * 1024);
        if (approximateSizeMB > 12) {
            return res.status(400).json({ message: "Video is too large. Max size is 10MB." });
        }

        const farmer = await Farmer.findById(req.user.id);
        if (!farmer) return res.status(404).json({ message: "Farmer not found" });

        const newStory = new Story({
            farmerId: farmer._id,
            farmerName: farmer.name,
            farmerImage: farmer.image || "",
            videoUrl,
            caption
        });

        await newStory.save();
        res.status(201).json(newStory);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* ── PUT like a story ── */
router.put("/:id/like", verifyToken, async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);
        if (!story) return res.status(404).json({ message: "Story not found" });

        const userId = req.user.id;
        const index = story.likedBy.indexOf(userId);

        if (index === -1) {
            // Like
            story.likedBy.push(userId);
            story.likes += 1;
        } else {
            // Unlike
            story.likedBy.splice(index, 1);
            story.likes -= 1;
        }

        await story.save();
        res.json({ likes: story.likes, likedByMe: index === -1 });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* ── PUT save a story ── */
router.put("/:id/save", verifyToken, async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);
        if (!story) return res.status(404).json({ message: "Story not found" });

        const Customer = require("../models/Customer");
        const Farmer = require("../models/Farmer");

        let userModel = req.user.role === "farmer" ? Farmer : Customer;
        const user = await userModel.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!user.savedStories) user.savedStories = [];
        
        const savedIndex = user.savedStories.indexOf(story._id);
        const isSaved = savedIndex !== -1;

        if (isSaved) {
            user.savedStories.splice(savedIndex, 1);
        } else {
            user.savedStories.push(story._id);
        }

        await user.save();
        res.json({ saved: !isSaved, savedStories: user.savedStories });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* ── DELETE a story (farmer or admin) ── */
router.delete("/:id", verifyToken, checkRole("farmer", "admin"), async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);
        if (!story) return res.status(404).json({ message: "Story not found" });

        if (req.user.role !== "admin" && story.farmerId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this story" });
        }

        await Story.findByIdAndDelete(req.params.id);
        res.json({ message: "Story deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
