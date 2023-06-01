import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage"
import { ObjectId } from "mongoose"
import { storage } from "../infra/firebase"
import { Pin } from "../models/pin.model"

import { PinRepository } from "../repositories/pin.repository"
import { PinFields } from "../types"

import sharp from "sharp"
import { getStorageOptions } from "../helper/multer"

export type getTypesProps = "all" | "user" | "board"

interface getPinsProps {
  type: getTypesProps
  user?: string
  board?: string
  total: number
  page: number
}

export class PinService {
  async getPins({
    type,
    total,
    page,
    user,
    board,
  }: getPinsProps): Promise<Array<Pin>> {
    let response: Array<Pin>

    switch (type) {
      case "all":
        response = await PinRepository.find({})
          .sort({ createdAt: -1 })
          .skip((page - 1) * total)
          .limit(total)
          .populate("user", "email username firstName lastName avatar")
        break

      case "board":
        response = await PinRepository.find({
          board,
          user,
        })
          .sort({ createdAt: -1 })
          .skip((page - 1) * total)
          .limit(total)
          .populate("user", "email username firstName lastName avatar")

        break

      case "user":
        response = await PinRepository.find({ user })
          .sort({ createdAt: -1 })
          .skip((page - 1) * total)
          .limit(total)
          .populate("user", "email username firstName lastName avatar")
          .populate("board", "name")
        break
    }

    return response
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
    file: Express.Multer.File | undefined,
    user: ObjectId
  ): Promise<Pin> {
    if (file) {
      const { nameImage, metadata, buffer } = getStorageOptions(file)

      const hightSizeBuffer = await sharp(buffer).toBuffer()
      const highFileRef = ref(storage, `uploads/pin/${nameImage}+high`)
      const highSnapshot = await uploadBytesResumable(
        highFileRef,
        hightSizeBuffer,
        metadata
      )

      const mediumSizeBuffer = await sharp(buffer)
        .resize({ width: 320 })
        .toBuffer()
      const mediumFileRef = ref(storage, `uploads/pin/${nameImage}+medium`)
      const mediumSnapshot = await uploadBytesResumable(
        mediumFileRef,
        mediumSizeBuffer,
        metadata
      )

      const lowSizeBuffer = await sharp(buffer)
        .resize({ width: 160 })
        .toBuffer()
      const lowFileRef = ref(storage, `uploads/pin/${nameImage}+low`)
      const lowSnapshot = await uploadBytesResumable(
        lowFileRef,
        lowSizeBuffer,
        metadata
      )

      const highSizeFile = await getDownloadURL(highSnapshot.ref)
      const mediumSizeFile = await getDownloadURL(mediumSnapshot.ref)
      const lowSizeFile = await getDownloadURL(lowSnapshot.ref)

      const result = await PinRepository.create({
        title,
        description,
        website,
        board,
        src: {
          high: highSizeFile,
          medium: mediumSizeFile,
          low: lowSizeFile,
        },
        user,
      })

      return result.populate("user", "username firstName lastName avatar")
    } else throw { code: 400, message: "Pin is required." }
  }

  async updatePin(id: string, pin: PinFields): Promise<Pin | null> {
    const result = await PinRepository.findByIdAndUpdate(
      id,
      {
        ...pin,
        updatedAt: Date.now(),
      },
      { returnDocument: "after" }
    )

    return result
  }

  async deletePin(id: string, userId: ObjectId): Promise<string> {
    await PinRepository.deleteOne({ _id: id, user: userId })

    return `The Pin ${id} has been deleted.`
  }

  async addCommentFromPin(id: string, comment: ObjectId) {
    await PinRepository.findOneAndUpdate(
      { _id: id },
      { $push: { comments: comment } },
      { new: true, returnDocument: "after" }
    )
  }

  async removeCommentFromPin(id: string, commentId: string) {
    await PinRepository.findOneAndUpdate(
      { _id: id },
      { $pull: { comments: commentId } },
      { returnDocument: "after" }
    )
  }

  pinDisplay(pin: Pin) {
    const pinDisplay = {
      _id: pin._id,
      title: pin.title,
      description: pin.description || "",
      website: pin.website || "",
      board: pin.board,
      src: pin.src,
      user: {
        _id: pin.user._id,
        username: pin.user.username,
        firstName: pin.user.firstName || "",
        lastName: pin.user.lastName || "",
        avatar: pin.user.avatar || "",
        followers: pin.user.followers,
        following: pin.user.following,
      },
      comments: pin.comments.map((comment) => ({
        _id: comment._id,
        text: comment.text,
        date: comment.date,
        user: {
          _id: comment.user._id,
          username: comment.user.username,
          firstName: comment.user.firstName || "",
          lastName: comment.user.lastName || "",
          avatar: comment.user.avatar || "",
        },
      })),
      createdAt: pin.createdAt,
    }

    return pinDisplay
  }
}
