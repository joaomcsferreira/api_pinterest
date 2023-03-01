import { ObjectId } from "mongoose"
import { User } from "../models/user.model"

import { UserRepository } from "../repositories/user.repository"
import { UserFields } from "../types"
import { decodedToken } from "../helper/encryption"

interface userExistProps {
  type: "email" | "password" | "username" | "id"
  payload: {
    username?: string
    email?: string
    password?: string
    id?: ObjectId | string
  }
}

export class UserService {
  async getUser(token: string): Promise<User | null> {
    const id = decodedToken(token)

    const user = await this.userExist({ type: "id", payload: { id } })

    return user
  }

  async getProfile(username: string): Promise<User | null> {
    const result = await UserRepository.findOne({ username })
      .populate("followers", "avatar username firstName lastName")
      .populate("following", "avatar username firstName lastName")

    return result
  }

  async getToken(email: string, password: string): Promise<string> {
    throw new Error("Method not implemented.")
  }

  async createUser(
    email: string,
    username: string,
    password: string
  ): Promise<User> {
    const result = await UserRepository.create({
      email: email.toLocaleLowerCase(),
      username,
      password,
    })

    return result
  }

  async updateUser(id: ObjectId, user: UserFields): Promise<User | null> {
    const result = await UserRepository.findByIdAndUpdate(id, user)

    return result
  }

  async deleteUser(id: string): Promise<string> {
    await UserRepository.deleteOne({ _id: id })

    return `The User ${id} has been deleted.`
  }

  async followUser(userIDFollowing: string, userIDFollowed: string) {
    await UserRepository.findOneAndUpdate(
      { _id: userIDFollowing },
      { $push: { followers: userIDFollowed } },
      { new: true }
    )

    const response = await UserRepository.findOneAndUpdate(
      { _id: userIDFollowed },
      {
        $push: { following: userIDFollowing },
      },
      { new: true }
    )

    return response
  }

  async unfollowUser(userIDFollowing: string, userIDFollowed: string) {
    await UserRepository.findOneAndUpdate(
      { _id: userIDFollowing },
      { $pull: { followers: userIDFollowed } }
    )

    const response = await UserRepository.findOneAndUpdate(
      { _id: userIDFollowed },
      {
        $pull: { following: userIDFollowing },
      }
    )

    return response
  }

  async userExist({ type, payload }: userExistProps): Promise<User | null> {
    let result

    switch (type) {
      case "email":
        result = await UserRepository.findOne({
          email: payload.email,
        })
          .populate("followers", "avatar username firstName lastName")
          .populate("following", "avatar username firstName lastName")
        break
      case "password":
        result = await UserRepository.findOne({
          email: payload.email,
          password: payload.password,
        })
          .populate("followers", "avatar username firstName lastName")
          .populate("following", "avatar username firstName lastName")
        break
      case "username":
        result = await UserRepository.findOne({
          username: payload.username,
        })
          .populate("followers", "avatar username firstName lastName")
          .populate("following", "avatar username firstName lastName")
        break
      case "id":
        result = await UserRepository.findOne({ _id: payload.id })
          .populate("followers", "avatar username firstName lastName")
          .populate("following", "avatar username firstName lastName")
        break
    }

    return result
  }

  userDisplay = (user: User | null) => {
    if (user) {
      const userDisplay = {
        _id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        followers: user.followers,
        following: user.following,
        createdAt: user.createdAt,
      }

      return userDisplay
    }

    return null
  }
}
