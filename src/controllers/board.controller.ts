import { Request, Response } from "express"
import { injectable, inject } from "tsyringe"
import { BoardService } from "../services/board.service"
import { UserService } from "../services/user.service"
import { cannotBlank } from "../utils/validationFields"

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

      if (!name) throw new Error(cannotBlank("name board"))

      const user = await this._userService.getUser(token)

      if (!user) throw new Error("The User you tried to access does not exist.")

      const board = await this._service.getBoard(name, user._id)

      if (board)
        throw new Error(
          "A board with the same name already exists. Please choose a different name for the board and try again."
        )

      const result = await this._service.createBoard(name, user)

      res.status(200).json({ result })
    } catch (error: any) {
      res.status(401).json({ error: error.message || error.toString() })
    }
  }

  async getBoards(req: Request, res: Response) {
    try {
      const { username } = req.params

      const user = await this._userService.getProfile(username)

      if (!user) throw new Error("The User you tried to access does not exist.")

      const result = await this._service.getBoards(user._id)

      res.status(202).json({ result })
    } catch (error: any) {
      res.status(404).json({ error: error.message || error.toString() })
    }
  }

  async deleteBoard(req: Request, res: Response) {
    try {
      const { name } = req.params

      const token = req.headers.authorization!

      const user = await this._userService.getUser(token)

      if (!user) throw new Error("The User you tried to access does not exist.")

      const board = await this._service.getBoard(name, user._id)

      if (!board)
        throw new Error(
          "The board you are looking for does not exist. Please make sure the name is correct and try again."
        )

      const result = await this._service.deleteBoard(name, user._id)

      res.status(200).json({ result })
    } catch (error: any) {
      res.status(404).json({ error: error.message || error.toString() })
    }
  }
}
