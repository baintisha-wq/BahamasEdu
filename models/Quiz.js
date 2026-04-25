import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    title: String,

    questions: [
      {
        question: String,
        options: [String],
        correct: Number
      }
    ],

    closesAt: Date
  },
  { timestamps: true }
);

export default mongoose.model("Quiz", quizSchema);