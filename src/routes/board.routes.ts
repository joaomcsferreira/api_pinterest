import "reflect-metadata"
import { container } from "tsyringe"
import express, { Request, Response } from "express"

import { BoardController } from "../controllers/board.controller"
import permission from "../middlewares/user.middleware"

const boardRouter = express()
const board = container.resolve(BoardController)

boardRouter
  .route("/board")
  .post(permission, (req: Request, res: Response) =>
    board.createBoard(req, res)
  )

boardRouter
  .route("/boards/:username")
  .get((req: Request, res: Response) => board.getBoards(req, res))

boardRouter
  .route("/board/:name")
  .delete(permission, (req: Request, res: Response) =>
    board.deleteBoard(req, res)
  )

export default boardRouter
