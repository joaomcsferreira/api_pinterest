import mongoose from "mongoose"
import { Board } from "../models/board.model"

const BoardSchema = new mongoose.Schema<Board>({
  name: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: null },
  pins: [{ type: mongoose.Schema.Types.ObjectId, ref: "board" }],
})

export const BoardRepository = mongoose.model<Board>("board", BoardSchema)
