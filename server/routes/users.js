const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

// UPDATE USER (Bio, Major, etc.)
router.put("/:id", async (req, res) => {
  // Security Check: You can only update your OWN account
  if (req.body.userId === req.params.id) {
    
    // If they want to update password, hash it again
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }

    try {
      // Find the user by ID and update the fields provided in req.body
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      }, { new: true }); // "new: true" returns the UPDATED user, not the old one

      res.status(200).json({ message: "Account has been updated!", user });
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can only update your own account!");
  }
});

// GET A USER (To view a profile)
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, otp, ...other } = user._doc; // Don't send password/otp to frontend
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;