# Edu Institution Chatbot (Ollama)

A full‑stack educational institution chatbot built using:

- React (Vite)
- Node.js + Express
- Ollama (local LLM, CPU mode)
- Custom knowledge base (Chitkara University example)

⚠️ Disclaimer:  
This is a demo project for learning and development purposes only.  
It is NOT an official Chitkara University chatbot.

---

## Features

- Full chat UI with React
- Backend API using Express
- Local AI using Ollama (no OpenAI API)
- CPU‑only LLM execution (stable on Windows)
- Knowledge‑base‑driven responses

---

## Tech Stack

| Layer | Technology |
|-----|-----------|
| Frontend | React + Vite |
| Backend | Node.js, Express |
| AI | Ollama (llama3) |
| Communication | REST API |

---

## Project Structure

```text
edu-institution-chatbot/
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── data/
│   └── server.js
├── frontend/
│   ├── src/
│   └── vite.config.js
└── README.md
