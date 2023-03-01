import "reflect-metadata"
import express, { Request, Response } from "express"
import { container } from "tsyringe"
import { CommentController } from "../controllers/comment.controller"
import permission from "../middlewares/user.middleware"

const commentRouter = express()
const comment = container.resolve(CommentController)

commentRouter
  .route("/comment")
  .post(permission, (req: Request, res: Response) =>
    comment.createComment(req, res)
  )

commentRouter
  .route("/pin/:id/comments")
  .get((req: Request, res: Response) => comment.getComments(req, res))

commentRouter
  .route("/pin/:id/comment/:commentId")
  .delete(permission, (req: Request, res: Response) =>
    comment.deleteComment(req, res)
  )

export default commentRouter
