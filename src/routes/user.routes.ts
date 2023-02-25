import "reflect-metadata"
import express, { Request, Response } from "express"
import { container } from "tsyringe"
import { UserController } from "../controllers/user.controller"
import { uploadAvatar } from "../utils/multer"

const userRouter = express()
const user = container.resolve(UserController)

userRouter
  .route("/user/:username")
  .get((req: Request, res: Response) => user.getProfile(req, res))

userRouter
  .route("/validate")
  .get((req: Request, res: Response) => user.validateUser(req, res))

userRouter
  .route("/user")
  .post((req: Request, res: Response) => user.createUser(req, res))

userRouter
  .route("/user/token")
  .post((req: Request, res: Response) => user.getToken(req, res))

userRouter
  .route("/user")
  .put(uploadAvatar, (req: Request, res: Response) => user.updateUser(req, res))

userRouter
  .route("/user/:id")
  .delete((req: Request, res: Response) => user.deleteUser(req, res))

userRouter
  .route("/users")
  .get((req: Request, res: Response) => user.getUsers(req, res))

export default userRouter
