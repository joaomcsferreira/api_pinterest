import { Request, Response } from "express"
import { injectable, inject } from "tsyringe"
import { BoardService } from "../services/board.service"

import { PinService } from "../services/pin.service"
import { UserService } from "../services/user.service"

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
      const result = await this._service.getPins()

      res.status(200).json({ result })
    } catch (error: any) {
      res.status(500).json({ error: error.message || error.toString() })
    }
  }

  async getPin(req: Request, res: Response) {
    try {
      const { id } = req.params

      const result = await this._service.getPin(id)

      if (!result) throw new Error("Pin not found!")

      res.status(200).json({ result })
    } catch (error: any) {
      res.status(500).json({ error: error.message || error.toString() })
    }
  }

  async createPin(req: Request, res: Response) {
    try {
      const { title, description, website, board: boardName } = req.body
      const src = (req as MulterRequest).file?.path.replaceAll("\\", "/")
      const token = req.headers.authorization!

      const user = await this._userService.getUser(token)
      const board = await this._boardService.getBoard(boardName, user)

      if (!board) throw new Error("Board not exist.")

      const result = await this._service.createPin(
        title,
        description,
        website,
        board,
        src,
        user
      )

      res.status(200).json({ result })
    } catch (error: any) {
      res.status(500).json({ error: error.message || error.toString() })
    }
  }

  async updatePin(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { title, description, website, board: boardName } = req.body
      const token = req.headers.authorization!

      const user = await this._userService.getUser(token)
      const pin = await this._service.getPin(id)
      const board = await this._boardService.getBoard(boardName, user)

      if (!pin) throw new Error("Pin not found.")

      if (user._id != pin.user.id) {
        throw new Error("You don't have authorization.")
      }

      const pinClean = {
        title: title ? title.toLocaleLowerCase() : pin.title,
        description: description
          ? description.toLocaleLowerCase()
          : pin.description,
        website: website ? website.toLocaleLowerCase() : pin.website,
        board: board || pin.board,
      }

      const result = await this._service.updatePin(id, pinClean)

      res.status(200).json({ result })
    } catch (error: any) {
      res.status(500).json({ error: error.message || error.toString() })
    }
  }

  async deletePin(req: Request, res: Response) {
    try {
      const { id } = req.params
      const token = req.headers.authorization!

      const user = await this._userService.getUser(token)
      const pin = await this._service.getPin(id)

      if (!pin) throw new Error("Pin not found.")

      if (user._id != pin.user.id)
        throw new Error("You don't have autorization.")

      const result = await this._service.deletePin(id)

      res.status(200).json({ result })
    } catch (error: any) {
      res.status(500).json({ error: error.message || error.toString() })
    }
  }
}
