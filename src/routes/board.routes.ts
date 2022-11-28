import "reflect-metadata"
import express, { Request, Response } from "express"
import { container } from "tsyringe"
import { BoardController } from "../controllers/board.controller"

const boardRouter = express()
const board = container.resolve(BoardController)

boardRouter
  .route("/api/v1/board")
  .post((req: Request, res: Response) => board.createBoard(req, res))

boardRouter
  .route("/api/v1/user/:id/boards")
  .get((req: Request, res: Response) => board.getBoards(req, res))

boardRouter
  .route("/api/v1/board/:id")
  .delete((req: Request, res: Response) => board.deleteBoard(req, res))

export default boardRouter
