import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    studentName: String,
    quizTitle: String,
    score: Number,
    totalQuestions: Number,
    percentage: Number,
    completedAt: Date
  },
  { timestamps: true }
);

export default mongoose.model("Result", resultSchema);