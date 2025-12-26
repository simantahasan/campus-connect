const router = require('express').Router();
const Group = require('../models/Group');

// 1. CREATE GROUP
router.post('/', async (req, res) => {
  // We ensure the creator is automatically added as a member
  const groupData = {
    ...req.body,
    members: [req.body.createdBy] 
  };
  const newGroup = new Group(groupData);
  try {
    const savedGroup = await newGroup.save();
    res.status(200).json(savedGroup);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 2. GET ALL GROUPS (Needed for the Feed)
router.get("/", async (req, res) => {
  try {
    const groups = await Group.find().sort({ createdAt: -1 });
    res.status(200).json(groups);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 3. JOIN / LEAVE GROUP (Critical for Community)
router.put("/:id/join", async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    const userId = req.body.userId;

    if (!group.members.includes(userId)) {
      // JOIN
      await group.updateOne({ $push: { members: userId } });
      res.status(200).json("Joined the group!");
    } else {
      // LEAVE
      await group.updateOne({ $pull: { members: userId } });
      res.status(200).json("Left the group!");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// 4. UPLOAD MATERIAL (Your existing code)
router.put('/:id/material', async (req, res) => {
  try {
    const material = {
      title: req.body.title,
      url: req.body.url, 
      uploadedBy: req.body.userId
    };
    await Group.findByIdAndUpdate(req.params.id, {
      $push: { materials: material }
    });
    res.status(200).json("Material uploaded successfully");
  } catch (err) {
    res.status(500).json(err);
  }
});

// 5. SEARCH RESOURCES (Your existing code)
router.get('/search', async (req, res) => {
  const query = req.query.q;
  try {
    // Note: This requires a text index in MongoDB. 
    // If it fails, we can use simple regex search instead.
    const results = await Group.find({ name: { $regex: query, $options: "i" } });
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;