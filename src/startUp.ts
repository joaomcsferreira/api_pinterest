import express, { Application, NextFunction, Request, Response } from "express"
import multer from "multer"
import dotenv from "dotenv"

import "./shared/container"

import Database from "./infra/database"

import userRouter from "./routes/user.routes"
import boardRouter from "./routes/board.routes"
import pinRouter from "./routes/pin.routes"
import commentRouter from "./routes/comment.routes"

dotenv.config()

class StartUp {
  public app: Application
  public upload
  private _db: Database = new Database()

  constructor() {
    this.app = express()
    this.upload = multer()
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))
    this.app.use("/uploads", express.static("./uploads"))
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      res.header("Access-Control-Allow-Origin", "*")
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Authorization, Content-Type, Accept"
      )
      res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE")
      next()
    })
    this._db.createConnection()
    this.routes()
  }

  routes() {
    this.app.route("/").get((request: Request, response: Response) => {
      response.send({ version: "0.0.2" })
    })

    this.app.use("/", userRouter)
    this.app.use("/", boardRouter)
    this.app.use("/", pinRouter)
    this.app.use("/", commentRouter)
  }
}

export default new StartUp()
