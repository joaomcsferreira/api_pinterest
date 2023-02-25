import { Request, Response } from "express"
import { ObjectId } from "mongoose"
import { injectable, inject } from "tsyringe"
import { CommentService } from "../services/comment.service"
import { PinService } from "../services/pin.service"
import { UserService } from "../services/user.service"
import { cannotBlank } from "../utils/validationFields"

@injectable()
export class CommentController {
  constructor(
    @inject("ICommentService") private _service: CommentService,
    @inject("IPinService") private _pinService: PinService,
    @inject("IUserService") private _userService: UserService
  ) {}

  async createComment(req: Request, res: Response) {
    try {
      const { pinId, text } = req.body
      const token = req.headers.authorization!

      if (!text) throw new Error(cannotBlank("comment"))

      const pin = await this._pinService.getPin(pinId)

      if (!pin) throw new Error("The User you tried to access does not exist.")

      const user = await this._userService.getUser(token)

      if (!user) throw new Error("The User you tried to access does not exist.")

      const result = await this._service.createComment(text, user._id, pin._id)

      if (result) {
        await this._pinService.addCommentFromPin(pinId, result._id)
      }

      res.status(200).json({ result })
    } catch (error: any) {
      res.status(404).json({ error: error.message || error.toString() })
    }
  }

  async getComments(req: Request, res: Response) {
    try {
      const { id } = req.params

      const pin = await this._pinService.getPin(id)

      if (!pin) throw new Error("The Pin you tried to access does not exist.")

      const result = await this._service.getComments(id)

      res.status(200).json({ result })
    } catch (error: any) {
      res.status(404).json({ error: error.message || error.toString() })
    }
  }

  async deleteComment(req: Request, res: Response) {
    try {
      const { id, commentId } = req.params
      const token = req.headers.authorization!

      const pin = await this._pinService.getPin(id)

      if (!pin) throw new Error("The Pin you tried to access does not exist.")

      const comment = await this._service.getComment(commentId)

      if (!comment)
        throw new Error("The Comment you tried to access does not exist.")

      const user = await this._userService.getUser(token)

      if (!user) throw new Error("The User you tried to access does not exist.")

      if (comment.user._id.toString() != user._id.toString())
        throw new Error("You do not have authorization.")

      const result = await this._service.deleteComment(commentId, comment.text)

      await this._pinService.removeCommentFromPin(id, commentId)

      res.status(200).json({ result })
    } catch (error: any) {
      res.status(404).json({ error: error.message || error.toString() })
    }
  }
}
