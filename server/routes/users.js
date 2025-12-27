const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

// ---------------------------------------------------
// 1. SEARCH USERS (For "Add Participant" in Events)
// ---------------------------------------------------
// This handles: /api/users?username=john
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;

  try {
    const user = userId 
      ? await User.findById(userId) 
      : await User.findOne({ username: username });

    if (!user) return res.status(404).json("User not found");
    
    // Don't send the password!
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ---------------------------------------------------
// 2. UPDATE USER (Bio, Major, etc.)
// ---------------------------------------------------
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      }, { new: true });
      res.status(200).json({ message: "Account has been updated!", user });
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can only update your own account!");
  }
});

// ---------------------------------------------------
// 3. GET ALL USERS (For Chat Sidebar)
// ---------------------------------------------------
router.get("/:id/all", async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.params.id } });
    const usersList = users.map((u) => ({
      _id: u._id,
      username: u.username,
      profilePicture: u.profilePicture,
    }));
    res.status(200).json(usersList);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ---------------------------------------------------
// 4. GET A USER (Profile by ID)
// ---------------------------------------------------
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;