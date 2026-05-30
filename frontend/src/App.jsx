import Chatbot from "./components/Chatbot";
import RagChat from "./components/RagChat";

function App() {
  return (
    <div style={styles.page}>
      <Chatbot />
      <RagChat />
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    gap: "24px",
    justifyContent: "center",
    alignItems: "flex-start",
    background: "linear-gradient(135deg, #dbeafe, #f8fafc)",
    padding: "32px",
    flexWrap: "wrap",
  },
};

export default App;