import { useEffect, useState } from "react";
import {
  uploadPdf,
  rebuildVectorStore,
  getDocuments,
} from "../api/documentApi";

function PdfUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const loadDocuments = async () => {
    try {
      const data = await getDocuments();
      setDocuments(data.files || []);
    } catch (error) {
      setStatus("Failed to load documents.");
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) {
      setStatus("Please select a PDF file first.");
      return;
    }

    setLoading(true);
    setStatus("Uploading PDF...");

    try {
      await uploadPdf(selectedFile);
      setStatus("PDF uploaded successfully.");
      setSelectedFile(null);
      await loadDocuments();
    } catch (error) {
      setStatus("PDF upload failed. Make sure the file is a PDF and below 20MB.");
    } finally {
      setLoading(false);
    }
  };

  const handleRebuild = async () => {
    setLoading(true);
    setStatus("Rebuilding vector store. This may take some time...");

    try {
      const data = await rebuildVectorStore();

      setStatus(
        `Vector store rebuilt successfully. Total chunks: ${data.vectorCount}`
      );
    } catch (error) {
      setStatus(
        "Failed to rebuild vector store. Check backend terminal logs."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Upload PDF Documents</h2>
      <p style={styles.subtitle}>
        Upload brochures, syllabi, admission PDFs, or scanned PDFs for RAG.
      </p>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setSelectedFile(e.target.files[0])}
        style={styles.fileInput}
      />

      {selectedFile && (
        <p style={styles.fileName}>
          Selected: <strong>{selectedFile.name}</strong>
        </p>
      )}

      <button
        style={styles.button}
        onClick={handleUpload}
        disabled={loading}
      >
        Upload PDF
      </button>

      <button
        style={{ ...styles.button, backgroundColor: "#16a34a" }}
        onClick={handleRebuild}
        disabled={loading}
      >
        Rebuild Vector Store
      </button>

      {status && <p style={styles.status}>{status}</p>}

      <div style={styles.documentsBox}>
        <h3 style={styles.sectionTitle}>Uploaded Documents</h3>

        {documents.length === 0 ? (
          <p style={styles.empty}>No documents uploaded yet.</p>
        ) : (
          documents.map((doc, index) => (
            <div key={index} style={styles.docItem}>
              <strong>{doc.name}</strong>
              <p style={styles.docMeta}>
                Size: {(doc.size / 1024).toFixed(2)} KB
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    width: "420px",
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    margin: 0,
    color: "#1e3a8a",
    fontSize: "22px",
  },
  subtitle: {
    marginTop: "8px",
    color: "#64748b",
    fontSize: "14px",
    lineHeight: "1.4",
  },
  fileInput: {
    marginTop: "12px",
    marginBottom: "12px",
  },
  fileName: {
    fontSize: "13px",
    color: "#334155",
  },
  button: {
    width: "100%",
    marginTop: "10px",
    padding: "12px",
    border: "none",
    borderRadius: "12px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontWeight: "bold",
    cursor: "pointer",
  },
  status: {
    marginTop: "12px",
    fontSize: "14px",
    color: "#0f172a",
    lineHeight: "1.4",
  },
  documentsBox: {
    marginTop: "18px",
  },
  sectionTitle: {
    fontSize: "16px",
    color: "#0f172a",
  },
  empty: {
    fontSize: "13px",
    color: "#64748b",
  },
  docItem: {
    padding: "10px",
    borderRadius: "10px",
    backgroundColor: "#f1f5f9",
    marginBottom: "8px",
    fontSize: "13px",
  },
  docMeta: {
    margin: "4px 0 0",
    color: "#64748b",
  },
};

export default PdfUpload;