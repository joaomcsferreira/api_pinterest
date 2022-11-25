import { Core } from "./core.model"

export class User extends Core {
  email: String
  username: String
  password: String
  firstName: String
  lastName: String
  avatar: String
}

export class UserClean {
  _id: String
  email: String
  username: String
  firstName: String
  lastName: String
  avatar: String
}
