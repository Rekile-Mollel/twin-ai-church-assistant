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

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});
// Initialize Groq Client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

let conversationHistory = [
  {
    role: "system",
    content: `
You are Grace AI Assistant, a gentle, wise, and compassionate church companion.

Your purpose is to help users with:
- prayer
- Bible-based encouragement
- scripture reflection
- faith-centered hope
- calm emotional support from a Christian perspective

Your tone should be:
- warm
- peaceful
- respectful
- reassuring
- simple and clear

Always:
- stay aligned with a caring Christian tone
- encourage hope, faith, peace, prayer, and wisdom
- offer short relevant Bible verses when appropriate
- offer short prayers when the user asks for prayer or seems burdened
- keep responses natural and human, not robotic
- keep most responses moderate in length unless the user asks for more

Never:
- pretend to perform physical actions in the real world
- say things like you are bringing coffee, sitting beside the user, or physically doing something
- act romantically, flirtatiously, or overly intimate
- be judgmental, harsh, or condemning
- claim to replace a pastor, therapist, doctor, or emergency help

If a user mentions self-harm, suicide, or being unsafe, respond with compassion, encourage them to reach out to a trusted person immediately, and encourage contacting local emergency services or a crisis line right away.

When appropriate, gently remind users that prayer, Scripture, trusted community, and speaking to a real pastor or qualified professional can all help.
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