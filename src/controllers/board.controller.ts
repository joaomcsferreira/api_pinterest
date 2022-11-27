import { Request, Response } from "express"
import { injectable, inject } from "tsyringe"
import { BoardService } from "../services/board.service"
import { UserService } from "../services/user.service"

@injectable()
export class BoardController {
  constructor(
    @inject("IBoardService") private _service: BoardService,
    @inject("IUserService") private _userService: UserService
  ) {}

  async createBoard(req: Request, res: Response) {
    try {
      const { name } = req.body
      const token = req.headers.authorization!

      const user = await this._userService.getUser(token)

      const result = await this._service.createBoard(name, user)

      res.status(200).json({ result })
    } catch (error: any) {
      if (["E11000", "name"].every((value) => error.message.includes(value)))
        error.message = "Board already exist"
      else error.message = error.toString()
      res.status(500).json({ error: error.message })
    }
  }

  async getBoards(req: Request, res: Response) {
    try {
      const { id } = req.params

      const result = await this._service.getBoards(id)

      res.status(200).json({ result })
    } catch (error: any) {
      res.status(500).json({ error: error.message || error.toString() })
    }
  }

  async deleteBoard(req: Request, res: Response) {
    try {
      const { id } = req.params

      const token = req.headers.authorization!

      const { _id: userId } = await this._userService.getUser(token)
      const boardUserId = await this._service.getBoardUser(id)

      if (!boardUserId) throw new Error("Board don't exist!")

      if (userId != boardUserId) {
        throw new Error("You don't have authorization")
      }

      const result = await this._service.deleteBoard(id)

      res.status(200).json({ result })
    } catch (error: any) {
      res.status(500).json({ error: error.message || error.toString() })
    }
  }
}
