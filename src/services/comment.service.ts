import { Comment } from "../models/comment.model"
import { Pin } from "../models/pin.model"
import { UserClean } from "../models/user.model"
import { CommentRepository } from "../repositories/comment.repository"

export class CommentService {
  async createComment(
    text: String,
    user: UserClean,
    pin: Pin
  ): Promise<Comment> {
    const result = await CommentRepository.create({ text, user, pin })

    return result as Comment
  }

  async getComments(id: String): Promise<Array<Comment>> {
    const result = await CommentRepository.find({ pin: id }).populate(
      "user",
      "email username"
    )

    return result
  }

  async deleteComment(id: String): Promise<Comment> {
    const result = await CommentRepository.findOneAndDelete({ _id: id })

    return result as Comment
  }
}
