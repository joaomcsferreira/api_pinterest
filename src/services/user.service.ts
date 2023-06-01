import { ObjectId } from "mongoose"
import { User } from "../models/user.model"

import { UserRepository } from "../repositories/user.repository"
import { UserFields } from "../types"
import { decodedToken } from "../helper/encryption"

import sharp from "sharp"
import { storage } from "../infra/firebase"
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage"
import { getStorageOptions } from "../helper/multer"

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

  async updateUser(
    id: ObjectId,
    user: UserFields,
    file: Express.Multer.File | undefined
  ): Promise<User | null> {
    const { nameImage, metadata, buffer } = getStorageOptions(file)

    if (file) {
      const imageSizeBuffer = await sharp(buffer)
        .resize({ width: 320 })
        .toBuffer()
      const imageRef = ref(storage, `uplaods/user/${nameImage}`)
      const snapshot = await uploadBytesResumable(
        imageRef,
        imageSizeBuffer,
        metadata
      )

      user.avatar = await getDownloadURL(snapshot.ref)
    }

    const result = await UserRepository.findByIdAndUpdate(
      id,
      {
        ...user,
        updatedAt: Date.now(),
      },
      { returnDocument: "after" }
    )

    return result
  }

  async deleteUser(id: string): Promise<string> {
    await UserRepository.findByIdAndDelete({ _id: id })

    return `The User ${id} has been deleted.`
  }

  async followUser(userToFollow: string, user: string) {
    await UserRepository.findOneAndUpdate(
      { _id: userToFollow },
      { $push: { followers: user } },
      { new: true }
    )

    const response = await UserRepository.findOneAndUpdate(
      { _id: user },
      {
        $push: { following: userToFollow },
      },
      { new: true, returnDocument: "after" }
    )
      .populate("followers", "avatar username firstName lastName")
      .populate("following", "avatar username firstName lastName")

    return response
  }

  async unfollowUser(userToUnfollow: string, user: string) {
    await UserRepository.findOneAndUpdate(
      { _id: userToUnfollow },
      { $pull: { followers: user } },
      { new: true }
    )

    const response = await UserRepository.findOneAndUpdate(
      { _id: user },
      {
        $pull: { following: userToUnfollow },
      },
      { new: true, returnDocument: "after" }
    )
      .populate("followers", "avatar username firstName lastName")
      .populate("following", "avatar username firstName lastName")

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
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        avatar: user.avatar || "",
        followers: user.followers,
        following: user.following,
        createdAt: user.createdAt,
      }

      return userDisplay
    }

    return null
  }
}
