const axios = require("axios");
const chitkaraKnowledgeBase = require("../data/chitkaraKnowledgeBase");

// ✅ Simple in-memory conversation store
// key = sessionId (for now we use a single session)
let conversationHistory = [];

const handleChat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Message is required",
      });
    }

    // ✅ System prompt (always first)
    const systemMessage = {
      role: "system",
      content: `
You are a professional educational institution chatbot.

You are using a demo knowledge base based on publicly available Chitkara University information.
You are NOT an official Chitkara University chatbot.

Rules:
- Answer ONLY from the knowledge base.
- Do NOT invent fees, eligibility, rankings, or dates.
- If information is missing, clearly say so.
- Maintain context across the conversation.
- Be polite, concise, and student-friendly.

Knowledge Base:
${chitkaraKnowledgeBase}
`,
    };

    // ✅ If this is first message, initialize memory
    if (conversationHistory.length === 0) {
      conversationHistory.push(systemMessage);
    }

    // ✅ Add user message to memory
    conversationHistory.push({
      role: "user",
      content: message,
    });

    // ✅ Send full conversation to Ollama
    const response = await axios.post(process.env.OLLAMA_URL, {
      model: process.env.OLLAMA_MODEL || "llama3",
      messages: conversationHistory,
      stream: false,
      options: {
        temperature: 0.2,
        
      },
    });

    const assistantReply = response.data.message.content;

    // ✅ Save assistant reply to memory
    conversationHistory.push({
      role: "assistant",
      content: assistantReply,
    });

    res.json({
      success: true,
      reply: assistantReply,
    });
  } catch (error) {
    console.error("Chat error:", error.message);
    res.status(500).json({
      success: false,
      error: "Chat processing failed",
    });
  }
};

module.exports = { handleChat };
``