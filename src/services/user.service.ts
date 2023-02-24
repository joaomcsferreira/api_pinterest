import { ObjectId } from "mongoose"
import { User } from "../models/user.model"

import { UserRepository } from "../repositories/user.repository"
import { UserFields } from "../types"
import { decodedToken } from "../utils/jwt"

interface userExistProps {
  type: "email" | "password" | "username" | "id"
  payload: {
    username?: string
    email?: string
    password?: string
    id?: ObjectId
  }
}

export class UserService {
  async getUsers(): Promise<Array<User>> {
    const result = await UserRepository.find()

    return result
  }

  async getUser(token: string): Promise<User | null> {
    const id = decodedToken(token)

    const user = await this.userExist({ type: "id", payload: { id } })

    return user
  }

  async getProfile(username: string): Promise<User | null> {
    const result = await UserRepository.findOne({ username })

    return result
  }

  async getToken(email: string, password: string): Promise<string> {
    throw new Error("Method not implemented.")
  }

  async createUser(email: string, password: string): Promise<User> {
    const result = await UserRepository.create({
      email: email.toLocaleLowerCase(),
      username: email.split("@")[0].toLocaleLowerCase(),
      password: password.toLocaleLowerCase(),
    })

    return result
  }

  async updateUser(id: ObjectId, user: UserFields): Promise<User | null> {
    const result = await UserRepository.findByIdAndUpdate(id, user)

    return result
  }

  async deleteUser(username: string): Promise<string> {
    await UserRepository.deleteOne({ username })

    return `The User ${username} has been deleted.`
  }

  async userExist({ type, payload }: userExistProps): Promise<User | null> {
    let result

    switch (type) {
      case "email":
        result = await UserRepository.findOne({ email: payload.email })
        break
      case "password":
        result = await UserRepository.findOne({
          email: payload.email,
          password: payload.password,
        })
        break
      case "username":
        result = await UserRepository.findOne({ username: payload.username })
        break
      case "id":
        result = await UserRepository.findOne({ _id: payload.id })
        break
    }

    return result
  }

  userDisplay = (user: User) => {
    const userDisplay = {
      _id: user._id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      createdAt: user.createdAt,
    }

    return userDisplay
  }
}
