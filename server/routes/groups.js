const multer = require("multer");
const path = require("path");
const router = require('express').Router();
const Group = require('../models/Group');

// Configure File Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Files save to 'server/uploads'
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// 1. CREATE GROUP
router.post('/', async (req, res) => {
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

// 2. GET ALL GROUPS
router.get("/", async (req, res) => {
  try {
    const groups = await Group.find().sort({ createdAt: -1 });
    res.status(200).json(groups);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 3. JOIN / LEAVE GROUP
router.put("/:id/join", async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    const userId = req.body.userId;

    if (!group.members.includes(userId)) {
      await group.updateOne({ $push: { members: userId } });
      res.status(200).json("Joined the group!");
    } else {
      await group.updateOne({ $pull: { members: userId } });
      res.status(200).json("Left the group!");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// 4. UPLOAD MATERIAL (Legacy/Alternative)
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

// 5. SEARCH RESOURCES
router.get('/search', async (req, res) => {
  const query = req.query.q;
  try {
    const results = await Group.find({ name: { $regex: query, $options: "i" } });
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 👇 FIXED: Get a specific group by ID (Populating members AND file uploaders)
router.get("/:id", async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("members", "username profilePicture")
      .populate("files.uploadedBy", "username"); // 👈 THIS WAS MISSING
    res.status(200).json(group);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 7. Add a member by Username
router.put("/:id/add_member", async (req, res) => {
  try {
    const { username } = req.body;
    const User = require("../models/User"); 

    const userToAdd = await User.findOne({ username });
    if (!userToAdd) return res.status(404).json("User not found!");

    const group = await Group.findById(req.params.id);
    if (group.members.includes(userToAdd._id)) {
      return res.status(400).json("User is already in this group!");
    }

    group.members.push(userToAdd._id);
    await group.save();

    res.status(200).json(group);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 8. Upload File to Group
router.post("/:id/upload", upload.single("file"), async (req, res) => {
  try {
    const { userId } = req.body;
    const group = await Group.findById(req.params.id);

    const newFile = {
      name: req.file.originalname,
      path: req.file.filename,
      uploadedBy: userId,
    };

    group.files.push(newFile);
    await group.save();

    const updatedGroup = await Group.findById(req.params.id).populate("files.uploadedBy", "username");
    res.status(200).json(updatedGroup.files.pop()); 
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;