import { User, UserClean } from "../models/user.model"
import { UserRepository } from "../repositories/user.repository"
import { decodedToken } from "../utils/jwt"

interface userExistProps {
  username?: string
  password?: string
  email?: string
  id?: string
}

export class UserService {
  async getUser(token: string): Promise<UserClean> {
    const userId = decodedToken(token)

    const user = await this.userExist({ id: userId })

    return user
  }

  async getProfile(username: String): Promise<UserClean> {
    const result = await UserRepository.findOne({ username })

    const cleanUser: UserClean = {
      _id: result?._id,
      email: result?.email || "",
      username: result?.username || "",
      firstName: result?.firstName || "",
      lastName: result?.lastName || "",
      avatar: result?.avatar || "",
    }

    return cleanUser
  }

  async getToken(email: String, password: String): Promise<String> {
    throw new Error("Method not implemented.")
  }

  async createUser(
    email: String,
    password: String,
    username: String
  ): Promise<UserClean> {
    let result = await UserRepository.create({
      email: email.toLocaleLowerCase(),
      password: password.toLocaleLowerCase(),
      username: username.toLocaleLowerCase(),
    })

    return result
  }

  async updateUser(id: String, user: UserClean): Promise<User> {
    const result = await UserRepository.findByIdAndUpdate(id, user)

    return result as User
  }

  async deleteUser(id: String): Promise<User> {
    const result = await UserRepository.findByIdAndDelete(id)

    return result as User
  }

  async userExist({
    username,
    password,
    email,
    id,
  }: userExistProps): Promise<UserClean> {
    let result

    if (username) result = await UserRepository.findOne({ username })
    else if (email) result = await UserRepository.findOne({ email, password })
    else result = await UserRepository.findOne({ _id: id })

    const cleanUser: UserClean = {
      _id: result?._id,
      email: result?.email || "",
      username: result?.username || "",
      firstName: result?.firstName || "",
      lastName: result?.lastName || "",
      avatar: result?.avatar || "",
    }

    return cleanUser
  }
}
