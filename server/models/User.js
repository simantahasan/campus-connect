const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // Auth & Security
  otp: { type: String },
  isVerified: { type: Boolean, default: false },
  
  // Profile Data
  profilePicture: { type: String, default: "" }, // Stores the Image URL
  bio: { type: String, default: "" },
  major: { type: String, default: "" },
  semester: { type: String, default: "" },       // Changed Year to Semester
  studentId: { type: String, default: "" },      // Added back as optional text
  skills: { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);