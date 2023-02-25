import { ObjectId } from "mongoose"
import { Comment } from "../models/comment.model"
import { Pin } from "../models/pin.model"
import { CommentRepository } from "../repositories/comment.repository"

export class CommentService {
  async createComment(
    text: string,
    user: ObjectId,
    pin: ObjectId
  ): Promise<Comment> {
    const result = await CommentRepository.create({ text, user, pin })

    return result
  }

  async getComments(id: string): Promise<Array<Comment>> {
    const result = await CommentRepository.find({ pin: id }).populate(
      "user",
      "email username firstName lastName avatar"
    )

    // const comments = result.map((comment) => this.commentDisplay(comment))

    return result
  }

  async deleteComment(id: string, text: string): Promise<string> {
    await CommentRepository.findOneAndDelete({ _id: id })

    return `The Comment ~ ${text} ~ has been deleted.`
  }

  async getComment(id: string): Promise<Comment | null> {
    const result = await CommentRepository.findOne({ _id: id })

    return result
  }

  commentDisplay(comment: Comment) {
    const commentDisplay = {
      _id: comment.id,
      text: comment.text,
      date: comment.date,
      user: comment.user,
      pin: comment.pin,
    }

    return commentDisplay
  }
}
