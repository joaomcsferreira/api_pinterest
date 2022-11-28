import { Request, Response } from "express"
import { injectable, inject } from "tsyringe"
import { CommentService } from "../services/comment.service"
import { PinService } from "../services/pin.service"
import { UserService } from "../services/user.service"

@injectable()
export class CommentController {
  constructor(
    @inject("ICommentService") private _service: CommentService,
    @inject("IPinService") private _pinService: PinService,
    @inject("IUserService") private _userService: UserService
  ) {}

  async createComment(req: Request, res: Response) {
    try {
      const { id: pinId } = req.params
      const { text } = req.body
      const token = req.headers.authorization!

      const pin = await this._pinService.getPin(pinId)
      const user = await this._userService.getUser(token)

      const result = await this._service.createComment(text, user, pin)

      if (result) {
        await this._pinService.addCommentFromPin(pinId, result.id)
      }

      res.status(200).json({ result })
    } catch (error: any) {
      res.status(500).json({ error: error.message || error.toString() })
    }
  }

  async getComments(req: Request, res: Response) {
    try {
      const { id: pinId } = req.params

      const pin = await this._pinService.getPin(pinId)

      if (!pin) throw new Error("Pin not found.")

      const result = await this._service.getComments(pinId)

      res.status(200).json({ result })
    } catch (error: any) {
      res.status(500).json({ error: error.message || error.toString() })
    }
  }

  async deleteComment(req: Request, res: Response) {
    try {
      const { id: pinId } = req.params
      const { id } = req.body

      const result = await this._service.deleteComment(id)
      const pin = await this._pinService.getPin(pinId)

      if (!pin) throw new Error("Pin not found.")
      if (!result) throw new Error("Comment not found!")

      await this._pinService.removeCommentFromPin(pinId, id)

      res.status(200).json({ result })
    } catch (error: any) {
      res.status(500).json({ error: error.message || error.toString() })
    }
  }
}
