import { Request, Response } from "express"
import { injectable, inject } from "tsyringe"
import { CommentService } from "../services/comment.service"
import { PinService } from "../services/pin.service"
import { UserService } from "../services/user.service"
import { cannotBlank } from "../helper/validationFields"

@injectable()
export class CommentController {
  constructor(
    @inject("ICommentService") private _service: CommentService,
    @inject("IPinService") private _pinService: PinService,
    @inject("IUserService") private _userService: UserService
  ) {}

  async createComment(req: Request, res: Response) {
    try {
      const { text } = req.body
      const pinId = req.params.id as string
      const token = req.headers.authorization!

      console.log(pinId)

      if (!text) throw { code: 400, message: cannotBlank("comment") }

      const pin = await this._pinService.getPin(pinId)

      if (!pin)
        throw {
          code: 404,
          message: "The Pin you tried to access doesn't exist.",
        }

      const user = await this._userService.getUser(token)

      if (!user)
        throw {
          code: 404,
          message:
            "You don't have credentials, please log in with a valid user account.",
        }

      const result = await this._service.createComment(text, user._id, pin._id)

      if (result) {
        await this._pinService.addCommentFromPin(pinId, result._id)
      }

      const comment = this._service.commentDisplay(result)

      res.status(202).json({ ...comment })
    } catch (error: any) {
      res
        .status(error?.code || 500)
        .json({ error: error.message || error.toString() })
    }
  }

  async getComments(req: Request, res: Response) {
    try {
      const { id } = req.params

      const pin = await this._pinService.getPin(id)

      if (!pin)
        throw {
          code: 404,
          message: "The Pin you tried to access doesn't exist.",
        }

      const result = await this._service.getComments(id)

      const comments = result.map((comment) =>
        this._service.commentDisplay(comment)
      )

      res.status(200).json([...comments])
    } catch (error: any) {
      res
        .status(error?.code || 500)
        .json({ error: error.message || error.toString() })
    }
  }

  async deleteComment(req: Request, res: Response) {
    try {
      const { id, commentId } = req.params
      const token = req.headers.authorization!

      const pin = await this._pinService.getPin(id)

      if (!pin)
        throw {
          code: 404,
          message: "The Pin you tried to access doesn't exist.",
        }

      const comment = await this._service.getComment(commentId)

      if (!comment)
        throw {
          code: 404,
          message: "The Comment you tried to access doesn't exist.",
        }

      const user = await this._userService.getUser(token)

      if (!user)
        throw {
          code: 404,
          message:
            "You don't have credentials, please log in with a valid user account.",
        }

      if (comment.user._id.toString() !== user._id.toString())
        throw { code: 401, message: "You do not have authorization." }

      const result = await this._service.deleteComment(commentId, comment.text)

      await this._pinService.removeCommentFromPin(id, commentId)

      res.status(201).json({ result })
    } catch (error: any) {
      res
        .status(error?.code || 500)
        .json({ error: error.message || error.toString() })
    }
  }
}
