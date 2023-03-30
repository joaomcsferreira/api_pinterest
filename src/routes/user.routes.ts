import "reflect-metadata"
import { container } from "tsyringe"
import express, { Request, Response } from "express"

import { UserController } from "../controllers/user.controller"
import permission from "../middlewares/user.middleware"

const userRouter = express()
const user = container.resolve(UserController)

userRouter
  .route("/user/:username")
  .get((req: Request, res: Response) => user.getProfile(req, res))

userRouter
  .route("/validate")
  .get(permission, (req: Request, res: Response) => user.validateUser(req, res))

userRouter
  .route("/user")
  .post((req: Request, res: Response) => user.createUser(req, res))

userRouter
  .route("/user/token")
  .post((req: Request, res: Response) => user.getToken(req, res))

userRouter
  .route("/user")
  .put(permission, (req: Request, res: Response) => user.updateUser(req, res))

userRouter
  .route("/user/:id")
  .delete(permission, (req: Request, res: Response) =>
    user.deleteUser(req, res)
  )

userRouter
  .route("/follow")
  .put(permission, (req: Request, res: Response) => user.followUser(req, res))

userRouter
  .route("/unfollow")
  .put(permission, (req: Request, res: Response) => user.unfollowUser(req, res))

export default userRouter
