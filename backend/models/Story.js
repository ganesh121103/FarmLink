const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
    farmerName: { type: String, required: true },
    farmerImage: { type: String, default: '' },
    videoUrl: { type: String, required: true }, // Base64 or external URL
    caption: { type: String, default: '' },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Track who liked it to prevent multiple likes
    comments: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        userName: String,
        userImage: String,
        text: String,
        createdAt: { type: Date, default: Date.now }
    }],
    shares: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Story', storySchema);
