const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  image: { type: String }, // For posting images
  
  // Feature 6: Interaction
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Feature 7: Sorting metrics
  views: { type: Number, default: 0 },
  
  // Feature 8: AI Moderation
  isFlagged: { type: Boolean, default: false }, // AI sets this to true if toxic
  flagReason: { type: String } // e.g., "Hate Speech"
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);