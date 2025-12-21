const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  url: { type: String, required: true },
  tags: [String],
  
  // Feature 12: AI Embeddings
  // We store a vector array here to match user queries later
  aiEmbedding: [Number] 
});

// Create a Text Index for basic search
ResourceSchema.index({ title: 'text', subject: 'text' });

module.exports = mongoose.model('Resource', ResourceSchema);