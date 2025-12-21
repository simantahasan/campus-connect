const router = require("express").Router();
const Material = require("../models/Material");
const multer = require("multer");
const path = require("path");
// 👇 IMPORT GOOGLE GEMINI
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ----------------------------------------------------
// 📂 1. SETUP FILE STORAGE
// ----------------------------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Unique name: timestamp + original name
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// ----------------------------------------------------
// 📤 2. UPLOAD ROUTE (With Course Code)
// ----------------------------------------------------
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const newMaterial = new Material({
      title: req.body.title,
      courseCode: req.body.courseCode.toUpperCase(), // Force uppercase (cse110 -> CSE110)
      topics: req.body.topics ? req.body.topics.split(",") : [],
      fileUrl: req.file.path,
      fileType: req.file.mimetype,
      uploadedBy: req.body.userId,
    });

    const savedMaterial = await newMaterial.save();
    res.status(200).json(savedMaterial);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ----------------------------------------------------
// 🔍 3. SEARCH ROUTE (Title or Course Code)
// ----------------------------------------------------
router.get("/search", async (req, res) => {
  const query = req.query.q; // e.g. ?q=CSE
  try {
    const results = await Material.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { courseCode: { $regex: query, $options: "i" } }, // Finds CSE110 if you search 'CSE'
      ],
    });
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ----------------------------------------------------
// 🤖 4. AI RECOMMENDATION (REAL GEMINI AI)
// ----------------------------------------------------
router.post("/recommend", async (req, res) => {
  const { preferredCourses } = req.body; // Expects array like ["CSE", "MAT"]

  // 1. Fallback if no input
  if (!preferredCourses || preferredCourses.length === 0) {
    return res.status(200).json({ 
      source: "Generic", 
      recommendations: [] 
    });
  }

  try {
    // 2. Initialize Gemini (Check if Key exists first)
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing in .env");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 

    // 3. Construct the Prompt
    const prompt = `
      I am a university student taking these courses: ${preferredCourses.join(", ")}.
      Suggest 5 specific academic topics (e.g., "Calculus", "Data Structures") related to them.
      Return ONLY a comma-separated list of topics. Do not write sentences.
    `;

    // 4. Generate Content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 5. Clean up the response (Remove newlines, split by comma)
    const aiTags = text.split(",").map(tag => tag.trim());

    // 6. Search Database with these new tags
    const searchTerms = [...preferredCourses, ...aiTags];
    const regexQueries = searchTerms.map(term => new RegExp(term, "i"));

    const recommendations = await Material.find({
      $or: [
        { courseCode: { $in: regexQueries } },
        { topics: { $in: regexQueries } },
        { title: { $in: regexQueries } }
      ]
    }).limit(10);

    res.status(200).json({ 
      source: "Google Gemini",
      aiSuggestions: aiTags, 
      recommendations: recommendations 
    });

  } catch (err) {
    console.error("Gemini Error:", err.message);
    
    // Graceful fallback to simulated suggestions if API fails
    // This ensures the app doesn't crash if the internet is down or key is wrong
    const fallbackPatterns = preferredCourses.map(code => new RegExp(code, "i"));
    const fallbackRecs = await Material.find({
        courseCode: { $in: fallbackPatterns }, 
    }).limit(10);

    res.status(200).json({ 
      source: "Fallback (Simulation)", 
      aiSuggestions: preferredCourses,
      recommendations: fallbackRecs 
    });
  }
});

// Get All Materials (For feed)
router.get("/", async (req, res) => {
    try {
        const materials = await Material.find().sort({ createdAt: -1 }); // Newest first
        res.status(200).json(materials);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;