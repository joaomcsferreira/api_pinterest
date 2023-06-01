import { Request, Response } from "express"
import { injectable, inject } from "tsyringe"
import { BoardService } from "../services/board.service"

import { PinService } from "../services/pin.service"
import { UserService } from "../services/user.service"
import { PinFields } from "../types"

import { getTypesProps } from "../services/pin.service"
import { cannotBlank } from "../helper/validationFields"

@injectable()
export class PinController {
  constructor(
    @inject("IPinService") private _service: PinService,
    @inject("IUserService") private _userService: UserService,
    @inject("IBoardService") private _boardService: BoardService
  ) {}

  async getPins(req: Request, res: Response) {
    try {
      const { user, board } = req.query as { user: string; board: string }
      const type = (req.query.type as getTypesProps) || "all"
      let total = Number.parseInt(req.query.total as string) || 10
      let page = Number.parseInt(req.query.page as string) || 1

      const userId = await this._userService.userExist({
        type: "username",
        payload: { username: user },
      })

      if (!userId && type === "user")
        throw {
          code: 404,
          message: "The User you tried to access doesn't exist.",
        }

      const boardId = await this._boardService.getBoard(board, userId?._id)

      if (!boardId && type === "board")
        throw {
          code: 404,
          message: "The Board you tried to access doesn't exist.",
        }

      const result = await this._service.getPins({
        type,
        total,
        page,
        user: userId?._id,
        board: boardId?._id,
      })

      const pins = result.map((pin) => this._service.pinDisplay(pin))

      res.status(202).json([...pins])
    } catch (error: any) {
      res
        .status(error?.code || 500)
        .json({ error: error.message || error.toString() })
    }
  }

  async getPin(req: Request, res: Response) {
    try {
      const { id } = req.params

      const result = await this._service.getPin(id)

      if (!result)
        throw {
          code: 404,
          message: "The Pin you tried to access doesn't exist.",
        }

      res.status(202).json({ ...this._service.pinDisplay(result) })
    } catch (error: any) {
      res
        .status(error?.code || 500)
        .json({ error: error.message || error.toString() })
    }
  }

  async createPin(req: Request, res: Response) {
    try {
      const { title, description, website, board: boardName } = req.body
      const file = req.file
      const token = req.headers.authorization!

      if (!boardName) throw { code: 400, message: cannotBlank("board") }
      if (!title) throw { code: 400, message: cannotBlank("title") }

      const user = await this._userService.getUser(token)

      if (!user)
        throw {
          code: 404,
          message:
            "You don't have credentials, please log in with a valid user account.",
        }

      const board = await this._boardService.getBoard(boardName, user._id)

      if (!board)
        throw {
          code: 404,
          message: "The Board you tried to access doesn't exist.",
        }

      const result = await this._service.createPin(
        title,
        description,
        website,
        board._id,
        file,
        user._id
      )

      res.status(201).json({ ...this._service.pinDisplay(result) })
    } catch (error: any) {
      res
        .status(error?.code || 500)
        .json({ error: error.message || error.toString() })
    }
  }

  async updatePin(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { title, description, website, board: boardName } = req.body
      const token = req.headers.authorization!

      const user = await this._userService.getUser(token)

      if (!user)
        throw {
          code: 404,
          message:
            "You don't have credentials, please log in with a valid user account.",
        }

      const current_pin = await this._service.getPin(id)

      if (!current_pin)
        throw {
          code: 404,
          message: "The Pin you tried to access doesn't exist.",
        }

      const board = await this._boardService.getBoard(boardName, user._id)

      if (!board && boardName)
        throw {
          code: 404,
          message: "The Board you tried to access doesn't exist.",
        }

      if (user._id.toString() !== current_pin.user._id.toString())
        throw { code: 401, message: "You don't have authorization." }

      const pin: PinFields = {
        title: title ? title.toLocaleLowerCase() : current_pin.title,
        description: description
          ? description.toLocaleLowerCase()
          : current_pin.description,
        website: website ? website.toLocaleLowerCase() : current_pin.website,
        board: board || current_pin.board,
      }

      const result = await this._service.updatePin(id, pin)

      const pinResult = this._service.pinDisplay(result!)

      res.status(202).json({ ...pinResult })
    } catch (error: any) {
      res
        .status(error?.code || 500)
        .json({ error: error.message || error.toString() })
    }
  }

  async deletePin(req: Request, res: Response) {
    try {
      const { id } = req.params
      const token = req.headers.authorization!

      const user = await this._userService.getUser(token)

      if (!user)
        throw {
          code: 404,
          message:
            "You don't have credentials, please log in with a valid user account.",
        }

      const pin = await this._service.getPin(id)

      if (!pin)
        throw {
          code: 404,
          message: "The Pin you tried to access doesn't exist.",
        }

      if (pin.user._id.toString() != user._id.toString())
        throw { code: 401, message: "You do not have authorization." }

      const result = await this._service.deletePin(id, user._id)

      res.status(200).json({ result })
    } catch (error: any) {
      res
        .status(error?.code || 500)
        .json({ error: error.message || error.toString() })
    }
  }
}
