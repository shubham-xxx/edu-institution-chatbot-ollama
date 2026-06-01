const fs = require("fs");
const path = require("path");
const axios = require("axios");

const VECTOR_STORE_PATH = path.join(__dirname, "vectorStore.json");

const OLLAMA_EMBEDDING_URL = "http://localhost:11434/api/embeddings";
const OLLAMA_CHAT_URL = "http://localhost:11434/api/chat";

const EMBEDDING_MODEL = "nomic-embed-text";
const CHAT_MODEL = process.env.OLLAMA_MODEL || "llama3";

// Cosine similarity compares two embedding vectors
const cosineSimilarity = (vecA, vecB) => {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magnitudeA += vecA[i] * vecA[i];
    magnitudeB += vecB[i] * vecB[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
};

const loadVectorStore = () => {
  if (!fs.existsSync(VECTOR_STORE_PATH)) {
    throw new Error("vectorStore.json not found. Please build vector store first.");
  }

  const rawData = fs.readFileSync(VECTOR_STORE_PATH, "utf-8");
  const vectorStore = JSON.parse(rawData);

  if (!Array.isArray(vectorStore) || vectorStore.length === 0) {
    throw new Error("vectorStore.json is empty. Please add documents and rebuild vector store.");
  }

  return vectorStore;
};

const createQueryEmbedding = async (question) => {
  const response = await axios.post(OLLAMA_EMBEDDING_URL, {
    model: EMBEDDING_MODEL,
    prompt: question,
  });

  return response.data.embedding;
};

const retrieveRelevantChunks = async (question, topK = 4) => {
  const vectorStore = loadVectorStore();
  const questionEmbedding = await createQueryEmbedding(question);

  const scoredChunks = vectorStore.map((item) => {
    const score = cosineSimilarity(questionEmbedding, item.embedding);

    return {
      ...item,
      score,
    };
  });

  scoredChunks.sort((a, b) => b.score - a.score);

  return scoredChunks.slice(0, topK);
};

const askRAG = async (question) => {
  const relevantChunks = await retrieveRelevantChunks(question, 4);

  
const context = relevantChunks
  .map((chunk) => {
    return `
Document: ${chunk.source}
Relevant Content:
${chunk.text}
`;
  })
  .join("\n\n---\n\n");


  const systemPrompt = `
You are a professional educational institution assistant.

Your task is to answer the user's question using ONLY the provided document context.

Important response rules:
- Do NOT mention chunk numbers, source numbers, relevance scores, embeddings, vector search, or internal retrieval details.
- Do NOT say phrases like "In Chunk 57" or "Source 1 says".
- Write the answer as a polished student-facing response.
- If the context contains relevant information, summarize it clearly.
- If the context does not contain enough information, say: "I could not find enough verified information about this in the uploaded documents."
- Do not invent fees, eligibility, dates, rankings, policies, placements, or contact details.
- Keep the answer concise, professional, and easy to understand.
- Use bullet points when listing courses, specialisations, features, or steps.
- Mention "Based on the uploaded documents" only once at the beginning if needed.
`;

  const userPrompt = `
Use the following uploaded document excerpts to answer the question.

Uploaded Document Excerpts:
${context}

Question:
${question}

Write a professional, student-facing answer.
`;

  const response = await axios.post(OLLAMA_CHAT_URL, {
    model: CHAT_MODEL,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
    stream: false,
    options: {
      temperature: 0.2
    },
  });

  return {
    answer: response.data.message.content,
    sources: relevantChunks.map((chunk) => ({
      source: chunk.source,
      chunkIndex: chunk.chunkIndex,
      score: chunk.score,
      preview: chunk.text.substring(0, 250),
    })),
  };
};

module.exports = {
  askRAG,
  retrieveRelevantChunks,
};