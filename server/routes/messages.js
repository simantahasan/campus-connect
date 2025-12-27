const router = require("express").Router();
const Message = require("../models/Message");
// const Notification = require("../models/Notification"); // 👈 You can comment this out too

// 1. ADD MESSAGE
router.post("/", async (req, res) => {
  const newMessage = new Message(req.body);

  try {
    const savedMessage = await newMessage.save();

    // ✂️ REMOVED THE NOTIFICATION LOGIC BLOCK HERE ✂️
    // No more Notification.create(...)
    
    res.status(200).json(savedMessage);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 2. GET MESSAGES
router.get("/:conversationId", async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;