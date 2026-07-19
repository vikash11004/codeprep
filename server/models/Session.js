import mongoose from 'mongoose';

const ProblemHistorySchema = new mongoose.Schema({
  title: String,
  attempts: Number,
  lastAttempt: Date,
  solved: Boolean,
  lastClassification: String,
});

const SessionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  hintShown: { type: Boolean, default: false },
  currentProblemId: { type: String, default: null },
  attempts: { type: Number, default: 0 },
  passed: { type: Number, default: 0 },
  failed: { type: Number, default: 0 },
  failureCategories: {
    misread_problem: { type: Number, default: 0 },
    wrong_approach: { type: Number, default: 0 },
    implementation_bug: { type: Number, default: 0 },
  },
  problemHistory: { type: [ProblemHistorySchema], default: [] },
}, { timestamps: true });

export const Session = mongoose.model('Session', SessionSchema);
