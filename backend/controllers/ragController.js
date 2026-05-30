const { askRAG, retrieveRelevantChunks } = require("../rag/ragService");

const askFromDocuments = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Question is required.",
      });
    }

    const result = await askRAG(question);

    return res.json({
      success: true,
      question,
      answer: result.answer,
      sources: result.sources,
    });
  } catch (error) {
    console.error("RAG error:", error.message);

    return res.status(500).json({
      success: false,
      error: error.message || "RAG processing failed.",
    });
  }
};

const retrieveOnly = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Question is required.",
      });
    }

    const chunks = await retrieveRelevantChunks(question, 5);

    return res.json({
      success: true,
      question,
      chunks: chunks.map((chunk) => ({
        source: chunk.source,
        chunkIndex: chunk.chunkIndex,
        score: chunk.score,
        text: chunk.text.substring(0, 600),
      })),
    });
  } catch (error) {
    console.error("Retrieve error:", error.message);

    return res.status(500).json({
      success: false,
      error: error.message || "Retrieval failed.",
    });
  }
};

module.exports = {
  askFromDocuments,
  retrieveOnly,
};