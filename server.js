import express from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config(); // Load environment variables (like API keys)

const app = express();
app.use(express.json()); // Allows us to read JSON request bodies

// Initialize the Gemini client using your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Simple home route to test if server works
app.get("/", (req, res) => {
  res.send("AI Backend is running twin 😎🔥");
});

// AI chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    // Make sure message exists
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Use Gemini model for text responses
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(message);

    res.json({
      reply: result.response.text(),
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error twin." });
  }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} twin 😎`);
});