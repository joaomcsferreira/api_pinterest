import { Board } from "./board.model"
import { Comment } from "./comment.model"
import { Core } from "./core.model"
import { User } from "./user.model"

export class Pin extends Core {
  title: string
  description: string
  website: string
  src: string
  board: Board
  user: User
  comments: Array<Comment>
}
