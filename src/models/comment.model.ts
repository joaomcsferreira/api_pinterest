import { Core } from "./core.model"
import { Pin } from "./pin.model"
import { User } from "./user.model"

export class Comment extends Core {
  text: string
  date: Date
  user: User
  pin: Pin
}
