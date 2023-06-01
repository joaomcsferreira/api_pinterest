import express, { Application, NextFunction, Request, Response } from "express"
import dotenv from "dotenv"

import "./shared/container"

import Database from "./infra/database"

import userRouter from "./routes/user.routes"
import boardRouter from "./routes/board.routes"
import pinRouter from "./routes/pin.routes"
import commentRouter from "./routes/comment.routes"

import documentationRouter from "./routes/documentation.routes"

dotenv.config()

class StartUp {
  public app: Application
  private _db: Database = new Database()

  constructor() {
    this.app = express()
    this.app.use(express.json({ limit: "10mb" }))
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }))
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
    this.app.use("/", userRouter)
    this.app.use("/", boardRouter)
    this.app.use("/", pinRouter)
    this.app.use("/", commentRouter)
    this.app.use("/", documentationRouter)
  }
}

export default new StartUp()
