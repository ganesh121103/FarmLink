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
        const storiesData = await Story.find(query).select("-videoUrl").sort({ createdAt: -1 }).lean();
        
        const stories = storiesData.map(story => {
            story.videoUrl = `/api/stories/${story._id}/video`;
            return story;
        });
        
        res.json(stories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* ── GET liked stories ── */
router.get("/liked", verifyToken, async (req, res) => {
    try {
        const storiesData = await Story.find({ likedBy: req.user.id }).select("-videoUrl").sort({ createdAt: -1 }).lean();
        const stories = storiesData.map(story => {
            story.videoUrl = `/api/stories/${story._id}/video`;
            return story;
        });
        res.json(stories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* ── GET commented stories ── */
router.get("/commented", verifyToken, async (req, res) => {
    try {
        const storiesData = await Story.find({ "comments.userId": req.user.id }).select("-videoUrl").sort({ createdAt: -1 }).lean();
        // Remove duplicates if user commented multiple times on same story
        const uniqueStories = Array.from(new Map(storiesData.map(s => [s._id.toString(), s])).values());
        const stories = uniqueStories.map(story => {
            story.videoUrl = `/api/stories/${story._id}/video`;
            return story;
        });
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
        const user = await userModel.findById(req.user.id).populate({
            path: "savedStories",
            select: "-videoUrl"
        }).lean();
        
        if (!user) return res.status(404).json({ message: "User not found" });

        // Filter out nulls in case stories were deleted
        const validStories = (user.savedStories || []).filter(s => s != null).map(story => {
            story.videoUrl = `/api/stories/${story._id}/video`;
            return story;
        });
        res.json(validStories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* ── GET story video stream ── */
router.get("/:id/video", async (req, res) => {
    try {
        const story = await Story.findById(req.params.id).select("videoUrl");
        if (!story || !story.videoUrl) {
            return res.status(404).send("Video not found");
        }

        const matches = story.videoUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        
        if (matches && matches.length === 3) {
            const contentType = matches[1];
            const buffer = Buffer.from(matches[2], "base64");
            const size = buffer.length;
            const range = req.headers.range;

            if (range) {
                const parts = range.replace(/bytes=/, "").split("-");
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : size - 1;
                const chunksize = (end - start) + 1;

                res.writeHead(206, {
                    "Content-Range": `bytes ${start}-${end}/${size}`,
                    "Accept-Ranges": "bytes",
                    "Content-Length": chunksize,
                    "Content-Type": contentType,
                });
                res.end(buffer.slice(start, end + 1));
            } else {
                res.writeHead(200, {
                    "Content-Length": size,
                    "Content-Type": contentType,
                    "Accept-Ranges": "bytes"
                });
                res.end(buffer);
            }
        } else {
            if (story.videoUrl.startsWith("http")) {
                res.redirect(story.videoUrl);
            } else {
                res.send(story.videoUrl);
            }
        }
    } catch (err) {
        res.status(500).send(err.message);
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
        const userId = req.user.id;
        const storyId = req.params.id;

        // Try to add the user to likedBy if they aren't there
        let story = await Story.findOneAndUpdate(
            { _id: storyId, likedBy: { $ne: userId } },
            { $push: { likedBy: userId }, $inc: { likes: 1 } },
            { new: true }
        );

        let likedByMe = true;

        if (!story) {
            // They were already in the array, so we should UNLIKE
            story = await Story.findOneAndUpdate(
                { _id: storyId, likedBy: userId },
                { $pull: { likedBy: userId }, $inc: { likes: -1 } },
                { new: true }
            );
            likedByMe = false;
        }

        if (!story) {
            // If it's STILL null, the story doesn't exist at all
            return res.status(404).json({ message: "Story not found" });
        }

        res.json({ likes: story.likes, likedByMe });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* ── PUT save a story ── */
router.put("/:id/save", verifyToken, async (req, res) => {
    try {
        const Customer = require("../models/Customer");
        const Farmer = require("../models/Farmer");

        let userModel = req.user.role === "farmer" ? Farmer : Customer;
        const userId = req.user.id;
        const storyId = req.params.id;

        // Check if the story exists
        const story = await Story.findById(storyId);
        if (!story) return res.status(404).json({ message: "Story not found" });

        // Try to save
        let user = await userModel.findOneAndUpdate(
            { _id: userId, savedStories: { $ne: storyId } },
            { $push: { savedStories: storyId } },
            { new: true }
        );

        let isSaved = true;

        if (!user) {
            // Already saved, so UN-save
            user = await userModel.findOneAndUpdate(
                { _id: userId, savedStories: storyId },
                { $pull: { savedStories: storyId } },
                { new: true }
            );
            isSaved = false;
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ saved: isSaved, savedStories: user.savedStories });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* ── POST comment on a story ── */
router.post("/:id/comment", verifyToken, async (req, res) => {
    try {
        const { text, userName, userImage } = req.body;
        if (!text) return res.status(400).json({ message: "Comment text is required" });

        const story = await Story.findById(req.params.id);
        if (!story) return res.status(404).json({ message: "Story not found" });

        const newComment = {
            userId: req.user.id,
            userName: userName || 'User',
            userImage: userImage || '',
            text,
            createdAt: new Date()
        };

        story.comments.push(newComment);
        await story.save();
        
        res.status(201).json(story.comments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* ── PUT increment share ── */
router.put("/:id/share", async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);
        if (!story) return res.status(404).json({ message: "Story not found" });

        story.shares = (story.shares || 0) + 1;
        await story.save();
        res.json({ shares: story.shares });
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
