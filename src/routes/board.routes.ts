import "reflect-metadata"
import express, { Request, Response } from "express"
import { container } from "tsyringe"
import { BoardController } from "../controllers/board.controller"

const boardRouter = express()
const board = container.resolve(BoardController)

boardRouter
  .route("/board")
  .post((req: Request, res: Response) => board.createBoard(req, res))

boardRouter
  .route("/boards/:username")
  .get((req: Request, res: Response) => board.getBoards(req, res))

boardRouter
  .route("/board")
  .delete((req: Request, res: Response) => board.deleteBoard(req, res))

export default boardRouter
