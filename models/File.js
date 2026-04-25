import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    title: String,
    filename: String,
    path: String,
    uploadedBy: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("File", fileSchema);