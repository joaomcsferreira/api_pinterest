import { Core } from "./core.model"
import { Pin } from "./pin.model"
import { User } from "./user.model"

export class Board extends Core {
  name: string
  user: User
  pins: Array<Pin>
}
