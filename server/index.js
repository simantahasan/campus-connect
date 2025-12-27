const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

// Import Routes
const authRoute = require("./routes/auth");
const messageRoute = require("./routes/messages");
const materialRoute = require("./routes/materials"); // 👈 ensure this file exists
const groupRoute = require("./routes/groups");
const eventRoute = require("./routes/events");
const notificationRoute = require("./routes/notifications");

dotenv.config();

const app = express();
const server = http.createServer(app);

// -------------------------------------------
// 1. FIXED CORS CONFIGURATION (Allows IPs)
// -------------------------------------------
app.use(cors({
  origin: "*", // 👈 Allows access from localhost, 192.168.x.x, etc.
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// -------------------------------------------
// 2. MAKE UPLOADS FOLDER PUBLIC
// -------------------------------------------
// This allows the frontend to download files from http://localhost:5000/uploads/...
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// -------------------------------------------
// 3. DATABASE CONNECTION
// -------------------------------------------
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ DB Connection Success!"))
  .catch((err) => console.log("❌ DB Connection Error:", err));

// -------------------------------------------
// 4. REGISTER ROUTES
// -------------------------------------------
app.use("/api/auth", authRoute);
app.use("/api/messages", messageRoute);
app.use("/api/materials", materialRoute); // 👈 This fixes the 404 error
app.use("/api/groups", groupRoute);
app.use("/api/events", eventRoute);
app.use("/api/notifications", notificationRoute);
// -------------------------------------------
// 5. SOCKET.IO SETUP (Real-time Chat)
// -------------------------------------------
const io = new Server(server, {
  cors: {
    origin: "*", // 👈 Allows Socket connection from any IP
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // ... (Your existing socket code for global chat might be here) ...

  // 👇 NEW: Study Group Chat Logic
  socket.on("join_group", (groupId) => {
    socket.join(groupId);
    console.log(`User joined group: ${groupId}`);
  });

  socket.on("send_group_message", async (data) => {
    const { groupId, userId, text } = data;
    
    // 1. Save to Database (so it's there when you reload)
    try {
      const Group = require("./models/Group"); // Import inside to avoid top-level issues
      const group = await Group.findById(groupId);
      if (group) {
        group.messages.push({ sender: userId, text });
        await group.save();
        
        // 2. Populate sender info so frontend can show username/pic
        const updatedGroup = await Group.findById(groupId).populate("messages.sender", "username profilePicture");
        const newMessage = updatedGroup.messages[updatedGroup.messages.length - 1];

        // 3. Send to everyone in the room
        io.to(groupId).emit("receive_group_message", newMessage);
      }
    } catch (err) {
      console.error("Error saving group message:", err);
    }
  });
  // 👆 End New Section

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

// -------------------------------------------
// 6. START SERVER
// -------------------------------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Backend running on Port ${PORT}`);
});