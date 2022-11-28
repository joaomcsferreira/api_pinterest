import mongoose from "mongoose"
import { Pin } from "../models/pin.model"

const PinSchema = new mongoose.Schema<Pin>({
  title: { type: String, required: true },
  description: { type: String },
  website: { type: String },
  board: { type: mongoose.Schema.Types.ObjectId, ref: "board", required: true },
  src: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "comment" }],
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
})

export const PinRepository = mongoose.model<Pin>("pin", PinSchema)
