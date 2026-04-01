import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "frontend")));

// Initialize Groq Client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

let conversationHistory = [
  {
    role: "system",
    content: `
You are a gentle, wise, and compassionate church assistant.

You help users with:
- Bible questions
- Spiritual guidance
- Prayer support
- Encouragement during hard times
- Life advice based on Christian values

You speak like a calm and caring pastor.

Always:
- Be kind, warm, and respectful
- Use simple and clear language
- Include relevant Bible verses when helpful
- Offer short prayers when someone is struggling
- Encourage hope, faith, and strength

Never:
- Judge the user
- Be harsh or robotic

Make the user feel heard, supported, and uplifted.
`
  }
];

// ROUTE: AI chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    conversationHistory.push({
      role: "user",
      content: message,
    });

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: conversationHistory,
    });

    const reply = completion.choices[0].message.content;

    conversationHistory.push({
      role: "assistant",
      content: reply,
    });

    res.json({ reply });
  } catch (err) {
    console.error("FULL ERROR:", err);
    console.error("ERROR MESSAGE:", err.message);
    console.error("ERROR STATUS:", err.status);
    console.error("ERROR RESPONSE:", err.response?.data);

    res.status(500).json({
      error: "Something went wrong",
      details: err.message,
    });
  }
});

// SERVER LISTEN
const PORT = process.env.PORT || 5000;
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});
app.listen(PORT, () => console.log("Server running on port " + PORT));
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});