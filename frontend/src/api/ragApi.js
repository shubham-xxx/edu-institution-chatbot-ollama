import axios from "axios";

const API_URL = "http://localhost:5000/api/rag/ask";

export const askFromDocuments = async (question) => {
  const response = await axios.post(API_URL, {
    question,
  });

  return response.data;
};