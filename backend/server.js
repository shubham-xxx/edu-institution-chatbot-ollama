const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const chatRoutes = require("./routes/chatRoutes");
const leadRoutes = require("./routes/leadRoutes");
const ragRoutes = require("./routes/ragRoutes");

const app = express();

// Connect MongoDB
connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/chat", chatRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/rag", ragRoutes);

app.get("/", (req, res) => {
  res.send("Ollama Educational Institution Chatbot Backend is running.");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});