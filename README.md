# CodePrep — AI Coding Interview Coach

CodePrep is an intelligent, Notion-inspired platform designed to help developers master coding interviews. It features a curated list of algorithmic patterns, an integrated code editor, and an AI-powered coach that provides structured hints and diagnosis without spoiling the solution.

## Features

- 🧠 **AI Coaching**: Get hints and code diagnosis without having the solution handed to you.
- 📚 **Pattern-Based Learning**: Master data structures and algorithms by focusing on patterns (Sliding Window, Two Pointers, etc.).
- 💻 **Integrated Workspace**: Write, run, and test your code directly in the browser.
- 📊 **Analytics Dashboard**: Track your progress, strongest/weakest topics, and completion rates.
- 🌓 **Beautiful UI**: A clean, premium, Notion-inspired interface that reduces cognitive load.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons, Monaco Editor
- **Backend**: Node.js, Express
- **Database**: MongoDB (via Mongoose)
- **AI**: Groq API (Llama 3.3 70B) for blazing-fast inference

## Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/vikash11004/codeprep.git
   cd codeprep
   ```

2. **Setup the Backend:**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory:
   ```env
   PORT=3001
   GROQ_API_KEY=your_groq_api_key_here
   LLM_MODEL=llama-3.3-70b-versatile
   MONGO_URI=your_mongodb_connection_string
   ```
   Start the backend:
   ```bash
   npm run dev
   ```

3. **Setup the Frontend:**
   Open a new terminal window:
   ```bash
   cd client
   npm install
   ```
   Start the frontend:
   ```bash
   npm run dev
   ```

## Deployment

- **Backend**: Deployed on [Render](https://render.com). Ensure all environment variables from your local `.env` are set in the Render dashboard.
- **Frontend**: Deployed on [Vercel](https://vercel.com). The `.env.production` file maps API requests directly to the live Render backend URL.

## License

MIT License
