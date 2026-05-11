const axios = require("axios");
const chitkaraKnowledgeBase = require("../data/chitkaraKnowledgeBase");

const handleChat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Message is required.",
      });
    }

    const systemPrompt = `
You are a professional educational institution chatbot.

You are using a demo knowledge base based on publicly available Chitkara University information.

Important identity rule:
- You are NOT an official Chitkara University chatbot.
- You are a demo educational assistant for a student project.

Response rules:
- Answer only using the knowledge base provided below.
- Do not invent fees, eligibility, deadlines, rankings, placements, phone numbers, or policies.
- If information is missing, say that you do not have verified information in the current knowledge base.
- Always suggest checking the official website or contacting the admission office for final confirmation.
- Keep answers clear, polite, and professional.
- Use bullet points when useful.
- If user seems interested in admission, ask whether they want to share basic contact details.
- Never ask for OTPs, passwords, bank details, card details, Aadhaar number, or payment information.
- If the user asks something unrelated to admissions, courses, university contact, programs, or student support, politely redirect to educational institution topics.

Knowledge Base:
${chitkaraKnowledgeBase}
`;

    const response = await axios.post(process.env.OLLAMA_URL, {
      model: process.env.OLLAMA_MODEL || "llama3",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: message,
        },
      ],
      stream: false,
      options: {
        temperature: 0.2,
      },
    });

    const reply = response.data.message.content;

    return res.json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("Ollama Chat Error:", error.message);

    return res.status(500).json({
      success: false,
      error:
        "Failed to generate response. Please make sure Ollama is running and the selected model is installed.",
    });
  }
};

module.exports = { handleChat };