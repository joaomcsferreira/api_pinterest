import { Board } from "./board.model"
import { Core } from "./core.model"
import { Pin } from "./pin.model"

export class User extends Core {
  email: string
  username: string
  password: string
  firstName: string
  lastName: string
  isAdmin: boolean
  avatar: string
  pins: Array<Pin>
  boards: Array<Board>
}
