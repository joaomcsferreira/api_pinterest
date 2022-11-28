import { Board } from "../models/board.model"
import { Pin } from "../models/pin.model"
import { UserClean } from "../models/user.model"
import { PinRepository } from "../repositories/pin.repository"

interface pinCleanProps {
  title: String
  description: String
  website: String
  board: Board
}

export class PinService {
  async getPins(): Promise<Array<Pin>> {
    const result = await PinRepository.find({})
      .populate("user", "email username")
      .populate("board", "name")
      .populate("comments", "text user")

    return result
  }

  async getPin(id: String): Promise<Pin> {
    const result = await PinRepository.findOne({ _id: id })
      .populate("user", "email username")
      .populate("board", "name")
      .populate("comments", "text user")

    return result as Pin
  }

  async createPin(
    title: String,
    description: String,
    website: String,
    board: Board,
    src: string,
    user: UserClean
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

  async updatePin(id: String, pinClean: pinCleanProps): Promise<Pin> {
    const result = await PinRepository.findByIdAndUpdate(id, pinClean)

    return result as Pin
  }

  async deletePin(id: String): Promise<Pin> {
    const result = await PinRepository.findByIdAndDelete(id)

    return result as Pin
  }

  async addCommentFromPin(id: String, comment: String): Promise<Pin> {
    const result = await PinRepository.findOneAndUpdate(
      { _id: id },
      { $push: { comments: comment } },
      { new: true }
    )

    return result as Pin
  }

  async removeCommentFromPin(pinId: String, id: String): Promise<Pin> {
    const result = await PinRepository.findOneAndUpdate(
      { _id: pinId },
      { $pull: { comments: { _id: id } } }
    )

    return result as Pin
  }
}
