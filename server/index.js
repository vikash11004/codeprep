import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sessionMiddleware } from './middleware/session.js';
import interpretRouter from './routes/interpret.js';
import generateTestsRouter from './routes/generateTests.js';
import runRouter from './routes/run.js';
import diagnoseRouter from './routes/diagnose.js';
import solutionRouter from './routes/solution.js';
import sessionRouter from './routes/session.js';
import starterCodeRouter from './routes/starterCode.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(sessionMiddleware);

// Routes
app.use('/api', interpretRouter);
app.use('/api', generateTestsRouter);
app.use('/api', runRouter);
app.use('/api', diagnoseRouter);
app.use('/api', solutionRouter);
app.use('/api', sessionRouter);
app.use('/api', starterCodeRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.message);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

import mongoose from 'mongoose';

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error('[CodePrep Server] FATAL ERROR: MONGO_URI is missing from .env');
    console.error('Please add your MongoDB connection string and restart the server.');
    process.exit(1);
  }
  
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[CodePrep Server] Connected to MongoDB');
  } catch (error) {
    console.error('[CodePrep Server] MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[CodePrep Server] Running on http://localhost:${PORT}`);
    console.log(`[Groq] Model: ${process.env.LLM_MODEL || 'llama-3.3-70b-versatile'}`);
    console.log(`[Groq] Key: ${process.env.GROQ_API_KEY ? 'Configured' : 'MISSING — set GROQ_API_KEY in .env'}`);
  });
});
