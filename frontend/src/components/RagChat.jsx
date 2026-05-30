import { useState } from "react";
import { askFromDocuments } from "../api/ragApi";

function RagChat() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");
    setSources([]);

    try {
      const data = await askFromDocuments(question);

      setAnswer(data.answer);
      setSources(data.sources || []);
    } catch (error) {
      setAnswer(
        "Sorry, I could not answer from the uploaded documents. Make sure backend, Ollama, and vectorStore.json are ready."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h2 style={styles.title}>Ask From Uploaded PDFs</h2>
        <p style={styles.subtitle}>RAG mode using OCR/vector search</p>
      </div>

      <textarea
        style={styles.textarea}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask something from your uploaded PDF..."
      />

      <button style={styles.button} onClick={handleAsk}>
        {loading ? "Searching..." : "Ask PDF"}
      </button>

      {answer && (
        <div style={styles.answerBox}>
          <h3 style={styles.sectionTitle}>Answer</h3>
          <p style={styles.answer}>{answer}</p>
        </div>
      )}

      {sources.length > 0 && (
        <div style={styles.sourcesBox}>
          <h3 style={styles.sectionTitle}>Sources</h3>

          {sources.map((source, index) => (
            <div key={index} style={styles.sourceItem}>
              <strong>
                {source.source} — Chunk {source.chunkIndex}
              </strong>
              <p style={styles.score}>
                Relevance Score: {Number(source.score).toFixed(4)}
              </p>
              <p style={styles.preview}>{source.preview}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    width: "480px",
    minHeight: "620px",
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    marginBottom: "16px",
  },
  title: {
    margin: 0,
    color: "#1e3a8a",
    fontSize: "22px",
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: "14px",
  },
  textarea: {
    width: "100%",
    minHeight: "110px",
    boxSizing: "border-box",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    resize: "vertical",
    fontSize: "14px",
    outline: "none",
  },
  button: {
    marginTop: "12px",
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "12px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontWeight: "bold",
    cursor: "pointer",
  },
  answerBox: {
    marginTop: "18px",
    padding: "14px",
    borderRadius: "14px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
  },
  sourcesBox: {
    marginTop: "18px",
  },
  sectionTitle: {
    margin: "0 0 10px",
    color: "#0f172a",
    fontSize: "16px",
  },
  answer: {
    whiteSpace: "pre-wrap",
    lineHeight: "1.5",
    fontSize: "14px",
  },
  sourceItem: {
    padding: "12px",
    borderRadius: "12px",
    backgroundColor: "#f1f5f9",
    marginBottom: "10px",
    fontSize: "13px",
  },
  score: {
    margin: "6px 0",
    color: "#475569",
  },
  preview: {
    margin: 0,
    color: "#334155",
    lineHeight: "1.4",
  },
};

export default RagChat;