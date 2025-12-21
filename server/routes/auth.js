const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

// 1. REGISTER WITH OTP
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Generate 4-Digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // --- SMART CHECK START ---
    const existingUser = await User.findOne({ 
      $or: [{ email: email.toLowerCase() }, { username: username }] 
    });

    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json("User already exists!");
      } 
      
      // Update unverified user
      existingUser.otp = otp;
      existingUser.password = hashedPassword;
      existingUser.email = email.toLowerCase(); 
      existingUser.username = username;
      
      await existingUser.save();

      console.log(`📧 [MOCK EMAIL RESEND] To: ${email} | Code: ${otp}`);
      return res.status(200).json({ message: "OTP sent again" });
    }
    // --- SMART CHECK END ---

    if (!email.toLowerCase().endsWith('@g.bracu.ac.bd')) {
      return res.status(403).json("Only @g.bracu.ac.bd emails allowed.");
    }

    const newUser = new User({
      username: username,
      email: email.toLowerCase(),
      password: hashedPassword,
      otp: otp,
      isVerified: false
    });

    await newUser.save();
    console.log(`📧 [MOCK EMAIL] To: ${email} | Code: ${otp}`);

    res.status(200).json({ message: "OTP sent" });

  } catch (err) {
    console.error("Register Error:", err);
    // 👇 FIX: Handle Duplicate Key Error (Code 11000)
    if (err.code === 11000) {
      return res.status(400).json("That username or email is already taken.");
    }
    // Generic Error
    res.status(500).json("Server Error during registration.");
  }
});

// 2. VERIFY OTP
router.post("/verify", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) return res.status(404).json("User not found");
    
    if (user.otp !== otp) {
      return res.status(400).json("Invalid Code!");
    }

    user.isVerified = true;
    user.otp = ""; 
    await user.save();

    // 👇 FIX: Return User AND Token
    res.status(200).json({ 
        user: user, 
        token: "verification_successful_token" 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json("Verification failed on server.");
  }
});

// 3. LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (!user) return res.status(404).json("User not found");

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).json("Wrong password");

    if (!user.isVerified) {
        return res.status(403).json("Please verify your email first.");
    }

    res.status(200).json({ 
        user: user, 
        token: "logged_in_successfully" 
    });

  } catch (err) {
    res.status(500).json("Login failed on server.");
  }
});

// 4. UPDATE PROFILE
router.put("/update/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 5. GET ALL USERS (For the Chat List)
router.get("/users", async (req, res) => {
  try {
    // Return all users, but hide their passwords and OTPs for security
    const users = await User.find({}, { password: 0, otp: 0 });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;