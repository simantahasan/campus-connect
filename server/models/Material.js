const mongoose = require("mongoose");

const MaterialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    courseCode: { type: String, required: true }, // e.g., "CSE110", "MAT120"
    topics: { type: [String], default: [] },      // e.g., ["Loop", "Array", "Pointer"]
    fileUrl: { type: String, required: true },    // Path to file
    fileType: { type: String }, 
    uploadedBy: { type: String },                 // User ID
  },
  { timestamps: true }
);

module.exports = mongoose.model("Material", MaterialSchema);