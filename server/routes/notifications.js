const router = require("express").Router();
const Notification = require("../models/Notification");

// 1. GET USER NOTIFICATIONS
router.get("/:userId", async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.params.userId })
      .sort({ createdAt: -1 }) // Newest first
      .populate("sender", "username profilePicture");
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 2. MARK AS READ
router.put("/:id/read", async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.status(200).json("Marked as read");
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;