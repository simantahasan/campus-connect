const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: { 
      type: String, 
      // 👇 I added "event" to this list so the database accepts it
      enum: ["message", "group_message", "event_invite", "event_update", "new_event", "event"],
      required: true 
    },
    message: { type: String, required: true },
    link: { type: String }, 
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);