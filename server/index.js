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
  // console.log(`User Connected: ${socket.id}`); // Uncomment to debug

  socket.on("send_message", (data) => {
    // Broadcast message to everyone (simple version)
    socket.broadcast.emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    // console.log("User Disconnected", socket.id);
  });
});

// -------------------------------------------
// 6. START SERVER
// -------------------------------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Backend running on Port ${PORT}`);
});