import mongoose, { Schema } from "mongoose"
import { User } from "../models/user.model"
import { BoardRepository } from "./board.repository"
import { CommentRepository } from "./comment.repository"
import { PinRepository } from "./pin.repository"

const UserSchema = new mongoose.Schema<User>({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  avatar: { type: String },
  pins: [{ type: mongoose.Schema.Types.ObjectId, ref: "pin" }],
  boards: [{ type: mongoose.Schema.Types.ObjectId, ref: "board" }],
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
})

export const UserRepository = mongoose.model<User>("user", UserSchema)
