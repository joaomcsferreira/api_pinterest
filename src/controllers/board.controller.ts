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
      const board = await this._service.getBoard(name, user)

      if (board) throw new Error("Board already exist")

      const result = await this._service.createBoard(name, user)

      res.status(200).json({ result })
    } catch (error: any) {
      res.status(500).json({ error: error.message || error.toString() })
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

      const user = await this._userService.getUser(token)
      const board = await this._service.getBoard(id, user)

      if (!board) throw new Error("Board don't exist!")

      if (user._id != board.user.id) {
        throw new Error("You don't have authorization")
      }

      const result = await this._service.deleteBoard(id)

      res.status(200).json({ result })
    } catch (error: any) {
      res.status(500).json({ error: error.message || error.toString() })
    }
  }
}
