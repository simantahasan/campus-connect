const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // 👇 NEW: Add this section for Chat History
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  // 👆 End New Section

  // 👇 NEW: File Storage
  files: [{
    name: { type: String }, // e.g. "Biology_Notes.pdf"
    path: { type: String }, // e.g. "uploads/12345.pdf"
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now }
  }],
  // 👆 End New Section

  // Feature 10: Study Materials
  materials: [{
    title: String,
    url: String, // PDF/Image Link
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Group', GroupSchema);