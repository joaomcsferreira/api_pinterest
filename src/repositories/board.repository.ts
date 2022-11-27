import mongoose from "mongoose"
import { Board } from "../models/board.model"

const BoardSchema = new mongoose.Schema<Board>({
  name: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
})

BoardSchema.index({ name: 1, user: 1 }, { unique: true })

export const BoardRepository = mongoose.model<Board>("board", BoardSchema)
