import { ObjectId } from "mongoose"
import { Board } from "../models/board.model"
import { Pin } from "../models/pin.model"
import { User } from "../models/user.model"

interface UserFields {
  email: string
  username: string
  firstName: string
  lastName: string
  avatar: string
}

interface BoardFields {
  _id: ObjectId
  name: string
  user: User
  createdAt: Date
}

interface PinFields {
  title: string
  description: string
  website: string
  board: Board
}

interface CommentFields {
  _id: ObjectId
  text: string
  date: Date
  user: User
  pin: Pin
}

export { UserFields, BoardFields, PinFields, CommentFields }
