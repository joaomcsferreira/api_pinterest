import { Request, Response } from "express"
import { injectable, inject } from "tsyringe"
import { BoardService } from "../services/board.service"

import { PinService } from "../services/pin.service"
import { UserService } from "../services/user.service"
import { PinFields } from "../types"

import { getTypesProps } from "../services/pin.service"
import { cannotBlank } from "../helper/validationFields"

interface MulterRequest extends Request {
  file: any
}

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
      const total = Number.parseInt(req.query.total as string)
      const type = req.query.type as getTypesProps

      const userId = await this._userService.userExist({
        type: "username",
        payload: { username: user },
      })

      if (!userId && type === "user")
        throw new Error("The User you tried to access does not exist.")

      const boardId = await this._boardService.getBoard(board, userId?._id)

      if (!boardId && type === "board")
        throw new Error("The Board you tried to access does not exist.")

      const result = await this._service.getPins({
        type,
        total,
        user: userId?._id,
        board: boardId?._id,
      })

      res.status(202).json({ result })
    } catch (error: any) {
      res.status(500).json({ error: error.message || error.toString() })
    }
  }

  async getPin(req: Request, res: Response) {
    try {
      const { id } = req.params

      const result = await this._service.getPin(id)

      if (!result) throw new Error("The Pin you tried to access doesn't exist.")

      res.status(202).json({ result: this._service.pinDisplay(result) })
    } catch (error: any) {
      res.status(404).json({ error: error.message || error.toString() })
    }
  }

  async createPin(req: Request, res: Response) {
    try {
      const { title, description, website, board: boardName } = req.body
      const src = (req as MulterRequest).file?.path.replace(/\\/g, "/")
      const token = req.headers.authorization!

      if (!boardName) throw new Error(cannotBlank("board"))
      if (!title) throw new Error(cannotBlank("title"))

      const user = await this._userService.getUser(token)

      if (!user) throw new Error("The User you tried to access does not exist.")

      const board = await this._boardService.getBoard(boardName, user._id)

      if (!board)
        throw new Error("The Board you tried to access does not exist.")

      const result = await this._service.createPin(
        title,
        description,
        website,
        board._id,
        src,
        user._id
      )

      res.status(201).json({ result: this._service.pinDisplay(result) })
    } catch (error: any) {
      res.status(404).json({ error: error.message || error.toString() })
    }
  }

  async updatePin(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { title, description, website, board: boardName } = req.body
      const token = req.headers.authorization!

      const user = await this._userService.getUser(token)

      if (!user) throw new Error("The User you tried to access does not exist.")

      const current_pin = await this._service.getPin(id)

      if (!current_pin)
        throw new Error("The Pin you tried to access does not exist.")

      const board = await this._boardService.getBoard(boardName, user._id)

      if (!board && boardName)
        throw new Error("The Board you tried to access does not exist.")

      const pin: PinFields = {
        title: title ? title.toLocaleLowerCase() : current_pin.title,
        description: description
          ? description.toLocaleLowerCase()
          : current_pin.description,
        website: website ? website.toLocaleLowerCase() : current_pin.website,
        board: board || current_pin.board,
      }

      const result = await this._service.updatePin(id, pin)

      res.status(202).json({ result })
    } catch (error: any) {
      res.status(401).json({ error: error.message || error.toString() })
    }
  }

  async deletePin(req: Request, res: Response) {
    try {
      const { id } = req.params
      const token = req.headers.authorization!

      const user = await this._userService.getUser(token)

      if (!user) throw new Error("The User you tried to access does not exist.")

      const pin = await this._service.getPin(id)

      if (!pin) throw new Error("The Pin you tried to access does not exist.")

      if (pin.user._id.toString() != user._id.toString())
        throw new Error("You do not have authorization.")

      const result = await this._service.deletePin(id, user._id)

      res.status(200).json({ result })
    } catch (error: any) {
      res.status(404).json({ error: error.message || error.toString() })
    }
  }
}
