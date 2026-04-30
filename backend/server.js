const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudinary = require("cloudinary").v2;
const app = express();
app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

app.get("/", (req, res) => {
    res.send("Backend is running");
});

app.post("/delete-profile-image", async (req, res) => {
    try {
        const { publicId } = req.body;

        if (!publicId) {
            return res.status(400).json({ error: "publicId is required" });
        }

        await cloudinary.uploader.destroy(publicId);

        res.json({ success: true });
    } catch (error) {
        console.error("Cloudinary delete error:", error);
        res.status(500).json({ error: "Failed to delete image" });
    }
});

app.post("/analyze-journal", async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ error: "Journal text is required" });
        }

        const prompt = `
You are a supportive mental wellness assistant for young people in India.

Return ONLY valid JSON.
Do not add markdown.
Do not add explanation text.
Do not wrap in backticks.

Format:
{
  "emotion": "string",
  "stressLevel": "low or medium or high",
  "reflection": "short empathetic reflection",
  "suggestion": "one gentle practical suggestion"
}

If the message suggests self-harm or suicide, return:
{
  "emotion": "high distress",
  "stressLevel": "high",
  "reflection": "This journal suggests intense emotional distress.",
  "suggestion": "Please reach out to a trusted person, counselor, or emergency support immediately."
}

Journal entry:
"${text}"
`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        const rawText = response.text;
        let cleanedText = rawText.trim();

        if (cleanedText.startsWith("```json")) {
            cleanedText = cleanedText.replace(/^```json/, "").replace(/```$/, "").trim();
        } else if (cleanedText.startsWith("```")) {
            cleanedText = cleanedText.replace(/^```/, "").replace(/```$/, "").trim();
        }

        const parsed = JSON.parse(cleanedText);

        return res.json(parsed);
    } catch (error) {
        console.error("Gemini backend error:", error);
        return res.status(500).json({
            error: "Failed to analyze journal",
            details: error.message,
        });
    }
});
function isCrisisMessage(text) {
    const crisisKeywords = [
        "suicide",
        "kill myself",
        "want to die",
        "end my life",
        "hurt myself",
        "self harm",
        "self-harm",
        "no reason to live",
        "i want to die",
        "i want to disappear forever",
        "i should die",
        "i want to end everything"
    ];

    const lowerText = text.toLowerCase();
    return crisisKeywords.some((keyword) => lowerText.includes(keyword));
}
app.post("/chat", async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ error: "Message is required" });
        }

        // Crisis detection first
        if (isCrisisMessage(message)) {
            return res.json({
                reply: `I’m really sorry you’re going through this right now. You deserve immediate human support.

Please contact a trusted person nearby right now — a friend, family member, teacher, counselor, or someone around you.

If you are in India, you can contact Tele-MANAS for 24/7 mental health support:
14416
1-800-891-4416

If you feel you may act on these thoughts or you are in immediate danger, call emergency services right away or go to the nearest hospital.`
            });
        }

        const prompt = `
You are a calm, empathetic, supportive mental wellness assistant for youth in India.

Rules:
- Be warm and non-judgmental
- Do not diagnose mental illness
- Do not prescribe medicine
- Do not claim to be a therapist or doctor
- Encourage healthy coping methods
- Keep replies short, clear, and caring
- If the user sounds in immediate danger or talks about self-harm, strongly encourage reaching out to a trusted person or emergency support immediately

User message:
"${message}"
`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        const reply = response.text;

        return res.json({ reply });
    } catch (error) {
        console.error("Chat backend error:", error);
        return res.status(500).json({
            error: "Failed to get chat response",
            details: error.message,
        });
    }
});
app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
});