import { Core } from "./core.model"
import { User } from "./user.model"

export class Pin extends Core {
  title: String
  description: String
  website: String
  board: String
  src: String
  user: User
  comments: Array<Comment>
}
