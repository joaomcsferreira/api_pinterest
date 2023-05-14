import mongoose from "mongoose"
import { Pin } from "../models/pin.model"

const PinSchema = new mongoose.Schema<Pin>({
  title: { type: String, required: true },
  description: { type: String },
  website: { type: String },
  board: { type: mongoose.Schema.Types.ObjectId, ref: "board", required: true },
  src: {
    high: { type: String, required: true },
    medium: { type: String, required: true },
    low: { type: String, required: true },
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "comment" }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: null },
})

export const PinRepository = mongoose.model<Pin>("pin", PinSchema)
