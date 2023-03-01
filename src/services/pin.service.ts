import { ObjectId } from "mongoose"
import { Pin } from "../models/pin.model"

import { PinRepository } from "../repositories/pin.repository"
import { PinFields } from "../types"

export type getTypesProps = "all" | "user" | "board"

interface getPinsProps {
  type: getTypesProps
  user?: string
  board?: string
  total?: number
}

export class PinService {
  async getPins({
    type,
    total,
    user,
    board,
  }: getPinsProps): Promise<Array<Pin>> {
    let response: Array<Pin>

    switch (type) {
      case "all":
        response = await PinRepository.find({}).populate(
          "user",
          "email username firstName lastName avatar"
        )
        break

      case "board":
        response = await PinRepository.find({
          board,
          user,
        }).populate("user", "email username firstName lastName avatar")

        break

      case "user":
        response = await PinRepository.find({ user })
          .populate("user", "email username firstName lastName avatar")
          .populate("board", "name")
        break
    }

    return total ? response.slice(0, total) : response
  }

  async getPin(id: string): Promise<Pin | null> {
    const result = await PinRepository.findOne({ _id: id })
      .populate("user", "email username firstName lastName avatar")
      .populate("board", "name")
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "_id username firstName lastName avatar",
        },
      })
      .populate({
        path: "user",
        populate: {
          path: "followers",
          select: "_id username firstName lastName avatar",
        },
      })

    return result
  }

  async createPin(
    title: String,
    description: String,
    website: String,
    board: ObjectId,
    src: string,
    user: ObjectId
  ): Promise<Pin> {
    const result = await PinRepository.create({
      title,
      description,
      website,
      board,
      src,
      user,
    })

    return result
  }

  async updatePin(id: string, pin: PinFields): Promise<Pin | null> {
    const result = await PinRepository.findByIdAndUpdate(id, pin)

    return result
  }

  async deletePin(id: string, userId: ObjectId): Promise<string> {
    await PinRepository.deleteOne({ _id: id, user: userId })

    return `The Pin ${id} has been deleted.`
  }

  async addCommentFromPin(id: ObjectId, comment: ObjectId) {
    await PinRepository.findOneAndUpdate(
      { _id: id },
      { $push: { comments: comment } },
      { new: true }
    )
  }

  async removeCommentFromPin(id: string, commentId: string) {
    await PinRepository.findOneAndUpdate(
      { _id: id },
      { $pull: { comments: { _id: commentId } } }
    )
  }

  pinDisplay(pin: Pin) {
    const pinDisplay = {
      _id: pin._id,
      title: pin.title,
      description: pin.description,
      website: pin.website,
      board: pin.board,
      src: pin.src,
      user: {
        _id: pin.user._id,
        username: pin.user.username,
        firstName: pin.user.firstName,
        lastName: pin.user.lastName,
        avatar: pin.user.avatar,
        followers: pin.user.followers,
        following: pin.user.following,
      },
      comments: pin.comments,
      createdAt: pin.createdAt,
    }

    return pinDisplay
  }
}
