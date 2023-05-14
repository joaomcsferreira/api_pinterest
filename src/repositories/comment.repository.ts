import mongoose from "mongoose"
import { Comment } from "../models/comment.model"

const CommentSchema = new mongoose.Schema<Comment>({
  text: { type: String, required: true },
  date: { type: Date, default: new Date() },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  pin: { type: mongoose.Schema.Types.ObjectId, ref: "pin", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: null },
})

export const CommentRepository = mongoose.model<Comment>(
  "comment",
  CommentSchema
)
