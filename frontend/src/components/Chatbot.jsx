import { useState } from "react";
import { sendMessageToBot } from "../api/chatApi";

function Chatbot() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I am your educational assistant. How can I help you?",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;

    setMessages((prev) => [
      ...prev,
      { sender: "user", text: userMessage },
    ]);

    setInput("");
    setLoading(true);

    try {
      const data = await sendMessageToBot(userMessage);

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: data.reply },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry, I couldn’t reach the server. Make sure backend & Ollama are running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>Edu Institution Chatbot</div>

        <div style={styles.messages}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                ...styles.message,
                alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                background:
                  msg.sender === "user" ? "#2563eb" : "#f1f5f9",
                color: msg.sender === "user" ? "#fff" : "#000",
              }}
            >
              {msg.text}
            </div>
          ))}
          {loading && <div style={styles.message}>Thinking…</div>}
        </div>

        <div style={styles.inputArea}>
          <input
            style={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about courses, admissions..."
          />
          <button style={styles.button} onClick={handleSend}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#e5e7eb",
  },
  container: {
    width: 420,
    height: 620,
    background: "#fff",
    display: "flex",
    flexDirection: "column",
    borderRadius: 12,
    overflow: "hidden",
  },
  header: {
    background: "#1e3a8a",
    color: "#fff",
    padding: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  messages: {
    flex: 1,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    overflowY: "auto",
  },
  message: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 10,
    fontSize: 14,
  },
  inputArea: {
    display: "flex",
    padding: 10,
    borderTop: "1px solid #ddd",
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    border: "1px solid #ccc",
  },
  button: {
    marginLeft: 8,
    padding: "10px 15px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
};

export default Chatbot;
``