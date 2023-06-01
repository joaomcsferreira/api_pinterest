import { Request, Response } from "express"
import { injectable, inject } from "tsyringe"
import { BoardService } from "../services/board.service"
import { UserService } from "../services/user.service"
import { cannotBlank } from "../helper/validationFields"

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

      if (!name) throw { code: 400, message: cannotBlank("name board") }

      const user = await this._userService.getUser(token)

      if (!user)
        throw {
          code: 404,
          message:
            "You don't have credentials, please log in with a valid user account.",
        }

      const board = await this._service.getBoard(name, user._id)

      if (board)
        throw {
          code: 400,
          message:
            "A board with the same name already exists. Please choose a different name for the board and try again.",
        }

      const result = await this._service.createBoard(
        name.replace(/ /g, "-"),
        user
      )

      res.status(200).json({ ...this._service.boardDisplay(result) })
    } catch (error: any) {
      res
        .status(error?.code || 500)
        .json({ error: error.message || error.toString() })
    }
  }

  async getBoards(req: Request, res: Response) {
    try {
      const { username } = req.params

      const user = await this._userService.getProfile(username)

      if (!user)
        throw {
          code: 404,
          message: "The User you tried to access doesn't exist.",
        }

      const result = await this._service.getBoards(user._id)

      const boards = result.map((board) => this._service.boardDisplay(board))

      res.status(202).json([...boards])
    } catch (error: any) {
      res
        .status(error?.code || 500)
        .json({ error: error.message || error.toString() })
    }
  }

  async deleteBoard(req: Request, res: Response) {
    try {
      const { name } = req.params

      const token = req.headers.authorization!

      const user = await this._userService.getUser(token)

      if (!user)
        throw {
          code: 404,
          message:
            "You don't have credentials, please log in with a valid user account.",
        }

      const board = await this._service.getBoard(name, user._id)

      if (!board)
        throw {
          code: 404,
          message:
            "The board you are looking for doesn't exist. Please make sure the name is correct and try again.",
        }

      const result = await this._service.deleteBoard(name, user._id)

      res.status(202).json({ result })
    } catch (error: any) {
      res
        .status(error?.code || 500)
        .json({ error: error.message || error.toString() })
    }
  }
}
